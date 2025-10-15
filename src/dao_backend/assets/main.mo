import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Nat32 "mo:base/Nat32";
import Char "mo:base/Char";

persistent actor AssetCanister {
    type Result<T, E> = Result.Result<T, E>;
    type Time = Time.Time;

    // Asset types
    public type AssetId = Nat;
    public type AssetData = Blob;
    
    public type Asset = {
        id: AssetId;
        name: Text;
        contentType: Text;
        size: Nat;
        data: AssetData;
        uploadedBy: Principal;
        uploadedAt: Time;
        isPublic: Bool;
        tags: [Text];
    };

    public type AssetMetadata = {
        id: AssetId;
        name: Text;
        contentType: Text;
        size: Nat;
        uploadedBy: Principal;
        uploadedAt: Time;
        isPublic: Bool;
        tags: [Text];
    };

    public type AssetError = {
        #notFound;
        #notAuthorized;
        #invalidInput;
        #storageFull;
        #fileTooLarge;
        #unsupportedFormat;
    };

    // Stable storage for upgrades
    private var nextAssetId : Nat = 1;
    private var assetsEntries : [(AssetId, Asset)] = [];
    private var authorizedUploaders : [Principal] = [];
    private var maxFileSize : Nat = 10_000_000; // 10MB default
    private var maxTotalStorage : Nat = 1_000_000_000; // 1GB default
    private var currentStorageUsed : Nat = 0;
    private var allowOpenUploads : Bool = false; // permit uploads with empty authorizedUploaders

    // Runtime storage
    private transient var assets = HashMap.HashMap<AssetId, Asset>(100, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private transient var uploaderAssets = HashMap.HashMap<Principal, [AssetId]>(50, Principal.equal, Principal.hash);

    // Supported content types
    private transient let supportedTypes = [
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
        "application/pdf", "text/plain", "text/html", "text/css", "text/javascript",
        "application/json", "application/xml", "video/mp4", "audio/mpeg", "audio/wav"
    ];

    // System functions for upgrades and initialization

    // During installation the deployer can optionally supply an initial
    // principal that is immediately granted upload permissions. The deployer
    // can also enable `allowOpenUploads` to permit anyone to upload assets
    // when no authorized uploaders are configured. By default open uploads are
    // disabled, meaning attempts to upload assets will be rejected until at
    // least one uploader has been authorized. If omitted, the list of
    // authorized uploaders starts empty and can be populated later via
    // `addAuthorizedUploader`.
    public shared ({caller = _}) func init(initialUploader : ?Principal, openUploads : Bool) : async () {
        switch (initialUploader) {
            case (?p) { authorizedUploaders := [p] };
            case null {};
        };
        allowOpenUploads := openUploads;
    };

    system func preupgrade() {
        assetsEntries := Iter.toArray(assets.entries());
    };

    system func postupgrade() {
        assets := HashMap.fromIter<AssetId, Asset>(
            assetsEntries.vals(), 
            assetsEntries.size(), 
            Nat.equal, 
            func(n: Nat) : Nat32 { Nat32.fromNat(n) }
        );
        
        // Rebuild uploader assets mapping
        for ((assetId, asset) in assets.entries()) {
            let currentAssets = switch (uploaderAssets.get(asset.uploadedBy)) {
                case (?assets) assets;
                case null [];
            };
            let updatedAssets = Array.append<AssetId>(currentAssets, [assetId]);
            uploaderAssets.put(asset.uploadedBy, updatedAssets);
        };
    };

    // Public functions

    // Upload an asset.
    // Only authenticated users (logged in with Internet Identity) can upload.
    // Anonymous users are rejected to prevent spam and abuse.
    public shared(msg) func uploadAsset(
        name: Text,
        contentType: Text,
        data: AssetData,
        isPublic: Bool,
        tags: [Text]
    ) : async Result<AssetId, Text> {
        let caller = msg.caller;
        
        // Only allow authenticated users (Internet Identity)
        if (Principal.isAnonymous(caller)) {
            return #err("Please authenticate with Internet Identity to upload assets");
        };
        
        let dataSize = data.size();

        // Validate input
        if (name == "") {
            return #err("Asset name cannot be empty");
        };

        if (dataSize == 0) {
            return #err("Asset data cannot be empty");
        };

        // IC message size limit is 2MB
        if (dataSize > 2_097_152) {
            return #err("File too large. Maximum size is 2MB");
        };

        if (dataSize > maxFileSize) {
            return #err("File size exceeds maximum allowed size");
        };

        if (currentStorageUsed + dataSize > maxTotalStorage) {
            return #err("Storage limit exceeded");
        };

        // Check if content type is supported
        let isSupported = Array.find<Text>(supportedTypes, func(t) = t == contentType);
        if (isSupported == null) {
            return #err("Unsupported content type: " # contentType);
        };

        let assetId = nextAssetId;
        nextAssetId += 1;

        let asset : Asset = {
            id = assetId;
            name = name;
            contentType = contentType;
            size = dataSize;
            data = data;
            uploadedBy = caller;
            uploadedAt = Time.now() / 1_000_000;
            isPublic = isPublic;
            tags = tags;
        };

        assets.put(assetId, asset);
        currentStorageUsed += dataSize;

        // Update uploader assets mapping
        let currentAssets = switch (uploaderAssets.get(caller)) {
            case (?assets) assets;
            case null [];
        };
        let updatedAssets = Array.append<AssetId>(currentAssets, [assetId]);
        uploaderAssets.put(caller, updatedAssets);

        Debug.print("Asset uploaded: " # name # " (ID: " # Nat.toText(assetId) # ")");
        #ok(assetId)
    };

    // Get asset data
    public shared(msg) func getAsset(assetId: AssetId) : async Result<Asset, Text> {
        let caller = msg.caller;
        
        switch (assets.get(assetId)) {
            case (?asset) {
                // Check access permissions
                if (asset.isPublic or asset.uploadedBy == caller or isAuthorized(caller)) {
                    #ok(asset)
                } else {
                    #err("Not authorized to access this asset")
                }
            };
            case null #err("Asset not found");
        }
    };

    public query func getAssetBytes(assetId: AssetId) : async ?AssetData {
        switch (assets.get(assetId)) {
            case (?asset) {
                if (asset.isPublic) {
                    ?asset.data
                } else {
                    null
                }
            };
            case null null;
        }
    };

    // Get asset metadata only (without data)
    public query func getAssetMetadata(assetId: AssetId) : async ?AssetMetadata {
        switch (assets.get(assetId)) {
            case (?asset) {
                ?{
                    id = asset.id;
                    name = asset.name;
                    contentType = asset.contentType;
                    size = asset.size;
                    uploadedBy = asset.uploadedBy;
                    uploadedAt = asset.uploadedAt;
                    isPublic = asset.isPublic;
                    tags = asset.tags;
                }
            };
            case null null;
        }
    };

    // Get public assets
    public query func getPublicAssets() : async [AssetMetadata] {
        let publicAssets = Buffer.Buffer<AssetMetadata>(0);
        for (asset in assets.vals()) {
            if (asset.isPublic) {
                publicAssets.add({
                    id = asset.id;
                    name = asset.name;
                    contentType = asset.contentType;
                    size = asset.size;
                    uploadedBy = asset.uploadedBy;
                    uploadedAt = asset.uploadedAt;
                    isPublic = asset.isPublic;
                    tags = asset.tags;
                });
            };
        };
        Buffer.toArray(publicAssets)
    };

    // Get user's assets
    public shared(msg) func getUserAssets() : async [AssetMetadata] {
        let caller = msg.caller;
        let userAssetIds = switch (uploaderAssets.get(caller)) {
            case (?ids) ids;
            case null return [];
        };

        let userAssets = Buffer.Buffer<AssetMetadata>(0);
        for (assetId in userAssetIds.vals()) {
            switch (assets.get(assetId)) {
                case (?asset) {
                    userAssets.add({
                        id = asset.id;
                        name = asset.name;
                        contentType = asset.contentType;
                        size = asset.size;
                        uploadedBy = asset.uploadedBy;
                        uploadedAt = asset.uploadedAt;
                        isPublic = asset.isPublic;
                        tags = asset.tags;
                    });
                };
                case null {};
            };
        };
        Buffer.toArray(userAssets)
    };

    // Search assets by tags
    public query func searchAssetsByTag(tag: Text) : async [AssetMetadata] {
        let matchingAssets = Buffer.Buffer<AssetMetadata>(0);
        for (asset in assets.vals()) {
            if (asset.isPublic) {
                let hasTag = Array.find<Text>(asset.tags, func(t) = t == tag);
                if (hasTag != null) {
                    matchingAssets.add({
                        id = asset.id;
                        name = asset.name;
                        contentType = asset.contentType;
                        size = asset.size;
                        uploadedBy = asset.uploadedBy;
                        uploadedAt = asset.uploadedAt;
                        isPublic = asset.isPublic;
                        tags = asset.tags;
                    });
                };
            };
        };
        Buffer.toArray(matchingAssets)
    };

    // Delete asset
    public shared(msg) func deleteAsset(assetId: AssetId) : async Result<(), Text> {
        let caller = msg.caller;
        
        switch (assets.get(assetId)) {
            case (?asset) {
                // Check if user owns the asset or is authorized
                if (asset.uploadedBy == caller or isAuthorized(caller)) {
                    assets.delete(assetId);
                    currentStorageUsed -= asset.size;
                    
                    // Update uploader assets mapping
                    let currentAssets = switch (uploaderAssets.get(asset.uploadedBy)) {
                        case (?assets) assets;
                        case null [];
                    };
                    let updatedAssets = Array.filter<AssetId>(currentAssets, func(id) = id != assetId);
                    uploaderAssets.put(asset.uploadedBy, updatedAssets);
                    
                    Debug.print("Asset deleted: " # asset.name # " (ID: " # Nat.toText(assetId) # ")");
                    #ok()
                } else {
                    #err("Not authorized to delete this asset")
                }
            };
            case null #err("Asset not found");
        }
    };

    // Update asset metadata
    public shared(msg) func updateAssetMetadata(
        assetId: AssetId,
        name: ?Text,
        isPublic: ?Bool,
        tags: ?[Text]
    ) : async Result<(), Text> {
        let caller = msg.caller;
        
        switch (assets.get(assetId)) {
            case (?asset) {
                if (asset.uploadedBy == caller or isAuthorized(caller)) {
                    let updatedAsset = {
                        id = asset.id;
                        name = switch (name) { case (?n) n; case null asset.name };
                        contentType = asset.contentType;
                        size = asset.size;
                        data = asset.data;
                        uploadedBy = asset.uploadedBy;
                        uploadedAt = asset.uploadedAt;
                        isPublic = switch (isPublic) { case (?p) p; case null asset.isPublic };
                        tags = switch (tags) { case (?t) t; case null asset.tags };
                    };
                    assets.put(assetId, updatedAsset);
                    #ok()
                } else {
                    #err("Not authorized to update this asset")
                }
            };
            case null #err("Asset not found");
        }
    };

    // Get storage statistics
    public query func getStorageStats() : async {
        totalAssets: Nat;
        storageUsed: Nat;
        storageLimit: Nat;
        storageAvailable: Nat;
        averageFileSize: Nat;
    } {
        let totalAssets = assets.size();
        let averageSize = if (totalAssets > 0) {
            currentStorageUsed / totalAssets
        } else { 0 };

        {
            totalAssets = totalAssets;
            storageUsed = currentStorageUsed;
            storageLimit = maxTotalStorage;
            storageAvailable = maxTotalStorage - currentStorageUsed;
            averageFileSize = averageSize;
        }
    };

    // Get supported content types
    public query func getSupportedContentTypes() : async [Text] {
        supportedTypes
    };

    // Administrative functions

    // Add authorized uploader
    public shared(msg) func addAuthorizedUploader(principal: Principal) : async Result<(), Text> {
        // Allow the first uploader to be added by anyone when the list is empty.
        if (authorizedUploaders.size() > 0 and not isAuthorized(msg.caller)) {
            return #err("Not authorized to add uploaders");
        };

        if (isAuthorized(principal)) {
            return #err("Uploader already authorized");
        };

        let principals = Buffer.fromArray<Principal>(authorizedUploaders);
        principals.add(principal);
        authorizedUploaders := Buffer.toArray(principals);

        Debug.print("Authorized uploader added: " # Principal.toText(principal));
        #ok()
    };

    // Remove authorized uploader
    public shared(msg) func removeAuthorizedUploader(principal: Principal) : async Result<(), Text> {
        if (not isAuthorized(msg.caller)) {
            return #err("Not authorized to remove uploaders");
        };

        authorizedUploaders := Array.filter<Principal>(authorizedUploaders, func(p) = p != principal);
        
        Debug.print("Authorized uploader removed: " # Principal.toText(principal));
        #ok()
    };

    // Update storage limits
    public shared(msg) func updateStorageLimits(
        maxFileSizeNew: ?Nat,
        maxTotalStorageNew: ?Nat
    ) : async Result<(), Text> {
        if (not isAuthorized(msg.caller)) {
            return #err("Not authorized to update storage limits");
        };

        switch (maxFileSizeNew) {
            case (?size) maxFileSize := size;
            case null {};
        };

        switch (maxTotalStorageNew) {
            case (?size) {
                if (size < currentStorageUsed) {
                    return #err("New storage limit cannot be less than current usage");
                };
                maxTotalStorage := size;
            };
            case null {};
        };

        #ok()
    };

    // Get authorized uploaders
    public query func getAuthorizedUploaders() : async [Principal] {
        authorizedUploaders
    };

    // Helper functions
    private func isAuthorized(principal: Principal) : Bool {
        Array.find<Principal>(authorizedUploaders, func(p) = p == principal) != null
    };

    // Health check
    public query func health() : async { status: Text; timestamp: Int; storageUsed: Nat } {
        {
            status = "healthy";
            timestamp = Time.now() / 1_000_000;
            storageUsed = currentStorageUsed;
        }
    };

    // Get asset by name (for convenience)
    public query func getAssetByName(name: Text) : async ?AssetMetadata {
        for (asset in assets.vals()) {
            if (asset.name == name and asset.isPublic) {
                return ?{
                    id = asset.id;
                    name = asset.name;
                    contentType = asset.contentType;
                    size = asset.size;
                    uploadedBy = asset.uploadedBy;
                    uploadedAt = asset.uploadedAt;
                    isPublic = asset.isPublic;
                    tags = asset.tags;
                };
            };
        };
        null
    };

    // Batch upload assets
    public shared(_msg) func batchUploadAssets(
        assets_data: [(Text, Text, AssetData, Bool, [Text])]
    ) : async [Result<AssetId, Text>] {
        let results = Buffer.Buffer<Result<AssetId, Text>>(assets_data.size());
        
        for ((name, contentType, data, isPublic, tags) in assets_data.vals()) {
            let result = await uploadAsset(name, contentType, data, isPublic, tags);
            results.add(result);
        };
        
        Buffer.toArray(results)
    };

    // HTTP interface to serve assets via browser
    public type HeaderField = (Text, Text);
    public type HttpRequest = {
        method: Text;
        url: Text;
        headers: [HeaderField];
        body: Blob;
    };
    public type HttpResponse = {
        status_code: Nat16;
        headers: [HeaderField];
        body: Blob;
    };

    public query func http_request(request: HttpRequest) : async HttpResponse {
        // Parse asset ID from URL query parameter: ?file=<assetId>
        let url = request.url;
        
        // Simple parsing for ?file=<id>
        if (Text.contains(url, #text "file=")) {
            // Extract asset ID after "file="
            let parts = Iter.toArray(Text.split(url, #text "file="));
            if (parts.size() >= 2) {
                let idText = parts[1];
                // Remove any trailing parameters
                let idParts = Iter.toArray(Text.split(idText, #text "&"));
                let assetIdText = idParts[0];
                
                // Try to parse as Nat
                switch (textToNat(assetIdText)) {
                    case (?assetId) {
                        // Look up asset in the HashMap
                        switch (assets.get(assetId)) {
                            case (?asset) {
                                // Serve the asset (check if public)
                                if (asset.isPublic) {
                                    return {
                                        status_code = 200;
                                        headers = [
                                            ("Content-Type", asset.contentType),
                                            ("Cache-Control", "public, max-age=31536000")
                                        ];
                                        body = asset.data;
                                    };
                                } else {
                                    // Asset exists but is private
                                    return {
                                        status_code = 403;
                                        headers = [("Content-Type", "text/plain")];
                                        body = Text.encodeUtf8("Access forbidden: Asset is private");
                                    };
                                };
                            };
                            case null {
                                // Asset not found in HashMap
                                Debug.print("Asset not found in HashMap: " # Nat.toText(assetId));
                            };
                        };
                    };
                    case null {
                        // Invalid asset ID format
                        return {
                            status_code = 400;
                            headers = [("Content-Type", "text/plain")];
                            body = Text.encodeUtf8("Invalid asset ID format");
                        };
                    };
                };
            };
        };

        // Return 404 if not found
        {
            status_code = 404;
            headers = [("Content-Type", "text/plain")];
            body = Text.encodeUtf8("Asset not found");
        }
    };

    // Helper function to parse Text to Nat
    private func textToNat(t: Text) : ?Nat {
        var n : Nat = 0;
        for (c in t.chars()) {
            if (c >= '0' and c <= '9') {
                let digit = Nat32.toNat(Char.toNat32(c) - Char.toNat32('0'));
                n := n * 10 + digit;
            } else {
                return null;
            };
        };
        ?n
    };
}

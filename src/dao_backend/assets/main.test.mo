import Asset "./main";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";

// Simple runtime test that verifies uploads are rejected until an uploader is
// authorized and that the first call to `addAuthorizedUploader` succeeds even
// when no uploader has been configured yet.
actor {
    public func main() : async () {
        let selfPrincipal = Principal.fromActor(this);

        // Upload should fail while no authorized uploaders exist.
        let data = Blob.fromArray([1,2,3]);
        let uploadBefore = await Asset.uploadAsset("test", "image/png", data, true, []);
        assert uploadBefore == #err("Uploads are disabled until an uploader is authorized or open uploads are enabled");

        // Anyone can authorize the first uploader.
        let res = await Asset.addAuthorizedUploader(selfPrincipal);
        assert res == #ok();

        let uploaders = await Asset.getAuthorizedUploaders();
        assert Array.find<Principal>(uploaders, func(p) = p == selfPrincipal) != null;

        // After authorization, upload succeeds.
        let uploadAfter = await Asset.uploadAsset("test2", "image/png", data, true, []);
        switch uploadAfter { case (#ok(_)) {}; case (_) { assert false } };

        let duplicateRes = await Asset.addAuthorizedUploader(selfPrincipal);
        assert duplicateRes == #err("Uploader already authorized");

        Debug.print("initial uploader configuration and upload permission test passed");
    };
}


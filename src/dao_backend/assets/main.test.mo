import Asset "./main.mo";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Debug "mo:base/Debug";

// Simple runtime test that verifies the first call to `addAuthorizedUploader`
// succeeds even when no uploader has been configured yet.
actor {
    public func main() : async () {
        let testPrincipal = Principal.fromText("aaaaa-aa");
        let res = await Asset.addAuthorizedUploader(testPrincipal);
        assert res == #ok();

        let uploaders = await Asset.getAuthorizedUploaders();
        assert Array.find<Principal>(uploaders, func(p) = p == testPrincipal) != null;

        Debug.print("initial uploader configuration test passed");
    };
}


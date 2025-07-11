import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

actor {
  let metadataStore = HashMap.HashMap<Text, Text>(10, Text.equal, Text.hash);

  public func set_metadata(key: Text, value: Text): async () {
    metadataStore.put(key, value);
  };

  public query func get_metadata(key: Text): async ?Text {
    metadataStore.get(key);
  };

  public func delete_metadata(key: Text): async Bool {
    let result = metadataStore.remove(key);
    return result != null;
  };

  public query func has_key(key: Text): async Bool {
    switch (metadataStore.get(key)) {
      case (?_) { true };
      case (_) { false };
    }
  };

  public query func list_keys(): async [Text] {
    Iter.toArray(metadataStore.keys())
  };
}
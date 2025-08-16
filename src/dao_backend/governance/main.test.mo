import Governance "./main";
import Types "../shared/types";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";

actor {
    public func main() : async () {
        let admin = Principal.fromActor(this);

        let daoStub = actor {
            public shared query func getUserProfile(_: Principal) -> async ?Types.UserProfile { null };
            public query func checkIsAdmin(p: Principal) : async Bool { p == admin };
        };
        let stakingStub = actor {
            public shared query func getUserStakingSummary(_: Principal) -> async {
                totalStaked: Nat;
                totalRewards: Nat;
                activeStakes: Nat;
                totalVotingPower: Nat;
            } {
                { totalStaked = 0; totalRewards = 0; activeStakes = 0; totalVotingPower = 0 }
            };
        };

        await Governance.init(Principal.fromActor(daoStub), Principal.fromActor(stakingStub));

        let malicious = actor {
            public func attemptReinit() : async Bool {
                try {
                    await Governance.init(Principal.fromActor(daoStub), Principal.fromActor(stakingStub));
                    false
                } catch (_) {
                    true
                }
            }
        };

        assert (await malicious.attemptReinit());
        Debug.print("Unauthorized init attempt correctly rejected");
    }
}

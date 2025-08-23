export const idlFactory = ({ IDL }) => {
  const StakeId = IDL.Nat;
  const TokenAmount = IDL.Nat;
  const Result = IDL.Variant({ 'ok' : TokenAmount, 'err' : IDL.Text });
  const StakingPeriod = IDL.Variant({
    'locked180' : IDL.Null,
    'locked365' : IDL.Null,
    'instant' : IDL.Null,
    'locked30' : IDL.Null,
    'locked90' : IDL.Null,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Principal = IDL.Principal;
  const Time = IDL.Int;
  const Stake = IDL.Record({
    'id' : StakeId,
    'staker' : Principal,
    'unlocksAt' : IDL.Opt(Time),
    'stakedAt' : Time,
    'isActive' : IDL.Bool,
    'stakingPeriod' : StakingPeriod,
    'rewards' : TokenAmount,
    'amount' : TokenAmount,
  });
  const StakingRewards = IDL.Record({
    'apr' : IDL.Float64,
    'totalRewards' : TokenAmount,
    'lastClaimedAt' : IDL.Opt(Time),
    'claimableRewards' : TokenAmount,
  });
  const Result_1 = IDL.Variant({ 'ok' : StakeId, 'err' : IDL.Text });
  return IDL.Service({
    'claimRewards' : IDL.Func([StakeId], [Result], []),
    'extendStakingPeriod' : IDL.Func([StakeId, StakingPeriod], [Result_2], []),
    'getStake' : IDL.Func([StakeId], [IDL.Opt(Stake)], ['query']),
    'getStakingRewards' : IDL.Func(
        [StakeId],
        [IDL.Opt(StakingRewards)],
        ['query'],
      ),
    'getStakingStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'stakingPeriodDistribution' : IDL.Vec(
              IDL.Tuple(StakingPeriod, IDL.Nat)
            ),
            'averageStakeAmount' : IDL.Float64,
            'totalRewardsDistributed' : TokenAmount,
            'activeStakes' : IDL.Nat,
            'totalStakes' : IDL.Nat,
            'totalStakedAmount' : TokenAmount,
          }),
        ],
        ['query'],
      ),
    'getUserActiveStakes' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Stake)],
        ['query'],
      ),
    'getUserStakes' : IDL.Func([IDL.Principal], [IDL.Vec(Stake)], ['query']),
    'getUserStakingSummary' : IDL.Func(
        [IDL.Principal],
        [
          IDL.Record({
            'totalRewards' : TokenAmount,
            'totalVotingPower' : IDL.Nat,
            'activeStakes' : IDL.Nat,
            'totalStaked' : TokenAmount,
          }),
        ],
        ['query'],
      ),
    'setMaximumStakeAmount' : IDL.Func([TokenAmount], [Result_2], []),
    'setMinimumStakeAmount' : IDL.Func([TokenAmount], [Result_2], []),
    'setStakingEnabled' : IDL.Func([IDL.Bool], [Result_2], []),
    'stake' : IDL.Func([TokenAmount, StakingPeriod], [Result_1], []),
    'unstake' : IDL.Func([StakeId], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };

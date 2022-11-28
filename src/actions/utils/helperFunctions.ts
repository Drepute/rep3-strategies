import { getRep3MembershipDetails } from '../../utils/subgraph/helperFunction';
import { MembershipActions } from './type';

export const createOrUpdateMembership = async (
  contractAddress: string,
  eao: string,
  networkId: number,
  upgradeTier: number | undefined
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eao,
    networkId
  );
  console.log(membershipDetailsForEOA);
  if (membershipDetailsForEOA && upgradeTier) {
    return {
      params: { ...membershipDetailsForEOA, upgradeTier },
      action:
        membershipDetailsForEOA.level > upgradeTier
          ? MembershipActions.downgradeMembershipNFT
          : MembershipActions.upgradeMembershipNFT,
    };
  } else {
    return {
      params: { ...membershipDetailsForEOA, upgradeTier },
      action: MembershipActions.createMembershipVoucher,
    };
  }
};

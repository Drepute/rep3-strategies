import { getRep3MembershipDetails } from '../../utils/subgraph/helperFunction';
import { BadgeActions, MembershipActions } from './type';

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

  console.log(membershipDetailsForEOA, upgradeTier);

  if (membershipDetailsForEOA) {
    console.log(
      'membership',
      membershipDetailsForEOA.level === upgradeTier?.toString(),
      membershipDetailsForEOA.level,
      upgradeTier?.toString()
    );
    if (membershipDetailsForEOA.level === upgradeTier?.toString()) {
      return {
        params: { ...membershipDetailsForEOA, upgradeTier },
        action: MembershipActions.noChange,
        eao,
      };
    } else {
      return {
        params: { ...membershipDetailsForEOA, upgradeTier },
        action: MembershipActions.upgradeMembershipNFT,
        eao,
      };
    }
  } else {
    return {
      params: { ...membershipDetailsForEOA, upgradeTier },
      action: MembershipActions.createMembershipVoucher,
      eao,
    };
  }
};

export const createBadgeVoucherOrMint = async (
  contractAddress: string,
  eao: string,
  networkId: number,
  badgeType: number,
  badgeActionType: BadgeActions
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eao,
    networkId
  );
  if (membershipDetailsForEOA) {
    return {
      params: {
        level: membershipDetailsForEOA.level,
        type: badgeType,
        memberTokenId: membershipDetailsForEOA.tokenID,
      },
      action: badgeActionType,
    };
  } else {
    return false;
  }
};

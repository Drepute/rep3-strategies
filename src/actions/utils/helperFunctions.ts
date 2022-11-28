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

export const createBadgVoucherOrMint = async (
  contractAddress: string,
  eao: string,
  networkId: number,
  badgeType: number,
  badgActionType: BadgeActions
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
      action: badgActionType,
    };
  } else {
    return false;
  }
};

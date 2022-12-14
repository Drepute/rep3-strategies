import { getRep3MembershipDetails } from '../../utils/subgraph/helperFunction';
import { BadgeActions, MembershipActions } from './type';

export const createOrUpdateMembership = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  upgradeTier: number | undefined
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eoa,
    networkId
  );

  if (membershipDetailsForEOA) {
    if (membershipDetailsForEOA.level === upgradeTier?.toString()) {
      return {
        params: { ...membershipDetailsForEOA, upgradeTier },
        action: false,
        eoa,
      };
    } else {
      return {
        params: { ...membershipDetailsForEOA, upgradeTier },
        action: MembershipActions.upgradeMembershipNFT,
        eoa,
      };
    }
  } else {
    return {
      params: { ...membershipDetailsForEOA, upgradeTier },
      action: MembershipActions.createMembershipVoucher,
      eoa,
    };
  }
};

export const createBadgeVoucherOrMint = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  badgeType: number,
  badgeActionType: BadgeActions
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eoa,
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
    return {
      params: {},
      action: false,
      eoa,
    };
  }
};

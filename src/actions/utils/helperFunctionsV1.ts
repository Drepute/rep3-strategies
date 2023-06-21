import {
  getRep3MembershipDetails,
  getRep3MembershipHistory,
} from '../../utils/subgraph/helperFunction';
import { BadgeActions, MembershipActions } from './type';

export const createOrUpdateMembership = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  upgradeTier: number | undefined,
  isVoucher: true | false = false
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
      action: isVoucher
        ? MembershipActions.issueMembership
        : MembershipActions.createMembershipVoucher,
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
export const expireBadgeParam = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  badgeType: number,
  tokenId: number,
  metadataUri: string
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eoa,
    networkId
  );

  return {
    params: {
      level: membershipDetailsForEOA.level,
      memberTokenId: membershipDetailsForEOA.tokenID,
      badgeType,
      badgeTokenId: tokenId,
      metadataUri,
    },
    action: BadgeActions.burnBadge,
  };
};
export const updateMembershipUri = async (
  contractAddress: string,
  eoa: string,
  networkId: number
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eoa,
    networkId
  );
  return {
    params: { ...membershipDetailsForEOA },
    action: MembershipActions.bulkMembershipURIChange,
    eoa,
  };
};
export const generateData = (
  levels: string | any[],
  categories: string | any[]
) => {
  if (levels.length !== categories.length) {
    return [];
  }
  const levelCategoryArray: any[] = [];
  for (let i = 0; i < levels.length; i++) {
    const levelCategory = (levels[i] << 8) | categories[i];
    levelCategoryArray.push(levelCategory);
  }
  return levelCategoryArray;
};
export const createOrUpdateMembershipWithCategory = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  upgradeLevelCategory: { level: number; category: number }[]
) => {
  if (upgradeLevelCategory.length > 0) {
    try {
      const membershipDetailsForEOA = await getRep3MembershipHistory(
        contractAddress,
        eoa,
        networkId
      );
      const latestMembership = upgradeLevelCategory.map(x => {
        const latest = membershipDetailsForEOA.filter(
          y => y.category === x.category.toString()
        )[0];
        if (latest) {
          return {
            params: { ...latest, upgradeTier: x.level },
            action:
              latest.level === x.level.toString()
                ? MembershipActions.noChange
                : MembershipActions.upgradeMembershipNFT,
            eoa,
          };
        } else {
          return {
            params: { category: x.category, upgradeTier: x.level },
            action: MembershipActions.issueMembership,
            eoa,
          };
        }
      });
      return latestMembership;
    } catch (error) {
      console.log("error",error)
      return error
      // const membershipDetailsForEOA = await getRep3MembershipHistory(
      //   contractAddress,
      //   eoa,
      //   networkId
      // );
      // const latestMembership = upgradeLevelCategory.map(x => {
      //   const latest = membershipDetailsForEOA.filter(
      //     y => y.category === x.category.toString()
      //   )[0];
      //   if (latest) {
      //     return {
      //       params: { ...latest, upgradeTier: x.level },
      //       action:
      //         latest.level === x.level.toString()
      //           ? MembershipActions.noChange
      //           : MembershipActions.upgradeMembershipNFT,
      //       eoa,
      //     };
      //   } else {
      //     return {
      //       params: { category: x.category, upgradeTier: x.level },
      //       action: MembershipActions.issueMembership,
      //       eoa,
      //     };
      //   }
      // });
      // return latestMembership;
    }
    
  } else {
    return [
      {
        params: {},
        action: false,
        eoa,
      },
    ];
  }
};

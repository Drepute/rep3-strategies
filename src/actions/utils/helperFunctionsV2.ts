import { getRep3V2TierDetails } from '../../utils/subgraph/helperFunction';
import { BadgeActions, MembershipActions, MembershipActionsV2 } from './type';

export const createOrUpdateMembershipV2 = async (
  credentials: string,
  eoa: string,
  networkId: number,
  upgradeTier: number | undefined
) => {
  if (upgradeTier === 0) {
    return {
      params: {},
      action: false,
      eoa,
    };
  } else {
    const tierDetailsForEOA = await getRep3V2TierDetails(
        credentials,
        eoa,
        networkId
    );
    console.log('Tier NFT', tierDetailsForEOA);
    if (tierDetailsForEOA) {
      if (tierDetailsForEOA.tier === upgradeTier?.toString()) {
        return {
          params: { ...tierDetailsForEOA, upgradeTier },
          action: false,
          eoa,
        };
      } else {
        return {
          params: { ...tierDetailsForEOA, upgradeTier, functionName:"facetFunction",facet: "tierMint",facetFunctionName: "mint" },
          action: MembershipActionsV2.tierMint,
          eoa,
        };
      }
    } else {
      return {
        params: { ...tierDetailsForEOA, upgradeTier, functionName:"facetFunction",facet: "tierMint",facetFunctionName: "mint" },
        action: MembershipActionsV2.tierMint,
        eoa,
      };
    }
  }
};

// export const createBadgeVoucherOrMint = async (
//   contractAddress: string,
//   eoa: string,
//   networkId: number,
//   badgeType: number,
//   badgeActionType: BadgeActions
// ) => {
//   const membershipDetailsForEOA = await getRep3MembershipDetails(
//     contractAddress,
//     eoa,
//     networkId
//   );
//   if (membershipDetailsForEOA) {
//     return {
//       params: {
//         level: membershipDetailsForEOA.level,
//         type: badgeType,
//         memberTokenId: membershipDetailsForEOA.tokenID,
//       },
//       action: badgeActionType,
//     };
//   } else {
//     return {
//       params: {},
//       action: false,
//       eoa,
//     };
//   }
// };

// export const expireBadgeParam = async (
//   contractAddress: string,
//   eoa: string,
//   networkId: number,
//   badgeType: number,
//   tokenId: number,
//   metadataUri: string
// ) => {
//   const membershipDetailsForEOA = await getRep3MembershipDetails(
//     contractAddress,
//     eoa,
//     networkId
//   );

//   return {
//     params: {
//       level: membershipDetailsForEOA.level,
//       memberTokenId: membershipDetailsForEOA.tokenID,
//       badgeType,
//       badgeTokenId: tokenId,
//       metadataUri,
//     },
//     action: BadgeActions.burnBadge,
//   };
// };

// export const updateMembershipUri = async (
//   contractAddress: string,
//   eoa: string,
//   networkId: number
// ) => {
//   const membershipDetailsForEOA = await getRep3MembershipDetails(
//     contractAddress,
//     eoa,
//     networkId
//   );
//   return {
//     params: { ...membershipDetailsForEOA },
//     action: MembershipActions.bulkMembershipURIChange,
//     eoa,
//   };
// };

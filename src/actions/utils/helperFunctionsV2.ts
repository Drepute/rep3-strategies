import { getRep3V2BadgeDetails } from '../../utils/subgraph/helperFunction';
import { MembershipActionsV2 } from './type';

export const createOrUpdateBadgeV2 = async (
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
    const tierDetailsForEOA = await getRep3V2BadgeDetails(
      credentials,
      eoa,
      networkId
    );
    console.log('Tier NFT', tierDetailsForEOA);
    if (tierDetailsForEOA) {
      if (tierDetailsForEOA.tier === upgradeTier) {
        return {
          params: { ...tierDetailsForEOA, upgradeTier },
          action: false,
          eoa,
        };
      } else {
        return {
          params: {
            ...tierDetailsForEOA,
            upgradeTier,
          },
          action: MembershipActionsV2.updateTier,
          eoa,
        };
      }
    } else {
      return {
        params: {
          ...tierDetailsForEOA,
          upgradeTier,
        },
        action: MembershipActionsV2.badgeMint,
        eoa,
      };
    }
  }
};

import fetch from 'cross-fetch';
import { getRep3V2BadgeDetails } from '../../utils/subgraph/helperFunction';
import { MembershipActionsV2 } from './type';

export const createOrUpdateBadgeV2WithMetadata = async (
  credentials: string,
  eoa: string,
  networkId: number,
  upgradeTier: number | undefined,
  metaInfo: { amount: number; isDaysStaked: number; tokenStaked: number }
) => {
  const tierDetailsForEOA = await getRep3V2BadgeDetails(
    credentials,
    eoa,
    networkId
  );
  const metaData = {
    mediaChange: false,
    metaChange: false,
    metaInfo: {
      amount: metaInfo.amount,
      isDaysStaked: metaInfo.isDaysStaked,
      tokenStaked: metaInfo.tokenStaked,
      mediaUri: '',
    },
  };

  if (tierDetailsForEOA) {
    const metadata = await fetch(
      `https://arweave.net/${tierDetailsForEOA.metadataUri}`
    );
    // `https://arweave.net/4aAga5ETjjBr8rDaZ0Vz271etFafFSGLexpZAjY1dEg`
    // `https://arweave.net/${tierDetailsForEOA.metadataUri}`;
    const response = await metadata.json();
    console.log(
      'tier detail',
      tierDetailsForEOA.metadataUri,
      metaInfo,
      response
    );
    metaData.metaInfo.mediaUri = response.animation_url;
    response.attributes.map((element: any) => {
      if (element.trait_type === 'Volume') {
        if (metaInfo.amount !== parseInt(element.value)) {
          metaData.mediaChange = true;
          metaData.metaChange = true;
          metaData.metaInfo.amount = metaInfo.amount;
        }
      }
      if (element.trait_type === 'Days Staked') {
        console.log(element);
        if (metaInfo.isDaysStaked !== parseInt(element.value)) {
          metaData.mediaChange = true;
          metaData.metaChange = true;
          metaData.metaInfo.isDaysStaked = metaInfo.isDaysStaked;
        }
      }
      if (element.trait_type === 'Tokens Staked') {
        console.log(element);
        if (metaInfo.tokenStaked !== parseInt(element.value)) {
          metaData.metaInfo.tokenStaked = metaInfo.tokenStaked;
          metaData.metaChange = true;
        }
      }
    });
    if (tierDetailsForEOA.tier === upgradeTier) {
      return {
        metaData,
        params: { ...tierDetailsForEOA, upgradeTier: { tier: upgradeTier } },
        action: false,
        eoa,
      };
    } else {
      return {
        params: {
          ...tierDetailsForEOA,
          upgradeTier: { tier: upgradeTier },
        },
        metaData,
        action: MembershipActionsV2.updateTier,
        eoa,
      };
    }
  } else {
    return {
      params: {
        ...tierDetailsForEOA,
        upgradeTier: { tier: upgradeTier },
      },
      metaData: { badgeChange: true, metaInfo },
      action: MembershipActionsV2.badgeMint,
      eoa,
    };
  }
  // }
};

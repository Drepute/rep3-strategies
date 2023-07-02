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
      volumeTier: metaInfo.amount,
      daysTier: metaInfo.isDaysStaked,
      tokenTier: metaInfo.tokenStaked,
      mediaUri: '',
    },
  };

  if (tierDetailsForEOA) {
    const metadata = await fetch(
      `https://arweave.net/${tierDetailsForEOA.metadataUri}`
    );
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
          metaData.metaInfo.volumeTier = metaInfo.amount;
        }
      }
      else if (element.trait_type === 'Days Staked') {
        if (metaInfo.isDaysStaked !== parseInt(element.value)) {
          metaData.mediaChange = true;
          metaData.metaChange = true;
          metaData.metaInfo.daysTier = metaInfo.isDaysStaked;
        }
      }
      else if (element.trait_type === 'Tokens Staked') {
      
        if (metaInfo.tokenStaked !== parseInt(element.value)) {
          metaData.metaInfo.tokenTier = metaInfo.tokenStaked;
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
    metaData.mediaChange = true
    metaData.metaChange = true
    metaData.metaInfo.daysTier = metaInfo.isDaysStaked
    metaData.metaInfo.volumeTier = metaInfo.amount
    metaData.metaInfo.tokenTier = metaInfo.tokenStaked
    return {
      params: {
        ...tierDetailsForEOA,
        upgradeTier: { tier: upgradeTier },
      },
      metaData,
      action: MembershipActionsV2.badgeMint,
      eoa,
    };
  }
  
};

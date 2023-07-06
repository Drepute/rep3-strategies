import fetch from 'cross-fetch';
import { getRep3V2BadgeDetails } from '../../utils/subgraph/helperFunction';
import { MembershipActionsV2 } from './type';
import { subgraph } from '../../utils';
import { network } from '../../network';

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
      tierDetailsForEOA.metadataUri
    );
    const response = await metadata.json();
    
    metaData.metaInfo.mediaUri = response.animation_url;
    response.attributes.map((element: any) => {
      if (element.trait_type === 'Volume') {
        if (metaInfo.amount !== parseInt(element.value)) {
          metaData.mediaChange = true;
          metaData.metaChange = true;
          metaData.metaInfo.volumeTier = metaInfo.amount;
        }
      } else if (element.trait_type === 'Days Staked') {
        if (metaInfo.isDaysStaked !== parseInt(element.value)) {
          metaData.mediaChange = true;
          metaData.metaChange = true;
          metaData.metaInfo.daysTier = metaInfo.isDaysStaked;
        }
      } else if (element.trait_type === 'Tokens Staked') {
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
    metaData.mediaChange = true;
    metaData.metaChange = true;
    metaData.metaInfo.daysTier = metaInfo.isDaysStaked;
    metaData.metaInfo.volumeTier = metaInfo.amount;
    metaData.metaInfo.tokenTier = metaInfo.tokenStaked;
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

export const getAllClaimedMembers = async (
  parentCommunity: string,
  startTokenId: number,
  networkId: number,
  page = 0,
  allMembers: any[] = []
) => {
  const stakers = await subgraph.subgraphRequest(
    network[networkId].subgraphV2,
    {
      questBadges: {
        __args: {
          where: {
            parentCommunity,
            tokenId_gte: startTokenId,
          },
          first: 1000,
        },
        claimer: true,
        id: true,
        tokenId: true,
        metadataUri: true,
      },
    }
  );
  
  const all = allMembers.concat(stakers.questBadges);
  if (stakers.questBadges.length === 1000) {
    page = page + 1;
    const res: any[] | undefined = await getAllClaimedMembers(
      parentCommunity,
      all[all.length - 1].tokenId,
      networkId,
      page,
      all
    );
    return res;
  } else {
    return all;
  }
};

// const getAllMembers = async (
//   url: string,
//   contractAddress: string,
//   page = 0,
//   allMembers: any[] = []
// ) => {
//   if (page < 1) {
//     const stakers = await subgraph.subgraphRequest(url, {
//       membershipNFTs: {
//         __args: {
//           where: {
//             contractAddress,
//           },
//           orderBy: 'tokenID',
//           orderDirection: 'asc',
//           skip: page * 100,
//         },
//         claimer: true,
//         id: true,
//         tokenID: true,
//       },
//     });
//     const all = allMembers.concat(stakers.membershipNFTs);
//     if (stakers.membershipNFTs.length === 100) {
//       page = page + 1;
//       const res: any[] | undefined = await getAllMembers(
//         url,
//         contractAddress,
//         page,
//         all
//       );
//       return res;
//     } else {
//       return all;
//     }
//   } else {
//     return await getAllPaginatedMembers(
//       url,
//       contractAddress,
//       allMembers[allMembers.length - 1].tokenID,
//       page,
//       allMembers
//     );
//   }
// };

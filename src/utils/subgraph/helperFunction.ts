import { subgraphRequest } from '.';
import { network } from '../contract/network';

export const getRep3V2BadgeDetails = async (
  parentCommunity: string,
  eoa: string,
  networkId: number
) => {
  const URL = network[networkId].subgraph;
  const QUERY = {
    questBadges: {
      __args: {
        where: {
          parentCommunity,
          claimer: eoa,
        },
        orderBy: 'blockTimestamp',
        orderDirection: 'desc',
      },
      claimer: true,
      tokenId: true,
      tier: true,
      data: true,
      parentCommunity: true,
      blockTimestamp: true,
      metadataUri: true,
      txHash: true,
    },
  };
  try {
    const responseData = await subgraphRequest(URL, QUERY);
    if (responseData['questBadges'].length > 0) {
      return responseData['questBadges'][0];
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }
};

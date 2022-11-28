import { subgraphRequest } from '.';
import { network } from '../contract/network';

export const getRep3MembershipDetails = async (
  contractAddress: string,
  eoa: string,
  networkId: number
) => {
  const URL = network[networkId].subgraph;
  console.log(URL);
  const QUERY = {
    membershipNFTs: {
      __args: {
        where: {
          contractAddress,
          claimer: eoa,
        },
        orderBy: 'time',
        orderDirection: 'desc',
      },
      claimer: true,
      tokenID: true,
      level: true,
      category: true,
      contractAddress: true,
      time: true,
      metadataUri: true,
    },
  };
  try {
    const responseData = await subgraphRequest(URL, QUERY);
    if (responseData['membershipNFTs'].length > 0) {
      return responseData['membershipNFTs'][0];
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }
};

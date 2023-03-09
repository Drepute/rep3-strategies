import { subgraph } from '../../../utils';
import { StrategyParamsType } from '../../../types';

const SUBGRAPH_URLS = {
  main: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
  test: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  const QUERY = {
    membershipNFTs: {
      __args: {
        where: {
          contractAddress,
          claimer: eoa,
        },
      },
      claimer: true,
    },
  };

  const network: 'main' | 'test' = !options?.network ? 'main' : options.network;

  const responseData = await subgraph.subgraphRequest(
    SUBGRAPH_URLS[network],
    QUERY
  );

  return responseData.membershipNFTs.length > 0;
}

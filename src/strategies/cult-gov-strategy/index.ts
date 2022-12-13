import ActionCaller from '../../actions';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  const SUBGRAPH_URLS =
    'https://api.thegraph.com/subgraphs/name/eth-jashan/cult-governance';
  const QUERY = {
    membershipNFTs: {
      __args: {
        where: {
          id: eoa,
        },
      },
      proposals: true,
    },
  };
  const responseData = await subgraph.subgraphRequest(SUBGRAPH_URLS, QUERY);
  console.log(responseData);
}

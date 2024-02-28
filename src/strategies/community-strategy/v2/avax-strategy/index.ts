import { ethers } from 'ethers';
import { arithmeticOperand } from '../../../../adapters/contract';
import { StrategyParamsType } from '../../../../types';
// import { arithmeticOperand, viewAdapter } from '../../../../adapters/contract';
import fetch from 'cross-fetch';
import { subgraph } from '../../../../utils';
const structSwapCounts = async (userAddress: string, strategyOptions: any) => {
  const query_1 = `query ($userAddress: String!) {
      depositeds(where:{userAddress: $userAddress}) {
        id
        depositAmount
        totalDeposited
      }
    }`;
  const subgraphData = await subgraph.getSubgraphFetchCall(
    'https://api.thegraph.com/subgraphs/name/hirako2000/struct-finance-factory',
    query_1,
    { userAddress }
  );
  if (subgraphData?.depositeds.length) {
    console.log('struct', subgraphData?.depositeds.length);
    return arithmeticOperand(
      subgraphData?.depositeds.length,
      4,
      strategyOptions.operator
    )
      ? 2
      : arithmeticOperand(
          subgraphData?.depositeds.length,
          2,
          strategyOptions.operator
        )
      ? 1
      : 0;
  } else {
    return 0;
  }
};
const getWoofiEventTotalCount = async (eoa: string, strategyOptions?: any) => {
  let collectionName = `${strategyOptions.contractAddress[0]}-${strategyOptions.chainId}-${strategyOptions.topic}`;
  let filterParameter = JSON.stringify({
    'args.from': ethers.utils.getAddress(eoa), // only from
  });
  let sortOptions = JSON.stringify({ blockNumber: 1 });
  let transform_options = JSON.stringify({}); //empty obj
  let key = 'from'; //from
  let aggregator = 'count'; // count
  let url = `${strategyOptions.baseUrl}/contract_service/event/aggregate?collection_name=${collectionName}&key=${key}&aggregator=${aggregator}&filter_options=${filterParameter}&sort_options=${sortOptions}&transform_options=${transform_options}`;
  console.log(url);
  const response = await fetch(url);
  const res = await response.json();
  console.log('hereee', JSON.stringify(res?.data?.result));
  collectionName = `${strategyOptions.contractAddress[1]}-${strategyOptions.chainId}-${strategyOptions.topic}`;
  filterParameter = JSON.stringify({
    'args.from': ethers.utils.getAddress(eoa), // only from
  });
  sortOptions = JSON.stringify({ blockNumber: 1 });
  transform_options = JSON.stringify({}); //empty obj
  key = 'from'; //from
  aggregator = 'count'; // count
  url = `${strategyOptions.baseUrl}/contract_service/event/aggregate?collection_name=${collectionName}&key=${key}&aggregator=${aggregator}&filter_options=${filterParameter}&sort_options=${sortOptions}&transform_options=${transform_options}`;
  console.log(url);
  const response2 = await fetch(url);
  const res2 = await response2.json();
  // if (res?.data?.result) {
  // return res?.data?.result;
  console.log('Count..........', res2?.data, res?.data);
  const totalCount = (res2?.data?.result || 0) + (res?.data?.result || 0);
  return arithmeticOperand(
    parseInt(totalCount),
    strategyOptions.threshold,
    strategyOptions.operator
  )
    ? 1
    : 0;
  // }
};

const actionOnQuestType = async (
  type: string,
  eoa: string,
  strategyOptions: any
) => {
  console.log(strategyOptions);
  switch (type) {
    case 'struct': {
      const txCount = await structSwapCounts(eoa, strategyOptions);
      return txCount;
    }
    case 'woofi': {
      const txCount = await getWoofiEventTotalCount(eoa, strategyOptions);
      return txCount;
    }
    default:
      return 0;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
  const strategyOptions = options?.strategyOptions;
  console.log(strategyOptions);
  const thresholdCount = await actionOnQuestType(
    strategyOptions.questType,
    eoa[0],
    strategyOptions
  );
  console.log('eligible tier', thresholdCount);
  return thresholdCount;
}

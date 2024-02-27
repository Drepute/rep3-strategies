import { ethers } from 'ethers';
import { arithmeticOperand } from '../../../../adapters/contract';
import { StrategyParamsType } from '../../../../types';
// import { arithmeticOperand, viewAdapter } from '../../../../adapters/contract';
import fetch from 'cross-fetch';
import { subgraph } from '../../../../utils';
const structSwapCounts = async (userAddress: string, strategyOptions: any) => {
  console.log('strategy......', strategyOptions);
  const query1 = `query ($userAddress: String!) {
      depositeds(where:{userAddress: $userAddress}) {
        id
        depositAmount
        totalDeposited
      }
    }`;
  let resultForTier1: boolean | number = false;
  let resultForTier2: boolean | number = false;
  const subgraphData = await subgraph.getSubgraphFetchCall(
    'https://api.thegraph.com/subgraphs/name/hirako2000/struct-finance-factory',
    query1,
    { userAddress }
  );
  if (subgraphData?.depositeds.length) {
    resultForTier1 = arithmeticOperand(subgraphData?.depositeds.length, 2, '>=')
      ? 1
      : 0;
    if (resultForTier1) {
      const query2 = `query ($userAddress: String!) {
      depositeds(where:{userAddress: $userAddress,depositAmount_gte:1000000}) {
        id
        depositAmount
        totalDeposited
      }
    }`;
      const subgraphData = await subgraph.getSubgraphFetchCall(
        'https://api.thegraph.com/subgraphs/name/hirako2000/struct-finance-factory',
        query2,
        { userAddress }
      );
      resultForTier2 = arithmeticOperand(
        subgraphData?.depositeds.length,
        1,
        '>='
      )
        ? 2
        : resultForTier1;
      return resultForTier2;
    }
  } else {
    return 0;
  }
};
// };
const getWoofiEventTotalCount = async (eoa: string, strategyOptions?: any) => {
  if (strategyOptions?.questTier === 1) {
    const collectionName = `${strategyOptions.contractAddress}-${strategyOptions.chainId}-${strategyOptions.topic}`;
    const filterParameter = JSON.stringify({
      'args.from': ethers.utils.getAddress(eoa), // only from
    });
    const sortOptions = JSON.stringify({ blockNumber: 1 });
    const transform_options = JSON.stringify({}); //empty obj
    const key = 'from'; //from
    const aggregator = 'count'; // count
    const url = `${strategyOptions.baseUrl}/contract_service/event/aggregate?collection_name=${collectionName}&key=${key}&aggregator=${aggregator}&filter_options=${filterParameter}&sort_options=${sortOptions}&transform_options=${transform_options}`;
    console.log(url);
    const response = await fetch(url);
    const res = await response.json();
    console.log('hereee', JSON.stringify(res?.data?.result));
    if (res?.data?.result) {
      // return res?.data?.result;
      return arithmeticOperand(
        parseInt(res?.data?.result),
        strategyOptions.threshold,
        strategyOptions.operator
      )
        ? strategyOptions?.questTier
        : 0;
    }
  }
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

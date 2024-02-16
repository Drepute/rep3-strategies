import { arithmeticOperand } from '../../../../adapters/contract';
import { StrategyParamsType } from '../../../../types';
// import { arithmeticOperand, viewAdapter } from '../../../../adapters/contract';
// import fetch from 'cross-fetch';
import { subgraph } from '../../../../utils';
const structSwapCounts = async (userAddress: string, strategyOptions: any) => {
  if (strategyOptions?.questTier === 1) {
    const query = `query ($userAddress: String!) {
      depositeds(where:{userAddress: $userAddress}) {
        id
        depositAmount
        totalDeposited
      }
    }`;
    const subgraphData = await subgraph.getSubgraphFetchCall(
      'https://api.thegraph.com/subgraphs/name/hirako2000/struct-finance-factory',
      query,
      { userAddress }
    );
    if (subgraphData?.depositeds.length) {
      return arithmeticOperand(
        subgraphData?.depositeds.length,
        strategyOptions.threshold,
        strategyOptions.operator
      )
        ? strategyOptions?.questTier
        : 0;
    } else {
      return 0;
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

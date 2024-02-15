import { StrategyParamsType } from '../../../../types';
// import { arithmeticOperand, viewAdapter } from '../../../../adapters/contract';
// import fetch from 'cross-fetch';
import { subgraph } from '../../../../utils';
const structSwapCounts = async (userAddress: string, strategyOptions: any) => {
  if (strategyOptions?.questTier === 'struct_tier1') {
    const depositeds = await subgraph.subgraphRequest(
      'https://subgraph.satsuma-prod.com/structfinance/struct-finance-factory/version/1.8.5/api',
      {
        depositeds: {
          __args: {
            where: {
              userAddress,
            },
          },
          id: true,
          depositAmount: true,
          totalDeposited: true,
        },
      }
    );
    return depositeds.length;
  } else if (strategyOptions?.questTier === 'struct_tier2') {
    const depositeds = await subgraph.subgraphRequest(
      'https://subgraph.satsuma-prod.com/structfinance/struct-finance-factory/version/1.8.5/api',
      {
        depositeds: {
          __args: {
            where: {
              userAddress,
            },
          },
          id: true,
          depositAmount: true,
          totalDeposited: true,
        },
      }
    );
    return depositeds.length;
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
  console.log(thresholdCount);
}

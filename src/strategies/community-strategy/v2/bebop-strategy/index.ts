import { StrategyParamsType } from '../../../../types';
import { arithmeticOperand, viewAdapter } from '../../../../adapters/contract';

const getSwapperTransactionCount = async (
  walletAddr: string,
  startTime: string,
  threshold: number,
  currentLength: number,
  endTimeStamp?: number
) => {
  const endTime = endTimeStamp || Math.floor(new Date().getTime() / 1000) * 1e9;
  try {
    const res = await fetch(
      `https://api.bebop.xyz/history/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
    );
    const data = await res.json();
    let currentValidLength = currentLength;
    data.results.forEach(element => {
      if (element.volumeUsd > 22.5) {
        currentValidLength = currentValidLength + 1;
      }
    });
    if (data.nextAvailableTimestamp&& currentValidLength < threshold) {
      return await getSwapperTransactionCount(
        walletAddr,
        startTime,
        threshold,
        currentValidLength,
        data.nextAvailableTimestamp
      );
    } else {
      return currentValidLength;
    }
  } catch (error) {
    return 0;
  }
};
const actionOnQuestType = async (
  type: string,
  eoa: string,
  strategyOptions: any
) => {
  switch (type) {
    case 'swapper': {
      try {
        const txCount = await getSwapperTransactionCount(
          eoa,
          strategyOptions?.startTime,
          strategyOptions?.threshold,
          0
        );
        return txCount;
      } catch (error) {
        return 0;
      }
    }
    default:
      return 0;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
  const ethExecutionResult = await viewAdapter(eoa[0], {
    contractAddress: options.ethAddress,
    type: 'view',
    contractType: 'erc1155',
    balanceThreshold: 0,
    chainId: 1,
    operator: '>',
    functionName: 'balanceOf',
    functionParam: [options.ethTokenId],
  });
  let maticExecutionResult = false;
  if (ethExecutionResult) {
    maticExecutionResult = await viewAdapter(eoa[0], {
      contractAddress: options.maticAddress,
      type: 'view',
      contractType: 'erc1155',
      balanceThreshold: 0,
      chainId: 137,
      operator: '>',
      functionName: 'balanceOf',
      functionParam: [options.maticTokenId],
    });
  }

  if (ethExecutionResult || maticExecutionResult) {
    return ethExecutionResult || maticExecutionResult;
  } else {
    const thresholdCount = await actionOnQuestType(
      options.questType,
      eoa[0],
      options
    );

    return arithmeticOperand(
      thresholdCount,
      options.threshold,
      options.operator
    );
  }
}

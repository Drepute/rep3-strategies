import { StrategyParamsType } from '../../../../types';
import { arithmeticOperand, viewAdapter } from '../../../../adapters/contract';
import fetch from 'cross-fetch';

const getSizeIsSizeTransactionCount = async (
  walletAddr: string,
  startTime: string,
  threshold: number,
  currentVolume: number,
  endTimeStamp?: number
) => {
  const endTime = endTimeStamp ?? Math.floor(new Date().getTime() / 1000) * 1e9;

  const res = await fetch(
    `https://api.bebop.xyz/history/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
  );
  const data = await res.json();
  let currentValidVolume = currentVolume;
  data.results.forEach(element => {
    currentValidVolume = currentValidVolume + element.volumeUsd;
  });
  if (data.nextAvailableTimestamp && currentValidVolume < threshold) {
    return await getSizeIsSizeTransactionCount(
      walletAddr,
      startTime,
      threshold,
      currentValidVolume,
      data.nextAvailableTimestamp
    );
  } else {
    return currentValidVolume;
  }
};
const getMultiSwapperTransactionCount = async (
  walletAddr: string,
  startTime: string,
  threshold: number,
  currentScore: number,
  endTimeStamp?: number
) => {
  const endTime = endTimeStamp ?? Math.floor(new Date().getTime() / 1000) * 1e9;

  const res = await fetch(
    `https://api.bebop.xyz/history/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
  );
  const data = await res.json();

  let currentValidScore = currentScore;
  data.results.forEach(element => {
    if (element.volumeUsd >= 22.5) {
      const swapLevel = Math.max(
        Object.keys(element.sellTokens).length,
        Object.keys(element.buyTokens).length
      );
      const currentTxSwapScore = swapLevel > 1 ? 1 : 0;
      currentValidScore = currentValidScore + currentTxSwapScore;
    }
  });
  if (data.nextAvailableTimestamp && currentValidScore < threshold) {
    return await getMultiSwapperTransactionCount(
      walletAddr,
      startTime,
      threshold,
      currentValidScore,
      data.nextAvailableTimestamp
    );
  } else {
    return currentValidScore;
  }
};
const getSwapperTransactionCount = async (
  walletAddr: string,
  startTime: string,
  threshold: number,
  currentLength: number,
  endTimeStamp?: number
) => {
  const endTime = endTimeStamp ?? Math.floor(new Date().getTime() / 1000) * 1e9;

  const res = await fetch(
    `https://api.bebop.xyz/history/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
  );
  const data = await res.json();

  let currentValidLength = currentLength;
  data.results.forEach(element => {
    if (element.volumeUsd >= 22.5) {
      currentValidLength = currentValidLength + 1;
    }
  });
  if (data.nextAvailableTimestamp && currentValidLength < threshold) {
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
};
const actionOnQuestType = async (
  type: string,
  eoa: string,
  strategyOptions: any
) => {
  switch (type) {
    case 'swapper': {
      const txCount = await getSwapperTransactionCount(
        eoa,
        strategyOptions?.startTime,
        strategyOptions?.threshold,
        0
      );
      return txCount;
    }
    case 'multiswapper': {
      const txCount = await getMultiSwapperTransactionCount(
        eoa,
        strategyOptions?.startTime,
        strategyOptions?.threshold,
        0
      );
      return txCount;
    }
    case 'sizeIsSize': {
      const txCount = await getSizeIsSizeTransactionCount(
        eoa,
        strategyOptions?.startTime,
        strategyOptions?.threshold,
        0
      );
      return txCount;
    }
    default:
      return 0;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
  let ethExecutionResult = false;
  for (const element of options.ethTokenId) {
    ethExecutionResult = await viewAdapter(eoa[0], {
      contractAddress: options.ethAddress,
      type: 'view',
      contractType: 'erc1155',
      balanceThreshold: 0,
      chainId: 1,
      operator: '>',
      functionName: 'balanceOf',
      functionParam: [element],
    });
    if (ethExecutionResult) {
      break;
    }
  }
  let maticExecutionResult = false;
  if (!ethExecutionResult) {
    for (const element of options.maticTokenId) {
      maticExecutionResult = await viewAdapter(eoa[0], {
        contractAddress: options.maticAddress,
        type: 'view',
        contractType: 'erc1155',
        balanceThreshold: 0,
        chainId: 137,
        operator: '>',
        functionName: 'balanceOf',
        functionParam: [element],
      });
      if (maticExecutionResult) {
        break;
      }
    }
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

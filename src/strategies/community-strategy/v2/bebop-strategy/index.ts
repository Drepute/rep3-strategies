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
    `https://api.bebop.xyz/history/v2/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
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
    `https://api.bebop.xyz/history/v2/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
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
    `https://api.bebop.xyz/history/v2/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
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
const getDEXMasTransactionCount = async (
  walletAddr: string,
  startTime: string,
  threshold: number,
  currentScore: number,
  endTimeStamp?: number
) => {
  const endTime = endTimeStamp ?? Math.floor(new Date().getTime() / 1000) * 1e9;

  const res = await fetch(
    `https://api.bebop.xyz/history/v2/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
  );
  const data = await res.json();
  console.log(data.results.length);
  let currentValidScore = currentScore;
  data.results.forEach(element => {
    const recievedTokens = Object.keys(element.buyTokens).length;
    const currentTxSwapScore = recievedTokens;
    currentValidScore = currentValidScore + currentTxSwapScore;
  });
  if (data.nextAvailableTimestamp && currentValidScore < threshold) {
    return await getDEXMasTransactionCount(
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
const checkTheTotalVolumeUsd = (
  result: any[],
  startIndex: number,
  endIndex: number,
  totalSwapVolume: number
) => {
  let start = startIndex;
  let end = endIndex;
  if (end - start === 8 && totalSwapVolume < 888 && end <= result.length) {
    let currentSwapVolume = 0;
    result.slice(startIndex, endIndex).forEach(ele => {
      currentSwapVolume = currentSwapVolume + ele.volumeUsd;
    });
    start = start + 1;
    end = end + 1;
    console.log('finallll', start, end, currentSwapVolume);
    return checkTheTotalVolumeUsd(result, start, end, currentSwapVolume);
  } else {
    return totalSwapVolume;
  }

  // }
};
const getFlyingDragonTransactionCount = async (
  walletAddr: string,
  startTime: string,
  currentNumberOfSwaps: number,
  endTimeStamp?: number
) => {
  const endTime = endTimeStamp;
  const res = await fetch(
    `https://api.bebop.xyz/history/v2/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
  );
  const data = await res.json();
  console.log('data length', data.length);
  let numberOfSwapWithIndividualVolume = currentNumberOfSwaps;
  let volumeOfSwapWithCombinedSwaps = 0;
  // check 88+ swaps
  data.results.forEach((element: { volumeUsd: number }) => {
    if (element.volumeUsd > 88) {
      numberOfSwapWithIndividualVolume = numberOfSwapWithIndividualVolume + 1;
    }
  });
  // check 888+ swaps
  if (numberOfSwapWithIndividualVolume < 8) {
    const arrayWithAllUSDValue = data.results.map(x => x.volumeUsd);
    volumeOfSwapWithCombinedSwaps = arrayWithAllUSDValue.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    ); // volumeOfSwapWithCombinedSwaps = checkTheTotalVolumeUsd(
    //   data.results,
    //   0,
    //   8,
    //   0
    // );
  }

  if (
    numberOfSwapWithIndividualVolume >= 8 ||
    volumeOfSwapWithCombinedSwaps > 888
  ) {
    return 1;
  } else {
    return 0;
  }
};
const getBlockchainTransactionCount = async (
  walletAddr: string,
  chainId: number,
  startTime: string,
  threshold: number,
  currentLength: number,
  endTimeStamp?: number
) => {
  const endTime = endTimeStamp ?? Math.floor(new Date().getTime() / 1000) * 1e9;

  const res = await fetch(
    `https://api.bebop.xyz/history/v2/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTime}&size=${300}`
  );
  const data = await res.json();

  let currentValidLength = currentLength;

  data.results.forEach(element => {
    console.log(element.chain_id, chainId);
    if (element.volumeUsd >= 22.5 && element.chain_id === chainId) {
      currentValidLength = currentValidLength + 1;
    }
  });
  console.log(currentValidLength < threshold, currentValidLength, threshold);
  if (data.nextAvailableTimestamp && currentValidLength < threshold) {
    return await getBlockchainTransactionCount(
      walletAddr,
      chainId,
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
    case 'dexmas': {
      const txCount = await getDEXMasTransactionCount(
        eoa,
        strategyOptions?.startTime,
        strategyOptions?.threshold,
        0,
        strategyOptions?.endTime
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
    case 'flyingDragon': {
      const txCount = await getFlyingDragonTransactionCount(
        eoa,
        strategyOptions?.startTime,
        0,
        strategyOptions?.endTimeStamp
      );
      return txCount;
    }
    case 'block': {
      const txCount = await getBlockchainTransactionCount(
        eoa,
        strategyOptions?.chainId,
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
  const strategyOptions = options?.strategyOptions;
  let ethExecutionResult = false;
  for (const element of strategyOptions.ethTokenId) {
    ethExecutionResult = await viewAdapter(eoa[0], false, {
      contractAddress: strategyOptions.ethAddress,
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
    for (const element of strategyOptions.maticTokenId) {
      console.log(element, strategyOptions);
      maticExecutionResult = await viewAdapter(eoa[0], false, {
        contractAddress: strategyOptions.maticAddress,
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
    return 1;
  } else {
    const thresholdCount = await actionOnQuestType(
      strategyOptions.questType,
      eoa[0],
      strategyOptions
    );
    if (strategyOptions.questType === 'flyingDragon') {
      return thresholdCount;
    } else {
      return arithmeticOperand(
        thresholdCount,
        strategyOptions.threshold,
        strategyOptions.operator
      )
        ? 1
        : 0;
    }
  }
}

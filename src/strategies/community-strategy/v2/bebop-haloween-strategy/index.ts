import fetch from 'cross-fetch';
import { StrategyParamsType } from '../../../../types';
import { viewAdapter } from '../../../../adapters/contract';

const getAllHalloweenTransaction = async (
  walletAddr: string,
  startTime: string,
  endTIme: string
) => {
  const res = await fetch(
    `https://api.bebop.xyz/history/v2/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTIme}&size=${1000}`
  );
  const data = await res.json();
  console.log('data', data);
  let status = false;
  for (let i = 0; i < data.results.length; i++) {
    if (Object.keys(data.results[i].sellTokens).length > 1) {
      status = true;
      console.log('sell break', i);
      break;
    }
    if (Object.keys(data.results[i].buyTokens).length > 1) {
      status = true;
      console.log('buy break', i);
      break;
    }
  }
  return status;
};

export async function strategy({ eoa, options }: StrategyParamsType) {
  const strategyOptions = options?.strategyOptions;
  const res = await getAllHalloweenTransaction(
    eoa[0],
    strategyOptions.startTime,
    strategyOptions.endTime
  );
  if (!res) {
    const ethExecutionResult = await viewAdapter(eoa[0], false, {
      contractAddress: strategyOptions.ethAddress,
      type: 'view',
      contractType: 'erc1155',
      balanceThreshold: 0,
      chainId: 1,
      operator: '>',
      functionName: 'balanceOf',
      functionParam: [strategyOptions.ethTokenId],
    });
    return ethExecutionResult;
  } else {
    return res;
  }
}

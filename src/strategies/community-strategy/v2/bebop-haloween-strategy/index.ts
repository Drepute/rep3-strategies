import { StrategyParamsType } from '../../../../types';

const getAllHalloweenTransaction = async (
  walletAddr: string,
  startTime: string,
  endTIme: string
) => {
  const res = await fetch(
    `https://api.bebop.xyz/history/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTIme}&size=${1000}`
  );
  const data = await res.json();
  let status = false;
  // data.results.map((x: any) => {
  for (let i = 0; i < data.results.length; i++) {
    if (Object.keys(data.results[i].sellTokens).length > 1) {
      status = true;
      console.log('sell break', i);
      break;
      // return;
    }
    if (Object.keys(data.results[i].buyTokens).length > 1) {
      status = true;
      console.log('buy break', i);
      break;
      // return;
    }
  }
  // });
  console.log('done !!', status);
  return status;
};

export async function strategy({ eoa, options }: StrategyParamsType) {
  const res = await getAllHalloweenTransaction(
    eoa[0],
    options.startTime,
    options.endTime
  );
  return res;
}

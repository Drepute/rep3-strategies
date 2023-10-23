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
  data.results.map((x: any, i: number) => {
    if (Object.keys(x.sellTokens).length > 1) {
      console.log('done sell!!', i);
      status = true;
      return;
    }
    if (Object.keys(x.buyTokens).length > 1) {
      console.log('done buy!!', i);
      status = true;
      return;
    }
  });
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

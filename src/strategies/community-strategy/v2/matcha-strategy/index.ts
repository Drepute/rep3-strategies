import { StrategyParamsType } from '../../../../types';
import fetch from 'cross-fetch';

const getSwapperEligibility = async (walletAddr: string, tier: number) => {
  const tierToValue = { 0: 1, 1: 10, 2: 100, 3: 1000, 4: 5000 };
  let currentEligibleTier = tier;
  const currentThreshold = tierToValue[currentEligibleTier];
  console.log('current tier threshold', currentEligibleTier, currentThreshold);
  const res = await fetch(
    `https://galxe-endpoints.vercel.app/check?address=${walletAddr}&chain=base&chain=arbitrum&chain=ethereum&chain=polygon&eligibleAmount=${currentThreshold}&campaignStart=2024-02-18T00:00:00-05:00`,
    { method: 'GET', headers: { secret: 'decentralization' } }
  );
  const data = await res.json();
  console.log('data return.....', walletAddr, currentThreshold, data);
  // if (data.is_ok) {
  if (currentThreshold < 5000) {
    currentEligibleTier = currentEligibleTier + 1;
    return await getSwapperEligibility(walletAddr, currentEligibleTier);
  } else {
    console.log('data return fail.....', currentEligibleTier);
    return currentEligibleTier;
  }
};

const actionOnQuestType = async (type: string, eoa: string) => {
  switch (type) {
    case 'matchSwapper': {
      const txCount = await getSwapperEligibility(eoa, 0);
      return txCount;
    }
    default:
      return 0;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
  const strategyOptions = options?.strategyOptions;

  const tierCount = await actionOnQuestType(strategyOptions.questType, eoa[0]);

  return tierCount;
}

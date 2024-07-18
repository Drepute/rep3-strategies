import { arithmeticOperand } from '../../../../adapters/contract';
import { StrategyParamsType } from '../../../../types';
import fetch from 'cross-fetch';
import { ethers } from 'ethers';

const geMoleculeTierCount = async (eoa: string, strategyOptions?: any) => {
  const collectionName = `${strategyOptions.contractAddress}-${strategyOptions.chainId}-${strategyOptions.topic}`;
  const filterParameter = JSON.stringify({
    'args.to': ethers.utils.getAddress(eoa), // only from
  });
  const sortOptions = JSON.stringify({ blockNumber: 1 });
  const transform_options = JSON.stringify({}); //empty obj
  const key = '_'; //from
  const aggregator = 'molecule_balance_single'; // count
  const url = `${strategyOptions.baseUrl}/contract_service/event/aggregate?collection_name=${collectionName}&key=${key}&aggregator=${aggregator}&filter_options=${filterParameter}&sort_options=${sortOptions}&transform_options=${transform_options}`;
  console.log(url);
  const response = await fetch(url);
  const res = await response.json();
  return arithmeticOperand(
    parseInt(res?.data?.result),
    strategyOptions.threshold,
    strategyOptions.operator
  )
    ? 1
    : 0;
};

const actionOnQuestType = async (
  type: string,
  eoa: string,
  strategyOptions: any
) => {
  switch (type) {
    case 'moleculeOnboarding': {
      const tierCount = await geMoleculeTierCount(eoa, strategyOptions);
      return tierCount;
    }
    default:
      return 0;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
  const strategyOptions = options?.strategyOptions;

  const tierCount = await actionOnQuestType(
    strategyOptions.questType,
    eoa[0],
    strategyOptions
  );
  console.log(tierCount);
  return tierCount;
}

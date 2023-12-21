import { arithmeticOperand } from '../../../../adapters/contract';
import { StrategyParamsType } from '../../../../types';
import fetch from 'cross-fetch';
const getAggregateSum = async (eoa: string, strategyOptions?: any) => {
  const collectionName = `${strategyOptions.contractAddress}-${strategyOptions.chainId}-${strategyOptions.topic}`;
  const filterParameter = JSON.stringify({
    'args.partner': '0xF2F2FE93A744EcE90133F58F783f86C5b50FcF1B',
    'args.inputToken': '0x0000000000000000000000000000000000000000',
    'args.sender': eoa,
  });
  const sortOptions = JSON.stringify({ blockNumber: 1 });
  const transform_options = JSON.stringify({
    adapters: [{ name: 'usd_volume' }],
    params_list: [{ symbol: 'MATIC', decimals: 18, frequency: 60 }],
  });
  const key = 'inputAmount';
  const aggregator = 'sum';
  const url = `${strategyOptions.baseUrl}/contract_service/event/aggregate?collection_name=${collectionName}&key=${key}&aggregator=${aggregator}&filter_options=${filterParameter}&sort_options=${sortOptions}&transform_options=${transform_options}`;
  console.log(url);
  const response = await fetch(url);
  const res = await response.json();
  console.log(JSON.stringify(res));
  return res?.data?.result;
};

const actionOnQuestType = async (
  type: string,
  eoa: string,
  strategyOptions?: any
) => {
  switch (type) {
    case 'investor-badge': {
      const priceCount = await getAggregateSum(eoa, strategyOptions);
      return priceCount;
    }
    default:
      return 0;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
  const executionCount = await actionOnQuestType(
    options?.strategyOptions.questType,
    eoa[0],
    options?.strategyOptions
  );
  console.log(executionCount);

  return arithmeticOperand(
    executionCount,
    options?.strategyOptions.threshold,
    options?.strategyOptions.operator
  )
    ? options?.strategyOptions?.tier
    : 0;
}

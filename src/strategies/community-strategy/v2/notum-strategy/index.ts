import { arithmeticOperand } from '../../../../adapters/contract';
import { StrategyParamsType } from '../../../../types';
// import fetch from 'cross-fetch';
// const getAggregateSum = async (eoa: string, strategyOptions?: any) => {
//   const collectionName = `${strategyOptions.contractAddress}-${strategyOptions.chain_id}-${strategyOptions.topic}`;
//   const filterParameter = {
//     'args.partner': '0xF2F2FE93A744EcE90133F58F783f86C5b50FcF1B',
//     'args.inputToken': '0x0000000000000000000000000000000000000000',
//     'args.address': eoa,
//   };
//   const transform_options = {
//     adapters: [{ name: 'usd_volume' }],
//     params_list: [
//       {
//         symbol: 'MATIC',
//         decimals: 18,
//         frequency: 60,
//       },
//     ],
//   };
//   const url = `${
//     strategyOptions.baseUrl
//   }/${`contract_service/event/aggregate`}?collection_name=${collectionName}&key=inputAmount&aggregator=sum&filter_options=${filterParameter}&sort_options=${{
//     blockNumber: 1,
//   }}&transform_options=${transform_options}`;
//   const response = await fetch(url);
//   const res = await response.json();
//   console.log(res.data.result);
//   return 500;
// };

// const actionOnQuestType = async (
//   type: string,
//   eoa: string,
//   strategyOptions?: any
// ) => {
//   switch (type) {
//     case 'investor-badge': {
//       const priceCount = await getAggregateSum(eoa, strategyOptions);
//       return priceCount;
//     }
//     default:
//       return 0;
//   }
// };
export async function strategy({ eoa, options }: StrategyParamsType) {
  console.log(
    'tier......',
    eoa,
    arithmeticOperand(
      500,
      options?.strategyOptions.threshold,
      options?.strategyOptions.operator
    ),
    options
  );
  // const executionCount = await actionOnQuestType(
  //   options?.strategyOptions.questType,
  //   eoa[0],
  //   options?.strategyOptions
  // );
  return arithmeticOperand(
    500,
    options?.strategyOptions.threshold,
    options?.strategyOptions.operator
  )
    ? options?.strategyOptions?.tier
    : 0;
}

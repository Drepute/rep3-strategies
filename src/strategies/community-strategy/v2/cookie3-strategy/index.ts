import { StrategyParamsType } from '../../../../types';
import { getAndLogCsvFile } from '../../../whitelister-strategy';

const actionOnQuestType = async (
  type: string,
  options: any,
  strategyOptions: any
) => {
  switch (type) {
    case 'whitelist': {
      const dataList = await getAndLogCsvFile(
        strategyOptions?.csvBucketName,
        strategyOptions?.csvKey
      );
      if (dataList) {
        let isIncluded = false;
        dataList?.map(x => {
          console.log(
            x?.split(',')[0]?.includes(options?.twitterUserTokens?.username)
          );
          if (
            x?.split(',')[0]?.includes(options?.twitterUserTokens?.username)
          ) {
            isIncluded = true;
          }
        });
        return isIncluded ? 1 : 0;
      } else {
        return 0;
      }
    }
    default:
      return 0;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
  const strategyOptions = options?.strategyOptions;
  // const tier = options;
  console.log(eoa);
  const thresholdCount = await actionOnQuestType(
    strategyOptions.questType,
    options,
    strategyOptions
  );
  return thresholdCount;
}

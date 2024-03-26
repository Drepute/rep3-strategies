import { StrategyParamsType } from '../../../../types';
import { getAndLogCsvFile } from '../../../whitelister-strategy';

const actionOnQuestType = async (
  type: string,
  eoa: string,
  strategyOptions: any
) => {
  switch (type) {
    case 'whitelist': {
      const eoaList = await getAndLogCsvFile(
        strategyOptions?.csvBucketName,
        strategyOptions?.csvKey
      );
      if (eoaList) {
        const formattedList = eoaList?.map(x =>
          x?.split(',')[0]?.toLowerCase()
        );
        console.log(formattedList);
        return formattedList?.includes(eoa?.toLowerCase()) ? 1 : 0;
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
  const thresholdCount = await actionOnQuestType(
    strategyOptions.questType,
    eoa[0],
    strategyOptions
  );
  return thresholdCount;
}

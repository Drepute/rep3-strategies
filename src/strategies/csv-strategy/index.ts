// import fetch from 'cross-fetch';

import AWS from 'aws-sdk';
import { arithmeticOperand } from '../../adapters/contract';
import { StrategyParamsType } from '../../types';

const s3 = new AWS.S3();
//https://rep3-community-files.s3.amazonaws.com/trader_joe.csv
async function getAndLogCsvFile(Bucket: string, bucketKey: string) {
  const params = {
    Bucket: Bucket,
    Key: bucketKey,
  };
  try {
    const data = await s3.getObject(params).promise();
    const csvData = data?.Body?.toString('utf-8');
    console.log('CSV file contents:', csvData?.split('\n'));
    return csvData?.split('\n');
  } catch (err) {
    console.error('Error getting CSV file:', err);
    return false;
  }
}
const traderJoeCSVProcessing = (res: any) => {
  const result = res.map(x => {
    const singleRow = x.split(',');
    return {
      addr: singleRow[0],
      value: parseInt(singleRow[2]),
      epoches: singleRow[1],
    };
  });
  return result;
};
const calculateTraderJoeEpochTier = (epoches: number) => {
  if (epoches > 1 && epoches <= 2) {
    return 1;
  } else if (epoches > 3 && epoches <= 4) {
    return 2;
  } else if (epoches > 5 && epoches <= 6) {
    return 3;
  } else if (epoches > 7 && epoches <= 8) {
    return 4;
  } else if (epoches > 9 && epoches <= 10) {
    return 5;
  } else if (epoches > 11 && epoches <= 12) {
    return 6;
  } else {
    return 1;
  }
};
const calculateTraderJoeValueTier = (value: number) => {
  if (value < 250) {
    return 1;
  } else if (value > 250 && value < 500) {
    return 2;
  } else if (value > 500 && value < 1000) {
    return 3;
  } else if (value > 1000 && value < 2500) {
    return 4;
  } else if (value > 2500 && value < 5000) {
    return 5;
  } else if (value > 5000) {
    return 6;
  } else {
    return 1;
  }
};
const traderJoeTierCompute = (eoa: string, processedArray: any[]) => {
  const currentEoaArray = processedArray.filter(
    x => x.addr.toLowerCase() === eoa.toLowerCase()
  );
  console.log(currentEoaArray, processedArray.length);
  if (currentEoaArray.length > 0) {
    const currentValueTier = calculateTraderJoeValueTier(
      currentEoaArray?.[0]?.value
    );
    const currentEpochTier = calculateTraderJoeEpochTier(
      parseInt(currentEoaArray?.[0]?.epoches)
    );

    return {
      executionResult: true,
      tier:
        currentValueTier && currentEpochTier
          ? 6 * (currentValueTier - 1) + currentEpochTier
          : 1,
    };
  } else {
    return {
      executionResult: false,
      tier: 1,
    };
  }
};
const entagleOatCSVProcessing = (res: any) => {
  const result = res.map(x => {
    const singleRow = x.split(',');
    return {
      addr: singleRow[0],
      tier: parseInt(singleRow[1]),
    };
  });
  return result;
};
const computeDataOnType = async (
  type: 'trader-joe' | 'entangle-oat' | any,
  eoa: string,
  csvRes: any,
  options: any,
  tier?: number
) => {
  switch (type) {
    case 'entangle-oat': {
      const results = entagleOatCSVProcessing(csvRes);
      return arithmeticOperand(
        parseInt(
          results.filter(x => x.addr.toLowerCase() === eoa.toLowerCase())[0]
            ?.tier
        ),
        options.threshold,
        options.operator
      );
    }
    case 'trader-joe': {
      const results = traderJoeCSVProcessing(csvRes);
      console.log(traderJoeTierCompute(eoa, results)?.tier, tier);
      const executionResult = traderJoeTierCompute(eoa, results);

      return tier
        ? arithmeticOperand(executionResult?.tier, tier, '===')
        : false;
    }
    default:
      return;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
  const res = await getAndLogCsvFile(
    options?.variable?.strategyOptions?.csvBucketName,
    options?.variable?.strategyOptions?.csvKey
  );
  const result = await computeDataOnType(
    options?.variable?.strategyOptions?.subType,
    eoa[0],
    res,
    options?.variable?.strategyOptions,
    options?.tier
  );
  return result;
}

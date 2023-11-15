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
      value: parseFloat(singleRow[2]),
      epoches: singleRow[1],
    };
  });
  return result;
};
//epoch=>tie rmap
const calculateTraderJoeEpochTier = (epoches: number) => {
  if (epoches >= 11) {
    return 6;
  } else if (epoches >= 9) {
    return 5;
  } else if (epoches >= 7) {
    return 4;
  } else if (epoches >= 5) {
    return 3;
  } else if (epoches >= 3) {
    return 2;
  } else if (epoches >= 1) {
    return 1;
  } else {
    return 0;
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
  type: 'traderJoe' | 'entangleOat' | any,
  eoa: string,
  csvRes: any,
  options: any,
  tier?: number
) => {
  switch (type) {
    case 'entangleOat': {
      const results = entagleOatCSVProcessing(csvRes);
      console.log(
        results.filter(x => x.addr.toLowerCase() === eoa.toLowerCase())
      );
      const res = arithmeticOperand(
        parseInt(
          results.filter(x => x.addr.toLowerCase() === eoa.toLowerCase())[0]
            ?.tier
        ),
        options.threshold,
        options.operator
      );

      return res || false;
    }
    case 'traderJoe': {
      const results = traderJoeCSVProcessing(csvRes);
      const executionResult = traderJoeTierCompute(eoa, results);
      return tier
        ? arithmeticOperand(executionResult?.tier, tier, '===') || false
        : false;
    }
    default:
      return false;
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

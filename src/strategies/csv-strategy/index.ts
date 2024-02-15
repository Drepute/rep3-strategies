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
      percentile: parseFloat(singleRow[2]),
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
// const calculateTraderJoePercentileTier = (percentile: number) => {
//   if (percentile >= 11) {
//     return 6;
//   } else if (percentile >= 9) {
//     return 5;
//   } else if (percentile >= 7) {
//     return 4;
//   } else if (percentile >= 5) {
//     return 3;
//   } else if (percentile >= 3) {
//     return 2;
//   } else if (percentile >= 20) {
//     return 1;
//   } else {
//     return 0;
//   }
// };
const calculateTraderJoePercentileTier = (percentile: number) => {
  if (percentile < 20) {
    return 1;
  } else if (percentile >= 20 && percentile < 40) {
    return 2;
  } else if (percentile >= 40 && percentile < 60) {
    return 3;
  } else if (percentile >= 60 && percentile < 80) {
    return 4;
  } else if (percentile >= 80 && percentile < 98) {
    return 5;
  } else if (percentile >= 98) {
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
    const currentPercentileTier = calculateTraderJoePercentileTier(
      currentEoaArray?.[0]?.percentile
    );
    const currentEpochTier = calculateTraderJoeEpochTier(
      parseInt(currentEoaArray?.[0]?.epoches)
    );

    return {
      executionResult: true,
      tier:
        currentPercentileTier && currentEpochTier
          ? 6 * (currentPercentileTier - 1) + currentEpochTier
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
      console.log('trader joe', tier);
      return tier
        ? arithmeticOperand(executionResult?.tier, tier, '===') || false
        : false;
    }
    default:
      return false;
  }
};
export async function strategy(
  onlyValue: boolean,
  { contractAddress, eoa, options }: StrategyParamsType
) {
  console.log('csv', contractAddress, onlyValue, options);
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

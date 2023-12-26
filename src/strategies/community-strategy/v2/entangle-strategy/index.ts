import { StrategyParamsType } from '../../../../types';
import fetch from 'cross-fetch';
import AWS from 'aws-sdk';

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
const getTestTransactionCount = async (eoa: string, strategyOptions?: any) => {
  console.log(strategyOptions);
  const totalStakingTransactionCount = await getTotalStakingTransactionCount(
    eoa
  );
  const totalDelegateTransactionCount = await getTotalDelegateTransactionCount(
    eoa
  );
  const yAxisTier = await calculateYaxisTxnTier(
    parseInt(totalStakingTransactionCount) +
      parseInt(totalDelegateTransactionCount)
  );

  let xAxisTier = 0;
  if (
    parseInt(totalStakingTransactionCount) +
      parseInt(totalDelegateTransactionCount) >
    0
  ) {
    xAxisTier =
      totalStakingTransactionCount > 0
        ? await calculateXaxisTxnTier(totalStakingTransactionCount, eoa)
        : 1;
  }
  console.log('csv.....', xAxisTier);
  const tier = 5 * (xAxisTier - 1) + yAxisTier;
  return tier;
};
const calculateXaxisTxnTier = async (totalTxns: number, eoa: string) => {
  const res = await getAndLogCsvFile(
    'rep3-community-files',
    'entangle_testnet.csv'
  );
  let streakOfTxn = 1;
  let xAxisTier = 1;

  if (res) {
    res.forEach(x => {
      const singleRow = x.split(',');
      console.log(singleRow[0], singleRow[1]);
      if (singleRow[0].toString().toLowerCase() === eoa.toLowerCase()) {
        streakOfTxn = parseInt(singleRow[1]);
      }
    });
  }
  if (totalTxns > 0) {
    xAxisTier = 2;
  }
  if (streakOfTxn >= 9) {
    return 10;
  } else if (streakOfTxn >= 8) {
    return 9;
  } else if (streakOfTxn >= 7) {
    return 8;
  } else if (streakOfTxn >= 6) {
    return 7;
  } else if (streakOfTxn >= 5) {
    return 6;
  } else if (streakOfTxn >= 4) {
    return 5;
  } else if (streakOfTxn >= 3) {
    return 4;
  } else if (streakOfTxn >= 2) {
    return 3;
  } else {
    return xAxisTier;
  }
};
const calculateYaxisTxnTier = async (totalTxns: number) => {
  if (totalTxns > 100) {
    return 5;
  } else if (totalTxns > 40) {
    return 4;
  } else if (totalTxns > 20) {
    return 3;
  } else if (totalTxns >= 10) {
    return 2;
  } else if (totalTxns >= 1) {
    return 1;
  } else {
    return 0;
  }
};
const getTotalStakingTransactionCount = async (eoa: string): Promise<any> => {
  const query = `query ($address: String!) {
    info(address: $address, eventName: "LPStaking") {
      network
      total_tx
      data
    }
  }`;
  const res = await fetch('https://entangle-graphql.entangle.fi/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { address: eoa },
    }),
  });
  const response = await res.json();
  let allStakeTxCount = response?.data?.info?.map(x => x?.total_tx);
  allStakeTxCount = allStakeTxCount?.reduce(
    (partialSum, a) => partialSum + a,
    0
  );
  console.log('txn', allStakeTxCount);
  return allStakeTxCount;
};
const getTotalDelegateTransactionCount = async (eoa: string): Promise<any> => {
  const query = `query ($address: String!) {
    info(address: $address, eventName: "Delegate") {
      network
      total_tx
      data
    }
  }`;
  const res = await fetch('https://entangle-graphql.entangle.fi/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { address: eoa },
    }),
  });
  const response = await res.json();
  console.log('txn', response?.data?.info);
  let allDelegateTxCount = response?.data?.info?.map(x => x?.total_tx);
  allDelegateTxCount = allDelegateTxCount?.reduce(
    (partialSum, a) => partialSum + a,
    0
  );
  return allDelegateTxCount;
};
const actionOnQuestType = async (
  type: string,
  eoa: string,
  strategyOptions?: any
) => {
  switch (type) {
    case 'testnet-transaction': {
      const txCount = await getTestTransactionCount(eoa, strategyOptions);
      return txCount;
    }
    default:
      return 0;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
  console.log('tier......', options);
  const tier = await actionOnQuestType(
    options?.strategyOptions.questType,
    eoa[0],
    options?.strategyOptions
  );

  return tier;
}

import { StrategyParamsType } from '../../../../types';
import fetch from 'cross-fetch';

const getTestTransactionCount = async (eoa: string, strategyOptions?: any) => {
  console.log(strategyOptions);
  const totalStakingTransactionCount = await getTotalStakingTransactionCount(
    eoa
  );
  const totalDelegateTransactionCount = await getTotalDelegateTransactionCount(
    eoa
  );
  const yAxisTier = calculateYaxisTxnTier(
    parseInt(totalStakingTransactionCount) +
      parseInt(totalDelegateTransactionCount)
  );
  let xAxisTier = 0;
  if (
    parseInt(totalStakingTransactionCount) +
      parseInt(totalDelegateTransactionCount) >
    0
  ) {
    xAxisTier = totalStakingTransactionCount > 0 ? 2 : 1;
  }
  const tier = 5 * (xAxisTier - 1) + yAxisTier;
  return tier;
};
const calculateYaxisTxnTier = (totalTxns: number) => {
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
  console.log('quest', options.questType);
  const tier = await actionOnQuestType(options.questType, eoa[0], options);
  console.log('tier......', tier);
  return tier;
}

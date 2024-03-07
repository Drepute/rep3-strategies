import { ethers } from 'ethers';
import { arithmeticOperand, viewAdapter } from '../../../../adapters/contract';
import { StrategyParamsType } from '../../../../types';
// import { arithmeticOperand, viewAdapter } from '../../../../adapters/contract';
import fetch from 'cross-fetch';
import { subgraph } from '../../../../utils';
const structSwapCounts = async (userAddress: string, strategyOptions: any) => {
  const query_1 = `query ($userAddress: String!) {
      depositeds(where:{userAddress: $userAddress}) {
        id
        depositAmount
        totalDeposited
      }
    }`;
  const subgraphData = await subgraph.getSubgraphFetchCall(
    'https://api.thegraph.com/subgraphs/name/hirako2000/struct-finance-factory',
    query_1,
    { userAddress }
  );
  if (subgraphData?.depositeds.length) {
    console.log('struct', subgraphData?.depositeds.length);
    return arithmeticOperand(
      subgraphData?.depositeds.length,
      4,
      strategyOptions.operator
    )
      ? 2
      : arithmeticOperand(
          subgraphData?.depositeds.length,
          2,
          strategyOptions.operator
        )
      ? 1
      : 0;
  } else {
    return 0;
  }
};
const getWoofiEventTotalCount = async (eoa: string, strategyOptions?: any) => {
  let collectionName = `${strategyOptions.contractAddress[0]}-${strategyOptions.chainId}-${strategyOptions.topic}`;
  let filterParameter = JSON.stringify({
    'args.from': ethers.utils.getAddress(eoa), // only from
  });
  let sortOptions = JSON.stringify({ blockNumber: 1 });
  let transform_options = JSON.stringify({}); //empty obj
  let key = 'from'; //from
  let aggregator = 'count'; // count
  let url = `${strategyOptions.baseUrl}/contract_service/event/aggregate?collection_name=${collectionName}&key=${key}&aggregator=${aggregator}&filter_options=${filterParameter}&sort_options=${sortOptions}&transform_options=${transform_options}`;
  console.log(url);
  const response = await fetch(url);
  const res = await response.json();
  console.log('hereee', JSON.stringify(res?.data?.result));
  collectionName = `${strategyOptions.contractAddress[1]}-${strategyOptions.chainId}-${strategyOptions.topic}`;
  filterParameter = JSON.stringify({
    'args.from': ethers.utils.getAddress(eoa), // only from
  });
  sortOptions = JSON.stringify({ blockNumber: 1 });
  transform_options = JSON.stringify({}); //empty obj
  key = 'from'; //from
  aggregator = 'count'; // count
  url = `${strategyOptions.baseUrl}/contract_service/event/aggregate?collection_name=${collectionName}&key=${key}&aggregator=${aggregator}&filter_options=${filterParameter}&sort_options=${sortOptions}&transform_options=${transform_options}`;
  console.log(url);
  const response2 = await fetch(url);
  const res2 = await response2.json();

  console.log('Count..........', res2?.data, res?.data);
  const totalCount = (res2?.data?.result || 0) + (res?.data?.result || 0);
  const tier1 = arithmeticOperand(
    parseInt(totalCount),
    strategyOptions.threshold,
    strategyOptions.operator
  )
    ? 1
    : 0;
  if (tier1) {
    const WooTokenBalance = await viewAdapter(eoa, false, {
      contractAddress: '0xcd1B9810872aeC66d450c761E93638FB9FE09DB0',
      type: 'view',
      contractType: 'erc20',
      balanceThreshold: 0,
      chainId: 43114,
      operator: '>',
      functionName: 'balanceOf',
      functionParam: [],
    });
    console.log(WooTokenBalance);
    const newWooTokenBalance = await viewAdapter(eoa, false, {
      contractAddress: '0x3Bd96847C40De8b0F20dA32568BD15462C1386E3',
      type: 'view',
      contractType: 'custom',
      balanceThreshold: 0,
      chainId: 43114,
      operator: '>',
      functionName: 'balances',
      functionParam: ['<USER_ADDRESS>'],
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'balances',
          outputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
    });
    console.log('Token balances', WooTokenBalance, newWooTokenBalance);
    return WooTokenBalance || newWooTokenBalance ? 2 : 1;
  } else {
    return 0;
  }
};
const traderJoeSwapCounts = async (sender: string, strategyOptions: any) => {
  const query_1 = `query ($sender: String!) {
    swaps(where:{sender: $sender}) {
      amountUSD
      id
      sender
      activeId
      amountXIn
      amountXOut
      amountYIn
      amountYOut
      feesTokenX
      feesTokenY
      feesUSD
      }
    }`;
  const subgraphData = await subgraph.getSubgraphFetchCall(
    'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/joe-v2',
    query_1,
    { sender }
  );
  if (subgraphData?.swaps.length) {
    return arithmeticOperand(
      subgraphData?.swaps.length,
      strategyOptions.threshold,
      strategyOptions.operator
    )
      ? 2
      : 0;
  } else {
    return 0;
  }
};
const geBetSwirlsTierCount = async (eoa: string, strategyOptions?: any) => {
  console.log(strategyOptions);
  const betSwirlsBets = await viewAdapter(eoa, true, {
    contractAddress: '0x272b4dD8E842BE1012C9CCBB89B636996f9BAe98',
    type: 'view',
    contractType: 'custom',
    balanceThreshold: 0,
    chainId: 43114,
    operator: '>',
    functionName: 'getLastUserBets',
    functionParam: ['<USER_ADDRESS>', 1],
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'user',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'dataLength',
            type: 'uint256',
          },
        ],
        name: 'getLastUserBets',
        outputs: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'bool',
                    name: 'resolved',
                    type: 'bool',
                  },
                  {
                    internalType: 'address payable',
                    name: 'user',
                    type: 'address',
                  },
                  {
                    internalType: 'address',
                    name: 'token',
                    type: 'address',
                  },
                  {
                    internalType: 'uint256',
                    name: 'id',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'amount',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'blockNumber',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'payout',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'vrfCost',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct Game.Bet',
                name: 'bet',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'bool',
                    name: 'face',
                    type: 'bool',
                  },
                  {
                    internalType: 'bool',
                    name: 'rolled',
                    type: 'bool',
                  },
                ],
                internalType: 'struct CoinToss.CoinTossBet',
                name: 'coinTossBet',
                type: 'tuple',
              },
            ],
            internalType: 'struct CoinToss.FullCoinTossBet[]',
            name: '',
            type: 'tuple[]',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
  });
  console.log('Token balances', betSwirlsBets);
  return betSwirlsBets.length > 0 ? 2 : 0;
};
const geMuxTierCount = async (eoa: string, strategyOptions?: any) => {
  const collectionName = `${strategyOptions.contractAddress}-${strategyOptions.chainId}-${strategyOptions.topic}`;
  const filterParameter = JSON.stringify({
    'args.trader': ethers.utils.getAddress(eoa), // only from
  });
  const sortOptions = JSON.stringify({ blockNumber: 1 });
  const transform_options = JSON.stringify({}); //empty obj
  const key = '_'; //from
  const aggregator = 'mux_v1'; // count
  const url = `${strategyOptions.baseUrl}/contract_service/event/aggregate?collection_name=${collectionName}&key=${key}&aggregator=${aggregator}&filter_options=${filterParameter}&sort_options=${sortOptions}&transform_options=${transform_options}`;
  console.log(url);
  const response = await fetch(url);
  const res = await response.json();
  return arithmeticOperand(
    parseInt(res?.data?.result),
    strategyOptions.threshold,
    strategyOptions.operator
  )
    ? 2
    : 0;
};
const actionOnQuestType = async (
  type: string,
  eoa: string,
  strategyOptions: any
) => {
  console.log(strategyOptions);
  switch (type) {
    case 'struct': {
      const txCount = await structSwapCounts(eoa, strategyOptions);
      return txCount;
    }
    case 'woofi': {
      const txCount = await getWoofiEventTotalCount(eoa, strategyOptions);
      return txCount;
    }
    case 'trader-joe': {
      const tierCount = await traderJoeSwapCounts(eoa, strategyOptions);
      return tierCount;
    }
    case 'bet-swirl': {
      const tierCount = await geBetSwirlsTierCount(eoa, strategyOptions);
      return tierCount;
    }
    case 'mux': {
      const tierCount = await geMuxTierCount(eoa, strategyOptions);
      return tierCount;
    }
    default:
      return 0;
  }
};

export async function strategy({ eoa, options }: StrategyParamsType) {
  const strategyOptions = options?.strategyOptions;
  console.log(strategyOptions);
  const thresholdCount = await actionOnQuestType(
    strategyOptions.questType,
    eoa[0],
    strategyOptions
  );
  console.log('eligible tier', thresholdCount);
  return thresholdCount;
}

import ActionCallerV2 from '../../actions/v2';
import { ActionOnTypeV2 } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';
import fetch from 'cross-fetch';
import { ethers } from 'ethers';
import { network } from '../../network';
// import { createClient } from 'redis';
import { getAllClaimedMembers } from '../../actions/utils/helperFunctionsV2';
// let redisClient;
// (async () => {
//   redisClient = createClient({
//     password: 'CW4xB0fi22GN6Enp8z6P4PUJt3cVRP30',
//     socket: {
//       host: 'redis-12292.c15.us-east-1-2.ec2.cloud.redislabs.com',
//       port: 12292,
//     },
//   });

//   redisClient.on('error', error => console.error(`Error : ${error}`));

//   await redisClient.connect();
// })();

const getAllPaginatedStakers = async (
  url: string,
  tokensId: any,
  lastId: string,
  page = 0,
  allStakers: any[] = [],
  holder: string[]
) => {
  const stakers = await subgraph.subgraphRequest(url, {
    userInfos: {
      __args: {
        where: {
          token: tokensId,
          id_gt: lastId,
          address_in: holder,
        },
        first: 1000,
      },
      id: true,
      address: true,
      cumulativeBalance: true,
      blockTimestamp: true,
      token: { id: true },
    },
  });
  const all = allStakers.concat(stakers.userInfos);

  if (stakers.userInfos.length === 1000) {
    page = page + 1;
    const res: any[] | undefined = await getAllPaginatedStakers(
      url,
      tokensId,
      all[all.length - 1].id,
      page,
      all,
      holder
    );
    return res;
  } else {
    return all;
  }
};

const getAllStakers = async (
  url: string,
  tokensId: any,
  page = 0,
  allStakers: any[] = [],
  holder: string[]
) => {
  if (page < 1) {
    const stakers = await subgraph.subgraphRequest(url, {
      userInfos: {
        __args: {
          where: {
            token: tokensId,
            address_in: holder,
          },
          orderBy: 'blockTimestamp',
          orderDirection: 'asc',
          skip: page * 100,
        },
        id: true,
        address: true,
        cumulativeBalance: true,
        blockTimestamp: true,
        token: { id: true },
      },
    });
    const all = allStakers.concat(stakers.userInfos);
    if (stakers.userInfos.length === 100) {
      page = page + 1;
      const res: any[] | undefined = await getAllStakers(
        url,
        tokensId,
        page,
        all,
        holder
      );
      return res;
    } else {
      return all;
    }
  } else {
    return await getAllPaginatedStakers(
      url,
      tokensId,
      allStakers[allStakers.length - 1].id,
      page,
      allStakers,
      holder
    );
  }
};

// const getAllTokenInfo = async (
//   url: string,
//   page = 0,
//   allTokens: any[] = []
// ) => {
//   const stakers = await subgraph.subgraphRequest(url, {
//     stakedTokenInfos: {
//       __args: {
//         skip: page * 100,
//       },
//       id: true,
//       cumulativeStaked: true,
//     },
//   });
//   const all = allTokens.concat(stakers.stakedTokenInfos);

//   if (stakers.stakedTokenInfos.length === 100) {
//     page = page + 1;
//     const res: any[] | undefined = await getAllTokenInfo(url, page, all);
//     return res;
//   } else {
//     return all;
//   }
// };

const getPriceOfToken = async (tokenSymbol: string) => {
  try {
    const res = await fetch(
      `https://test-staging.api.drepute.xyz/dao_tool_server/strategy/token_price?token=${tokenSymbol}`
    );
    const data = await res.json();
    return data.data.price;
  } catch (error) {
    //console.log(error);
  }
};

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function timeDifference(date1: number, date2: number) {
  const difference = date1 - date2;
  return (difference * 1000) / 86400000;
}

const calculateMonthsOnStaking = (startTime: number) => {
  return Math.floor(timeDifference(getTimestampInSeconds(), startTime));
};
// weth
// wrapped-bitcoin
// usd-coin
// dai
const calculateAmount = (holderInfo: any[], poolInfo: any[]) => {
  const allUsdAmount = holderInfo.map(x => {
    return (
      poolInfo.filter(y => y.addr.toLowerCase() === x.token.id.toLowerCase())[0]
        .usdAmount *
      x.cumulativeBalance *
      poolInfo.filter(y => y.addr.toLowerCase() === x.token.id.toLowerCase())[0]
        .exchangeRate
    );
  });

  return allUsdAmount.reduce((partialSum, a) => partialSum + a, 0);
};

const calculateTiers = (holderInfo: any[], poolInfo: any[]) => {
  // Hold ACX Token

  let tier = 0;
  let tokenTier = 0;
  let volumeTier = 0;
  let stakingTier = 1;
  if (
    holderInfo.filter(
      x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
    ).length === 1
    // holderInfo.filter(
    //   x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
    // )[0]?.cumulativeBalance !== '0'&&eoaLength>1
  ) {
    tier = holderInfo.filter(x => x.cumulativeBalance !== '0').length;
    tokenTier = holderInfo.filter(x => x.cumulativeBalance !== '0').length;
    if (tier === 0) {
      tier = 1;
      tokenTier = 1;
    }

    const acxInfo = holderInfo.filter(
      x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
    );

    if (
      holderInfo.filter(
        x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
      )[0]?.cumulativeBalance !== '0'
    ) {
      const daysOfStaking =
        calculateMonthsOnStaking(acxInfo[0]?.blockTimestamp) + 1;

      if (daysOfStaking >= 100) {
        tier = tier * 2;
        stakingTier = 2;
      }
    }
    const amount = calculateAmount(holderInfo, poolInfo);
    console.log(amount);
    if (amount * 10e-18 < 500) {
      tier = tier * 1;
      volumeTier = 1;
    } else if (amount * 10e-18 >= 500 && amount * 10e-18 <= 1500) {
      tier = tier * 2;
      volumeTier = 2;
    } else if (amount * 10e-18 > 1500 && amount * 10e-18 <= 5000) {
      tier = tier * 3;
      volumeTier = 3;
    } else if (amount * 10e-18 > 5000) {
      tier = tier * 4;
      volumeTier = 4;
    }
    return { mainTier: tier, volumeTier, tokenTier, stakingTier };
  } else {
    return {
      mainTier: 0,
      volumeTier: 1,
      tokenTier: holderInfo.length,
      stakingTier,
    };
  }
};
const geCurrentExchangeRate = async (tokenAddress: string) => {
  const provider = new ethers.providers.JsonRpcProvider(network['1'].rpc);
  const hubpool = new ethers.Contract(
    '0xc186fA914353c44b2E33eBE05f21846F1048bEda',
    [
      {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'pooledTokens',
        outputs: [
          { internalType: 'address', name: 'lpToken', type: 'address' },
          { internalType: 'bool', name: 'isEnabled', type: 'bool' },
          { internalType: 'uint32', name: 'lastLpFeeUpdate', type: 'uint32' },
          { internalType: 'int256', name: 'utilizedReserves', type: 'int256' },
          { internalType: 'uint256', name: 'liquidReserves', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'undistributedLpFees',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    provider
  );
  const pooledToken = await hubpool.pooledTokens(tokenAddress);
  const lpToken = new ethers.Contract(
    pooledToken.lpToken,
    [
      {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [
          {
            name: '',
            type: 'uint256',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
    ],
    provider
  );
  const totalSupply = await lpToken.totalSupply();
  const numerator =
    parseInt(pooledToken.liquidReserves.toString()) +
    (parseInt(pooledToken.utilizedReserves.toString()) -
      parseInt(pooledToken.undistributedLpFees.toString()));
  return numerator / totalSupply;
};
export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  const SUBGRAPH_LINKS = {
    mainnet: {
      staking:
        'https://api.thegraph.com/subgraphs/name/eth-jashan/across-staking',
    },
    testnet: {
      staking:
        'https://api.thegraph.com/subgraphs/name/eth-jashan/across-staking-test',
    },
  };
  
  const poolInfo = [
    {
      addr: '0x59C1427c658E97a7d568541DaC780b2E5c8affb4',
      name: 'wrapped-bitcoin',
      erc20Addr: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    },
    {
      addr: '0x4FaBacAC8C41466117D6A38F46d08ddD4948A0cB',
      name: 'dai',
      erc20Addr: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    {
      addr: '0xC9b09405959f63F72725828b5d449488b02be1cA',
      name: 'usd-coin',
      erc20Addr: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      addr: '0x28F77208728B0A45cAb24c4868334581Fe86F95B',
      name: 'weth',
      erc20Addr: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    {
      addr: '0xb0C8fEf534223B891D4A430e49537143829c4817',
      name: 'across-protocol',
      erc20Addr: '0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F',
    },
  ];
  const network: 'mainnet' | 'testnet' = options.network;
  const SUBGRAPH_URLS = SUBGRAPH_LINKS[network];

  if (poolInfo) {
    let stakers: any[] = [];
    let stakerListAddress: any[] = [];
    const promisesTokenUSDPrice = poolInfo.map(async (x: any) => {
      try {
        const usdPrice = await getPriceOfToken(x.name);
        const exchangeRate = await geCurrentExchangeRate(x.erc20Addr);
        return { ...x, usdAmount: usdPrice, exchangeRate };
      } catch (error) {
        console.log('error', error);
      }
    });
    const poolInfoWithUsd = await Promise.all(promisesTokenUSDPrice);
    if (eoa.length === 1) {
      console.log(eoa)
      const promises = poolInfo
        .filter(x => x.addr !== '0xc2fab88f215f62244d2e32c8a65e8f58da8415a5')
        .map(async (x: any) => {
          try {
            const stakersList = await getAllStakers(
              SUBGRAPH_URLS.staking,
              x.addr,
              0,
              [],
              eoa
            );
            stakers = stakers.concat(stakersList);
          } catch (error) {
            //console.log('error', error);
          }
        });
      await Promise.all(promises);
      stakerListAddress = stakers.map(x => x.address);
    } else {
      // const pageNumber = parseInt(await redisClient.get('across-strategy'));
      // const addressLimit = pageNumber !== 0 ? pageNumber * 50 : 50;
      const allMembers = await getAllClaimedMembers(
        contractAddress,
        0,
        options.network === 'mainnet' ? 137 : 80001,
        0,
        []
      );
      stakerListAddress = allMembers.map(x => x.claimer);
      const promises = poolInfo
        .filter(x => x.addr !== '0xc2fab88f215f62244d2e32c8a65e8f58da8415a5')
        .map(async (x: any) => {
          try {
            const stakersList = await getAllStakers(
              SUBGRAPH_URLS.staking,
              x.addr,
              0,
              [],
              stakerListAddress
            );
            stakers = stakers.concat(stakersList);
          } catch (error) {
            //console.log('error', error);
          }
        });
      await Promise.all(promises);
      // if (allMembers.length <= addressLimit) {
      //   await redisClient.set('across-strategy', 0);
      // } else {
      //   await redisClient.set('across-strategy', pageNumber + 1);
      // }
    }
    
    if (stakerListAddress.length > 0) {
      //remove duplicate
      stakerListAddress = stakerListAddress.filter(
        (c, index) => stakerListAddress.indexOf(c) === index
      );
      if (
        eoa.length === 1 &&
        (stakers.filter(
          x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
        )[0]?.cumulativeBalance === '0'||stakers.filter(
          x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
        )[0]?.cumulativeBalance ===undefined)
      ) {
        return [{ action: false, eoa, params: {} }];
      } else {
        const tierClaimerList: any[] = stakerListAddress.map(x => {
          const {
            mainTier,
            volumeTier,
            tokenTier,
            stakingTier,
          } = calculateTiers(
            stakers.filter(y => y.address === x),
            poolInfoWithUsd
          );
          if (mainTier !== 0) {
            return { mainTier, volumeTier, tokenTier, stakingTier, claimer: x };
          } else {
            return { action: false, eoa, params: {} };
          }
        });
        const results = await Promise.all(
          tierClaimerList.map(async (x: any) => {
            const actions = new ActionCallerV2(
              contractAddress,
              ActionOnTypeV2.badge,
              x.claimer,
              options.network === 'mainnet' ? 137 : 80001,
              {
                changingLevel: x.mainTier,
              }
            );
            return await actions.calculateActionParams({
              amount: x.volumeTier,
              tokenStaked: x.tokenTier,
              isDaysStaked: x.stakingTier,
            });
          })
        );
        return results
        // return eoa.length>1?results:results.filter((x:any) => x.action !== false && x.action !== 'false');
      }
    } else {
      return [{ action: false, eoa, params: {} }];
    }
  } else {
    return [{ action: false, eoa: eoa[0], params: {} }];
  }
}

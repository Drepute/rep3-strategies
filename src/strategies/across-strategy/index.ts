import ActionCallerV2 from '../../actions/v2';
import { ActionOnTypeV2 } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';

const getAllPaginatedStakers = async (
  url: string,
  tokensId: any,
  lastId: string,
  page = 0,
  allStakers: any[] = [],
  holder:string|false
) => {
  const stakers = await subgraph.subgraphRequest(url, {
    userInfos: {
      __args: {
        where: holder?{
          token: tokensId,
          id_gt: lastId,
          address:holder
        }:{
          token: tokensId,
          id_gt: lastId,
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
      all,holder
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
  holder:string|false
) => {
  if (page < 1) {
    const stakers = await subgraph.subgraphRequest(url, {
      userInfos: {
        __args: {
          where:holder?{
            token: tokensId,
            address:holder
          }:{
            token: tokensId,
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

const getAllTokenInfo = async (
  url: string,
  blockNumber: number,
  page = 0,
  allTokens: any[] = []
) => {
  const stakers = await subgraph.subgraphRequest(url, {
    stakedTokenInfos: {
      __args: {
        skip: page * 100,
      },
      id: true,
      cumulativeStaked: true,
    },
  });
  const all = allTokens.concat(stakers.stakedTokenInfos);

  if (stakers.stakedTokenInfos.length === 100) {
    page = page + 1;
    const res: any[] | undefined = await getAllTokenInfo(
      url,
      blockNumber,
      page,
      all
    );
    return res;
  } else {
    return all;
  }
};

const getPriceOfToken = async (tokenSymbol: string) => {
  try {
    const res = await fetch(
      `https://test-staging.api.drepute.xyz/dao_tool_server/strategy/token_price?token=${tokenSymbol}`
    );
    const data = await res.json();
    return data.data.price;
  } catch (error) {
    console.log(error);
  }
};

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function timeDifference(date1: number, date2: number) {
  const difference = date1 - date2;
  return (difference * 1000) / 86400000;
}

const calculateMonthsOnStaking = (
  startTime: number
) => {
  return Math.floor(timeDifference(getTimestampInSeconds(), startTime));
};
// weth
// wrapped-bitcoin
// usd-coin
// dai
const calculateAmount = (holderInfo: any[], poolInfo: any[]) => {
  
  const allUsdAmount = holderInfo.map(x => {
    
    return (
      poolInfo.filter(y => y.addr.toLowerCase() === x.token.id.toLowerCase())[0].usdAmount*
      x.cumulativeBalance
    );
  });
  // console.log("usd amounts",allUsdAmount.reduce((partialSum, a) => partialSum + a, 0))
  return allUsdAmount.reduce((partialSum, a) => partialSum + a, 0);
};

const calculateTiers = (holderInfo: any[], poolInfo: any[]) => {
  // Hold ACX Token
  let tier = 0;
  if (
    holderInfo.filter(
      x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
    ).length === 1 &&
    holderInfo.filter(
      x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
    )[0]?.cumulativeBalance !== '0'
  ) {
    tier = holderInfo.length;
    const acxInfo = holderInfo.filter(
      x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
    );
    const daysOfStaking = calculateMonthsOnStaking(acxInfo[0]?.blockTimestamp);
    if (daysOfStaking > 100) {
      tier = tier * 2;
    }
    const amount = calculateAmount(holderInfo, poolInfo);
    
    if (amount * 10e-18 < 500) {
      tier = tier * 1;
    } else if (amount * 10e-18 >= 500 && amount * 10e-18 <= 1500) {
      tier = tier * 2;
    } else if (amount * 10e-18 > 1500 && amount * 10e-18 <= 5000) {
      tier = tier * 3;
    } else if (amount * 10e-18 > 5000) {
      tier = tier * 4;
    }
    
    return {tier};
  } else {
    return tier;
  }
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
        'https://api.thegraph.com/subgraphs/name/eth-jashan/across-staking',
    },
  };
  const network: 'mainnet' | 'testnet' = options.network;
  const SUBGRAPH_URLS = SUBGRAPH_LINKS[network];
  console.log(contractAddress, eoa);

  const poolInfo = [
    {
      addr: '0x59C1427c658E97a7d568541DaC780b2E5c8affb4',
      name: 'wrapped-bitcoin',
    },
    { addr: '0x4FaBacAC8C41466117D6A38F46d08ddD4948A0cB', name: 'dai' },
    { addr: '0xC9b09405959f63F72725828b5d449488b02be1cA', name: 'usd-coin' },
    { addr: '0x28F77208728B0A45cAb24c4868334581Fe86F95B', name: 'weth' },
    {
      addr: '0xb0C8fEf534223B891D4A430e49537143829c4817',
      name: 'across-protocol',
    },
  ];

  const tokens = await getAllTokenInfo(
    'https://api.thegraph.com/subgraphs/name/eth-jashan/across-staking',
    15977129,
    0
  );

  if (tokens) {
    let stakers: any[] = [];
    const promisesTokenUSDPrice = poolInfo.map(async (x: any) => {
      try {
        const usdPrice = await getPriceOfToken(x.name);
        return { ...x, usdAmount: usdPrice };
      } catch (error) {
        console.log('error', error);
      }
    });
    const poolInfoWithUsd = await Promise.all(promisesTokenUSDPrice);
    const promises = tokens.filter(x=>x.id!=="0xc2fab88f215f62244d2e32c8a65e8f58da8415a5").map(async (x: any) => {
      try {
        const stakersList = await getAllStakers(
          SUBGRAPH_URLS.staking,
          x.id,
          0,
          [],
          eoa.length>0?eoa[0]:false
        );
        stakers = stakers.concat(stakersList);
        
      } catch (error) {
        console.log('error', error);
      }
    });
    await Promise.all(promises);
    console.log("stakersss",stakers)
    let stakerListAddress = stakers.map(x => x.address);
    if(stakerListAddress.length>0){
    stakerListAddress = stakerListAddress.filter(
      (c, index) => stakerListAddress.indexOf(c) === index
    );
    const tierClaimerList:any[] = stakerListAddress.map(x => {
      const tier = calculateTiers(
        stakers.filter(y => y.address === x),
        poolInfoWithUsd
      );
      return {tier,claimer:x}
    });
    const results = await Promise.all(
      tierClaimerList.map(async (x: any) => {
        const actions = new ActionCallerV2(
          contractAddress,
          ActionOnTypeV2.badge,
          x.claimer,
          options.network === 'mainnet' ? 137 : 80001,
          {
            changingLevel: x.tier,
          }
        );
        return await actions.calculateActionParams();
      })
    );
    return results
    }else{
      return [{action:false,eoa,params:{}}]
    }
  }else{
    return [{action:false,eoa:eoa[0],params:{}}]
  }
}

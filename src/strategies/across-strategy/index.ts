import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';

const getAllPaginatedStakers = async (
  url: string,
  page = 0,
  tokensId: any,
  lastId: string,
  allStakers: any[] = []
) => {
  const stakers = await subgraph.subgraphRequest(url, {
    userInfos: {
      __args: {
        where: {
          token: tokensId,
          id_gt: lastId,
        },
        first: 1000,
      },
      id: true,
      address: true,
      cumulativeBalance: true,
      blockTimestamp:true,
      token: { id: true },
    },
  });
  const all = allStakers.concat(stakers.userInfos);
  if (stakers.userInfos.length === 1000) {
    page = page + 1;
    const res: any[] | undefined = await getAllPaginatedStakers(
      url,
      page,
      tokensId,
      all[all.length - 1].id,
      all
    );
    return res;
  } else {
    console.log(
      'satisfied',
      all.filter(
        (currentValue, currentIndex) =>
          all.indexOf(currentValue) !== currentIndex
      )
    );
    return all;
  }
};

const getAllStakers = async (
  url: string,
  page = 0,
  tokensId: any,
  allStakers: any[] = []
) => {
  if (page < 1) {
    const stakers = await subgraph.subgraphRequest(url, {
      userInfos: {
        __args: {
          where: {
            token: tokensId,
          },
          orderBy: 'blockTimestamp',
          orderDirection: 'asc',
          skip: page * 100,
        },
        id: true,
        address: true,
        cumulativeBalance: true,
        blockTimestamp:true,
        token: { id: true }
      },
    });
    const all = allStakers.concat(stakers.userInfos);
    if (stakers.userInfos.length === 100) {
      page = page + 1;
      const res: any[] | undefined = await getAllStakers(
        url,
        page,
        tokensId,
        all
      );
      return res;
    } else {
      return all;
    }
  } else {
    return await getAllPaginatedStakers(
      url,
      page,
      tokensId,
      allStakers[allStakers.length - 1].id,
      allStakers
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
    const res: any[] | undefined = await getAllStakers(
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

const getPriceOfToken = async(tokenSymbol:string) => {
  try {
    const res = await fetch(`https://test-staging.api.drepute.xyz/dao_tool_server/strategy/token_price?token=${tokenSymbol}`);
    const data = await res.json()
    return data.data.price
  } catch (error) {
    console.log(error)
  }
}

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function  timeDifference(date1: number, date2: number) {
  const difference = date1 - date2;
  return (difference * 1000) / (86400000);
}

const calculateMonthsOnStaking = (
  // amount: any,
  startTime: number,
  // endTime: number
) => {
  // if (parseInt(amount) === 0) {
  //   // If money is not in LP
  //   return timeDifference(endTime, startTime);
  // } else {
    // If money is still staked
    // check the start is more than 3rd march
    return Math.floor(timeDifference(getTimestampInSeconds(), startTime));
  // }
};
// weth
// wrapped-bitcoin
// usd-coin
// dai
const calculateAmount = (holderInfo: any[], poolInfo:any[]) => {
  // console.log(poolInfo.filter(t=>t.addr()===holderInfo[0].token.id), holderInfo)
  const allUsdAmount = holderInfo.map(x=>{
    return poolInfo.filter(y=>y.addr.toLowerCase() === x.token.id)[0].usdAmount * x.cumulativeBalance
  })
  // console.log("usd amounts",allUsdAmount.reduce((partialSum, a) => partialSum + a, 0))
  return allUsdAmount.reduce((partialSum, a) => partialSum + a,0)
}

const calculateTiers = (holderInfo: any[], poolInfo:any[]) => {
  // Hold ACX Token
  let tier = 0;
  if (
    holderInfo.filter(
      x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
    ).length === 1 && holderInfo.filter(
      x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
    )[0]?.cumulativeBalance !== '0'
  ) {
    tier = holderInfo.length;
    const acxInfo = holderInfo.filter(x=>x.token.id==="0xb0c8fef534223b891d4a430e49537143829c4817")
    const daysOfStaking = calculateMonthsOnStaking(acxInfo[0]?.blockTimestamp);
    if(daysOfStaking>100){
      tier = tier*2
    }
    const amount = calculateAmount(holderInfo,poolInfo)
    if(amount*10e-18<500){
      tier = tier*1
    }else if (amount*10e-18>=500&&amount*10e-18<=1500){
      tier = tier*2
    }else if (amount*10e-18>1500&&amount*10e-18<=5000){
      tier = tier*3
    }else if (amount*10e-18>5000){
      tier = tier*4
    }
  console.log(amount*10e-18, tier)
    return tier;
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
  const poolInfo = [{addr:"0x59C1427c658E97a7d568541DaC780b2E5c8affb4", name:"wrapped-bitcoin"},
  {addr:"0x4FaBacAC8C41466117D6A38F46d08ddD4948A0cB", name:"dai"},
  {addr:"0xC9b09405959f63F72725828b5d449488b02be1cA", name:"usd-coin"},
  {addr:"0x28F77208728B0A45cAb24c4868334581Fe86F95B", name:"weth"},
  {addr:"0xb0C8fEf534223B891D4A430e49537143829c4817", name:"across-protocol"}]
  const tokens = await getAllTokenInfo(
    'https://api.thegraph.com/subgraphs/name/eth-jashan/across-staking',
    15977129,
    0
  );
  if (tokens) {
    let stakers: any[] = []
    const promisesTokenUSDPrice = poolInfo.map(async (x: any) => {
      try {
        const usdPrice = await getPriceOfToken(x.name)
        console.log('stakers',usdPrice)
        return {...x,usdAmount:usdPrice}
      
      } catch (error) {
        console.log('error',error)
      }
    })
    const poolInfoWithUsd = await Promise.all(promisesTokenUSDPrice)
    console.log(poolInfoWithUsd)
      const promises = tokens.map(async (x: any) => {
        try {
          const stakersList = await getAllStakers(SUBGRAPH_URLS.staking, 0, x.id, [])
          stakers = stakers.concat(stakersList)
          console.log('stakers',x.id, stakers,stakersList)
        
        } catch (error) {
          console.log('error',error)
        }
      })
    await Promise.all(promises);
    // console.log("out of the loop", stakers,stakerAsyncFunction);
    let stakerListAddress = stakers.map(x=>x.address)
    stakerListAddress = stakerListAddress.filter((c, index) => stakerListAddress.indexOf(c) === index)
    stakerListAddress.forEach((x)=>{
      calculateTiers(stakers.filter(y=>y.address === x),poolInfoWithUsd)
    })
  }
}

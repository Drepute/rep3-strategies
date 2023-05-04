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
          orderDirection: 'desc',
          skip: page * 100,
        },
        id: true,
        address: true,
        cumulativeBalance: true,
        token: { id: true },
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

const calculateTiers = (holderInfo: any[]) => {
  // Hold ACX Token
  let tier;
  if (
    holderInfo.filter(
      x => x.token.id === '0xb0c8fef534223b891d4a430e49537143829c4817'
    ).length === 1
  ) {
    tier = holderInfo.length;
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
  console.log(SUBGRAPH_URLS, contractAddress, eoa);
  const tokens = await getAllTokenInfo(
    'https://api.thegraph.com/subgraphs/name/eth-jashan/across-staking',
    15977129,
    0
  );
  if (tokens) {
    const results = await Promise.all(
      tokens.map(async (x: any) => {
        return {
          stakers: await getAllStakers(SUBGRAPH_URLS.staking, 0, x.id, []),
          address: x.id,
        };
      })
    );
    console.log(results);
  }
}

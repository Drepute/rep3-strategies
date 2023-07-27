import ActionCallerV1 from '../../../../actions/v1';
import { ActionOnType } from '../../../../actions/utils/type';
import { StrategyParamsType } from '../../../../types';
import { subgraph } from '../../../../utils';
import { network } from '../../../../network';
import { createClient } from 'redis';

let redisClient: any;
const initialize = async () => {
  redisClient = createClient({
    password: 'CW4xB0fi22GN6Enp8z6P4PUJt3cVRP30',
    socket: {
      host: 'redis-12292.c15.us-east-1-2.ec2.cloud.redislabs.com',
      port: 12292,
    },
  });

  redisClient.on('error', error => console.error(`Error here 2 : ${error}`));

  await redisClient.connect();
};

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function timeDifference(date1: number, date2: number) {
  const difference = date1 - date2;
  return (difference * 1000) / (86400000 * 30);
}

const calculateMonthsOnStaking = (
  amount: any,
  startTime: number,
  endTime: number
) => {
  if (parseInt(amount) === 0) {
    // If money is not in LP
    return timeDifference(endTime, startTime);
  } else {
    // If money is still staked
    // check the start is more than 3rd march
    return Math.floor(timeDifference(getTimestampInSeconds(), startTime));
  }
};

const calculateLevelBasedOnMonths = (
  amount: any,
  startTime: number,
  endTime: number
) => {
  const months = calculateMonthsOnStaking(amount, startTime, endTime);
  switch (months >= 0) {
    case months === 0: {
      return 1;
    }
    case months < 2: {
      return 2;
    }
    case months < 3: {
      return 3;
    }
    case months < 5: {
      return 4;
    }
    case months < 7: {
      return 5;
    }
    case months < 9: {
      return 6;
    }
    case months < 12: {
      return 7;
    }
    case months >= 12: {
      return 8;
    }
    default:
      return 1;
  }
};

const calculateLevelBasedOnProposals = (proposals: number) => {
  switch (proposals >= 0) {
    case proposals === 0: {
      return 1;
    }
    case proposals <= 2: {
      return 2;
    }
    case proposals <= 4: {
      return 3;
    }
    case proposals <= 6: {
      return 4;
    }
    case proposals <= 8: {
      return 5;
    }
    case proposals <= 10: {
      return 6;
    }
    case proposals <= 12: {
      return 7;
    }
    case proposals >= 13: {
      return 8;
    }
    default:
      return 1;
  }
};
const getAllPaginatedMembers = async (
  url: string,
  contractAddress: string,
  lastTokenId: number,
  page = 0,
  allMembers: any[] = []
) => {
  const stakers = await subgraph.subgraphRequest(url, {
    membershipNFTs: {
      __args: {
        where: {
          contractAddress,
          tokenID_gt: lastTokenId,
        },
        first: 1000,
      },
      claimer: true,
      id: true,
      tokenID: true,
    },
  });
  const all = allMembers.concat(stakers.membershipNFTs);
  if (stakers.membershipNFTs.length === 1000) {
    page = page + 1;
    const res: any[] | undefined = await getAllPaginatedMembers(
      url,
      contractAddress,
      all[all.length - 1].tokenID,
      page,
      all
    );
    return res;
  } else {
    return all;
  }
};

const getAllMembers = async (
  url: string,
  contractAddress: string,
  page = 0,
  allMembers: any[] = []
) => {
  if (page < 1) {
    const stakers = await subgraph.subgraphRequest(url, {
      membershipNFTs: {
        __args: {
          where: {
            contractAddress,
          },
          orderBy: 'tokenID',
          orderDirection: 'asc',
          skip: page * 100,
        },
        claimer: true,
        id: true,
        tokenID: true,
      },
    });
    const all = allMembers.concat(stakers.membershipNFTs);
    if (stakers.membershipNFTs.length === 100) {
      page = page + 1;
      const res: any[] | undefined = await getAllMembers(
        url,
        contractAddress,
        page,
        all
      );
      return res;
    } else {
      return all;
    }
  } else {
    return await getAllPaginatedMembers(
      url,
      contractAddress,
      allMembers[allMembers.length - 1].tokenID,
      page,
      allMembers
    );
  }
};
const getAllProposals = async (
  url: string,
  blockNumber: number,
  page = 0,
  allProposals: any[] = []
) => {
  const proposals = await subgraph.subgraphRequest(url, {
    proposals: {
      __args: {
        where: {
          blockNumber_gte: blockNumber?.toString(),
        },
        orderBy: 'blockTimestamp',
        orderDirection: 'asc',
        skip: page * 100,
      },
      id: true,
      voters: true,
      proposer: true,
      status: true,
      blockTimestamp: true,
      blockNumber: true,
    },
  });
  const all = allProposals.concat(proposals.proposals);

  if (proposals.proposals.length === 100) {
    page = page + 1;
    const res: any[] = await getAllProposals(url, blockNumber, page, all);
    return res;
  } else {
    return all;
  }
};

const getActionOnEOA = async (
  eoa: string,
  subgraphUrls: any,
  contractAddress: string,
  blockNumber: number
) => {
  const QUERY_PROPOSALS = `
      query Test($eoa:String){ 
        voters(where: {id: $eoa}) {
          proposals
        }
      }`;

  const QUERY_STAKING = `
      query Test2($eoa:String){
        users(where:{id:$eoa}){
          amount
          startTime
          endTime
        }
      }`;
  const responseStakeData: any = await subgraph.subgraphRequestWithClient(
    subgraphUrls['staking'],
    QUERY_STAKING,
    { eoa }
  );
  const responseProposalData: any = await subgraph.subgraphRequestWithClient(
    subgraphUrls['proposal'],
    QUERY_PROPOSALS,
    { eoa }
  );
  let months: number, proposals: number;
  months = 1;
  proposals = 1;

  if (
    responseStakeData?.users.length > 0 &&
    responseStakeData?.users[0].amount !== '0'
  ) {
    const monthsOfStaking = calculateLevelBasedOnMonths(
      responseStakeData.users[0].amount,
      responseStakeData.users[0].startTime >
        new Date('03/03/23').getTime() / 1000
        ? responseStakeData.users[0].startTime
        : new Date('03/03/23').getTime() / 1000,
      responseStakeData.users[0].endTime > new Date('03/03/23').getTime() / 1000
        ? responseStakeData.users[0].endTime
        : new Date('03/03/23').getTime() / 1000
    );
    months = monthsOfStaking;

    if (
      responseProposalData.voters.length > 0 &&
      responseStakeData.users.length > 0
    ) {
      const allProposals = await getAllProposals(
        subgraphUrls['proposal'],
        blockNumber
      );
      let proposalStreak = 0;
      allProposals.forEach(
        (x: {
          id: string;
          voters: [string];
          proposer: string;
          status: string;
          blockTimestamp: number;
          blockNumber: number;
        }) => {
          if (x.voters.includes(eoa.toLowerCase())) {
            proposalStreak = proposalStreak + 1;
          } else {
            if (proposalStreak !== 0) {
              proposalStreak = proposalStreak - 1;
            }
          }
        }
      );
      proposals = calculateLevelBasedOnProposals(proposalStreak);
    }

    const actions = new ActionCallerV1(
      contractAddress,
      ActionOnType.membership,
      eoa,
      1,
      {
        changingLevel: 8 * months + proposals - 8,
        isVoucher: false,
      }
    );
    return await actions.calculateActionParams();
  } else if (
    responseStakeData?.users.length > 0 &&
    responseStakeData?.users[0].amount === '0'
  ) {
    const actions = new ActionCallerV1(
      contractAddress,
      ActionOnType.membership,
      eoa,
      1,
      {
        changingLevel: 0,
        isVoucher: false,
      }
    );
    return await actions.calculateActionParams();
  } else {
    return {
      params: {},
      action: false,
      eoa,
    };
  }
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  const SUBGRAPH_LINKS = {
    mainnet: {
      proposal:
        'https://api.thegraph.com/subgraphs/name/eth-jashan/cult-governance',
      staking:
        'https://api.thegraph.com/subgraphs/name/eth-jashan/cult-staking',
    },
    testnet: {
      proposal:
        'https://api.thegraph.com/subgraphs/name/eth-jashan/test-governance',
      staking:
        'https://api.thegraph.com/subgraphs/name/eth-jashan/test-staking',
    },
  };
  const networks: 'mainnet' | 'testnet' = options.network;
  const SUBGRAPH_URLS = SUBGRAPH_LINKS[networks];

  let targetAddress: string[] = [];
  if (eoa.length > 0) {
    targetAddress = eoa;
  } else {
    if (
      options.event.event === 'ProposalExecuted' ||
      options.event.event === 'ProposalCanceled'
    ) {
      let allTargetAddress = await getAllMembers(
        network[networks === 'mainnet' ? 137 : 80001].subgraph,
        contractAddress
      );
      await initialize();
      const pageNumber = parseInt(await redisClient.get('cult-strategy'));
      const addressLimit = pageNumber !== 0 ? pageNumber * 50 : 50;
      allTargetAddress = allTargetAddress.map((x: any) =>
        x.claimer.toLowerCase()
      );
      allTargetAddress = allTargetAddress.filter((c, index) => {
        return allTargetAddress.indexOf(c) === index;
      });
      targetAddress = allTargetAddress.slice(
        pageNumber !== 0 ? addressLimit - 50 : 0,
        addressLimit
      );
      console.log(allTargetAddress.length, addressLimit, pageNumber);
      if (allTargetAddress.length <= addressLimit) {
        await redisClient.set('cult-strategy', 0);
      } else {
        await redisClient.set('cult-strategy', pageNumber + 1);
      }
    } else if (
      options.event.event === 'VoteCast' ||
      options.event.event === 'Withdraw' ||
      options.event.event === 'Deposit'
    ) {
      targetAddress = [options.event.args[0].toLowerCase()];
    }
  }
  if (targetAddress.length > 0) {
    // if (targetAddress.length > 1) {
    // const pageNumber = parseInt(await redisClient.get('premia-strategy'));
    // const addressLimit = pageNumber !== 0 ? pageNumber * 50 : 50;

    // console.log(addressLimit, pageNumber);
    // if (targetAddress.length <= addressLimit) {
    //   await redisClient.set('cult-strategy', 0);
    // } else {
    //   await redisClient.set('cult-strategy', pageNumber + 1);
    // }
    // }
    const results = await Promise.all(
      targetAddress.map(async (x: string) => {
        return await getActionOnEOA(
          x,
          SUBGRAPH_URLS,
          contractAddress,
          options.blockNumber
        );
      })
    );
    console.log(results);
    return targetAddress.length > 1
      ? results.filter((x: any) => x.action !== false && x.action !== 'false')
      : results;
  } else {
    return eoa.map((x: string) => {
      return { eao: x, action: false };
    });
  }
}

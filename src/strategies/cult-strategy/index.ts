import ActionCaller from '../../actions';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';

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

// const calculateLevelBasedOnProposalsMissed = (
//   currentLevel: number,
//   proposalMissed: number
// ) => {
//   switch (proposalMissed >= 0) {
//     case proposalMissed === 1: {
//       // const action = initializeActionClass(contractAddress, eoa, 1);
//       return currentLevel - 1;
//     }
//     case proposalMissed <= 2: {
//       //const action = initializeActionClass(contractAddress, eoa, 2);
//       return currentLevel - 2;
//     }
//     case proposalMissed <= 4: {
//       // const action = initializeActionClass(contractAddress, eoa, 3);
//       return currentLevel - 3;
//     }
//     case proposalMissed <= 6: {
//       // const action = initializeActionClass(contractAddress, eoa, 4);
//       return currentLevel - 4;
//     }
//     case proposalMissed <= 8: {
//       // const action = initializeActionClass(contractAddress, eoa, 4);
//       return currentLevel - 5;
//     }
//     case proposalMissed <= 10: {
//       // const action = initializeActionClass(contractAddress, eoa, 4);
//       return currentLevel - 6;
//     }
//     case proposalMissed <= 12: {
//       // const action = initializeActionClass(contractAddress, eoa, 4);
//       return currentLevel - 7;
//     }
//     case proposalMissed >= 13: {
//       // const action = initializeActionClass(contractAddress, eoa, 4);
//       return currentLevel - 8;
//     }
//     default:
//       return currentLevel - 1;
//   }
// };

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
          blockNumber_gte: blockNumber.toString(),
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
    const res: any[] = await getAllProposals(url, page, blockNumber, all);
    return res;
  } else {
    return all;
  }
};

const getAllVoters = async (
  url: string,
  blockNumber: number,
  page = 0,
  allVoters: any[] = []
) => {
  // const allProposals: any[] = [];
  const voters = await subgraph.subgraphRequest(url, {
    voters: {
      __args: {
        orderBy: 'id',
        orderDirection: 'asc',
        skip: page * 100,
      },
      id: true,
    },
  });
  const all = allVoters.concat(voters.voters);

  if (voters.voters.length === 100) {
    page = page + 1;
    const res: any[] = await getAllVoters(url, page, blockNumber, all);
    return res.map((x: { id: string }) => x.id);
  } else {
    return all.map((x: { id: string }) => x.id);
  }
};

const getActionOnEOA = async (
  eoa: string,
  subgraphUrls: any,
  contractAddress: string,
  blockNumber: number
) => {
  const QUERY_PROPOSALS = {
    voters: {
      __args: {
        where: {
          id: eoa,
        },
      },
      proposals: true,
    },
  };
  const QUERY_STAKING = {
    users: {
      __args: {
        where: {
          id: eoa,
        },
      },
      amount: true,
      startTime: true,
      endTime: true,
    },
  };

  const responseStakeData = await subgraph.subgraphRequest(
    subgraphUrls['staking'],
    QUERY_STAKING
  );
  const responseProposalData = await subgraph.subgraphRequest(
    subgraphUrls['proposal'],
    QUERY_PROPOSALS
  );

  let months: number, proposals: number;
  months = 1;
  proposals = 1;
  if (
    responseStakeData.users.length > 0 &&
    responseStakeData.users[0].amount !== '0'
  ) {
    const monthsOfStaking = calculateLevelBasedOnMonths(
      responseStakeData.users[0].amount,
      responseStakeData.users[0].startTime,
      responseStakeData.users[0].endTime
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
          console.log(x.voters);
          if (x.voters.includes(eoa)) {
            proposalStreak = proposalStreak + 1;
            console.log('voted points', proposalStreak);
          } else {
            if (proposalStreak !== 0) {
              proposalStreak = proposalStreak - 1;
              console.log('missed points', proposalStreak);
            } else {
              console.log('already minimum points', proposalStreak);
            }
          }
        }
      );
      proposals = calculateLevelBasedOnProposals(proposalStreak);
      console.log(
        'all proposals',
        allProposals,
        'proposal',
        proposalStreak,
        'level based on proposal',
        proposals
      );
    }
    console.log(months, proposals);
    const actions = new ActionCaller(
      contractAddress,
      ActionOnType.membership,
      eoa,
      1,
      {
        changingLevel: 8 * months + proposals - 8,
      }
    );
    return await actions.calculateActionParams();
  } else if (
    responseStakeData.users.length > 0 &&
    responseStakeData.users[0].amount === '0'
  ) {
    const actions = new ActionCaller(
      contractAddress,
      ActionOnType.membership,
      eoa,
      1,
      {
        changingLevel: 0,
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
  // const SUBGRAPH_URLS = {
  //   proposal:
  //     'https://api.thegraph.com/subgraphs/name/eth-jashan/cult-governance',
  //   staking: 'https://api.thegraph.com/subgraphs/name/eth-jashan/cult-staking',
  // };
  const SUBGRAPH_URLS = {
    proposal:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/test-governance',
    staking: 'https://api.thegraph.com/subgraphs/name/eth-jashan/test-staking',
  };

  let targetAddress: string[] = [];

  if (eoa.length > 0) {
    targetAddress = eoa;
  } else {
    if (
      options.event.event === 'ProposalExecuted' ||
      options.event.event === 'ProposalCanceled'
    ) {
      targetAddress = await getAllVoters(
        SUBGRAPH_URLS['proposal'],
        options.blockNumber,
        0
      );
      console.log('target address', targetAddress);
    } else if (options.event.event === 'VoteCast') {
      targetAddress = [options.events.args[0]];
    }
  }

  if (targetAddress.length > 0) {
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
    return results;
  } else {
    return eoa.map((x: string) => {
      return { eao: x, action: false };
    });
  }
}

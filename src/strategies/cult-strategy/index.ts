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
    return timeDifference(getTimestampInSeconds(), startTime);
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
      // const action = initializeActionClass(contractAddress, eoa, 1);
      return 1;
    }
    case proposals <= 2: {
      //const action = initializeActionClass(contractAddress, eoa, 2);
      return 2;
    }
    case proposals <= 4: {
      // const action = initializeActionClass(contractAddress, eoa, 3);
      return 3;
    }
    case proposals <= 6: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return 4;
    }
    case proposals <= 8: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return 5;
    }
    case proposals <= 10: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return 6;
    }
    case proposals <= 12: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return 7;
    }
    case proposals >= 13: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return 8;
    }
    default:
      return 1;
  }
};

const calculateLevelBasedOnProposalsMissed = (
  currentLevel: number,
  proposalMissed: number
) => {
  switch (proposalMissed >= 0) {
    case proposalMissed === 1: {
      // const action = initializeActionClass(contractAddress, eoa, 1);
      return currentLevel - 1;
    }
    case proposalMissed <= 2: {
      //const action = initializeActionClass(contractAddress, eoa, 2);
      return currentLevel - 2;
    }
    case proposalMissed <= 4: {
      // const action = initializeActionClass(contractAddress, eoa, 3);
      return currentLevel - 3;
    }
    case proposalMissed <= 6: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return currentLevel - 4;
    }
    case proposalMissed <= 8: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return currentLevel - 5;
    }
    case proposalMissed <= 10: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return currentLevel - 6;
    }
    case proposalMissed <= 12: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return currentLevel - 7;
    }
    case proposalMissed >= 13: {
      // const action = initializeActionClass(contractAddress, eoa, 4);
      return currentLevel - 8;
    }
    default:
      return currentLevel - 1;
  }
};

const getAllProposals = async (
  url: string,
  page = 0,
  allProposals: any[] = []
) => {
  // const allProposals: any[] = [];
  const proposals = await subgraph.subgraphRequest(url, {
    proposals: {
      __args: {
        orderBy: 'id',
        orderDirection: 'asc',
        skip: page * 100,
      },
      id: true,
      proposer: true,
      status: true,
      values: true,
    },
  });
  const all = allProposals.concat(proposals.proposals);

  if (proposals.proposals.length === 100) {
    page = page + 1;
    const res: any[] = await getAllProposals(url, page, all);
    return res;
  } else {
    return all;
  }
};

export async function strategy({
  contractAddress,
  eoa,
}: // options,
StrategyParamsType) {
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

  const responseProposalData = await subgraph.subgraphRequest(
    SUBGRAPH_URLS['proposal'],
    QUERY_PROPOSALS
  );
  const responseStakeData = await subgraph.subgraphRequest(
    SUBGRAPH_URLS['staking'],
    QUERY_STAKING
  );
  let months: number, proposals: number;
  months = 1;
  proposals = 1;
  if (responseStakeData.users.length > 0) {
    const monthsOfStaking = calculateLevelBasedOnMonths(
      responseStakeData.users[0].amount,
      responseStakeData.users[0].startTime,
      responseStakeData.users[0].endTime
    );
    months = monthsOfStaking;
  }
  let proposalLevel = 1;
  if (
    responseProposalData.voters.length > 0 &&
    responseStakeData.users.length > 0
  ) {
    const proposalsLevel = calculateLevelBasedOnProposals(
      responseProposalData.voters[0].proposals
    );
    proposals = proposalsLevel;
    const allProposals = await getAllProposals(SUBGRAPH_URLS['proposal']);

    if (allProposals.length - responseProposalData.voters[0].proposals <= 13) {
      proposalLevel = calculateLevelBasedOnProposalsMissed(
        proposals,
        allProposals.length - responseProposalData.voters[0].proposals
      );
    }
    console.log(
      'levels example',
      proposalLevel,
      months,
      allProposals.length,
      responseProposalData.voters[0]
    );
  }

  const actions = new ActionCaller(
    contractAddress,
    ActionOnType.membership,
    eoa,
    1,
    {
      changingLevel: proposalLevel === 0 ? 1 : proposalLevel * months,
    }
  );

  return await actions.calculateActionParams();
}

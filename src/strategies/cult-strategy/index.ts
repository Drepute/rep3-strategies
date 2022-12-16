import ActionCaller from '../../actions';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function timeDifference(date1: number, date2: number) {
  console.log(date1, date2);
  const difference = date1 - date2;

  return (difference * 1000) / (86400000 * 30);
}

const calculateMonthsOnStaking = (
  amount: any,
  startTime: number,
  endTime: number
) => {
  console.log(amount, startTime, endTime);
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

export async function strategy({
  contractAddress,
  eoa,
}: // options,
StrategyParamsType) {
  const SUBGRAPH_URLS = {
    proposal:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/cult-governance',
    staking: 'https://api.thegraph.com/subgraphs/name/eth-jashan/cult-staking',
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
  if (responseProposalData.voters.length > 0) {
    const proposalsLevel = calculateLevelBasedOnProposals(
      responseProposalData.voters[0].proposals
    );
    proposals = proposalsLevel;
  }
  const actions = new ActionCaller(
    contractAddress,
    ActionOnType.membership,
    eoa,
    1,
    {
      changingLevel: proposals * months,
    }
  );

  return await actions.calculateActionParams();
}

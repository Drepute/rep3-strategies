import ActionCaller from '../../actions';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';

const initializeActionClass = (
  contractAddress: string,
  eoa: string,
  level: number
) => {
  return new ActionCaller(contractAddress, ActionOnType.membership, eoa, 1, {
    changingLevel: level,
  });
};

// lvl-1: = 0 proposal votes
// lvl-2: = 1 proposal votes
// lvl-3: = 3 proposal votes
// lvl-4: = 5 proposal votes
// lvl-5: = 7 proposal votes
// lvl-6: = 9 proposal votes
// lvl-7: = 11 proposal votes
// lvl-8: >= 13 proposal votes

const calculateActionParams = async (
  proposals: number,
  contractAddress: string,
  eoa: string
) => {
  switch (proposals >= 0) {
    case proposals === 0: {
      const action = initializeActionClass(contractAddress, eoa, 1);
      return await action.calculateActionParams();
    }
    case proposals <= 2: {
      const action = initializeActionClass(contractAddress, eoa, 2);
      return await action.calculateActionParams();
    }
    case proposals <= 4: {
      const action = initializeActionClass(contractAddress, eoa, 3);
      return await action.calculateActionParams();
    }
    case proposals <= 6: {
      const action = initializeActionClass(contractAddress, eoa, 4);
      return await action.calculateActionParams();
    }
    case proposals <= 8: {
      const action = initializeActionClass(contractAddress, eoa, 5);
      return await action.calculateActionParams();
    }
    case proposals <= 10: {
      const action = initializeActionClass(contractAddress, eoa, 6);
      return await action.calculateActionParams();
    }
    case proposals <= 12: {
      const action = initializeActionClass(contractAddress, eoa, 7);
      return await action.calculateActionParams();
    }
    case proposals >= 13: {
      const action = initializeActionClass(contractAddress, eoa, 8);
      return await action.calculateActionParams();
    }
  }
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  const SUBGRAPH_URLS =
    'https://api.thegraph.com/subgraphs/name/eth-jashan/cult-governance';
  const QUERY = {
    voters: {
      __args: {
        where: {
          id: eoa,
        },
      },
      proposals: true,
    },
  };
  console.log(options);
  const responseData = await subgraph.subgraphRequest(SUBGRAPH_URLS, QUERY);
  return await calculateActionParams(
    responseData.voters[0].proposals,
    contractAddress,
    eoa
  );
}

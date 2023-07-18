import utils from './utils/index';
import _strategies, { multipleStrategies } from './strategies';
import {
  AdapterNames,
  AdapterWithVariables,
  CallStrategyParamsType,
} from './types';
import { ActionOnTypeV2 } from './actions/utils/type';
import ActionCallerV2 from './actions/v2';

async function callStrategy({
  strategy,
  contractAddress,
  eoa,
  options,
}: CallStrategyParamsType) {
  const res: boolean = await _strategies[strategy].strategy({
    contractAddress,
    eoa,
    options,
  });
  return res;
}
const getCurrentParams = async (
  contractAddress: string,
  eoa: string,
  network: 'mainnet' | 'testnet'
) => {
  const action = new ActionCallerV2(
    contractAddress,
    ActionOnTypeV2.currentParams,
    eoa,
    network === 'mainnet' ? 137 : 80001
  );
  return await action.calculateActionParams();
};

async function multipleCallStrategy<T extends AdapterNames>(
  contractAddress: string,
  eoa: [string],
  network: 'mainnet' | 'testnet',
  strategiesConfig: {
    strategy: string;
    options: {
      variable: AdapterWithVariables[T];
      tier: number;
    };
  }[]
) {
  const promiseResults = strategiesConfig.map(
    async (x: {
      strategy: string;
      options: { variable: AdapterWithVariables[T]; tier: number };
    }) => {
      const res: boolean = await multipleStrategies[x.strategy].genericStrategy(
        {
          contractAddress: contractAddress,
          eoa: eoa[0],
          options: x.options,
        }
      );
      return {
        executionResult: res,
        tier: x.options.tier,
        strategy: x.strategy,
      };
    }
  );
  const results = await Promise.all(promiseResults);
  const currentParams = await getCurrentParams(
    contractAddress,
    eoa[0],
    network
  );
  return [results, currentParams];
}

export const { subgraph } = utils;

export default {
  subgraph,
  callStrategy,
  multipleCallStrategy,
};

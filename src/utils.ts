import utils from './utils/index';
import _strategies, { multipleStrategies } from './strategies';
import {
  AdapterNames,
  AdapterWithVariables,
  CallStrategyParamsType,
} from './types';

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

async function multipleCallStrategy<T extends AdapterNames>(
  strategiesCofig: {
    strategy: string;
    contractAddress: string;
    eoa: [string];
    options: {
      name: T;
      variable: AdapterWithVariables[T];
      tier: number;
    };
  }[]
) {
  const promiseResults = strategiesCofig.map(
    async (x: {
      strategy: string;
      contractAddress: string;
      eoa: [string];
      options: { name: T; variable: AdapterWithVariables[T]; tier: number };
    }) => {
      const res: boolean = await multipleStrategies[x.strategy].genericStrategy(
        {
          contractAddress: x.contractAddress,
          eoa: x.eoa,
          options: x.options,
        }
      );
      return {
        executionResult: res,
        tier: x.options.tier,
        strategy: x.strategy,
      }; //{boolean,tier,strategy,currentParams}
    }
  );
  const results = await Promise.all(promiseResults);
  console.log('results.......', results);
}

export const { subgraph } = utils;

export default {
  subgraph,
  callStrategy,
  multipleCallStrategy,
};

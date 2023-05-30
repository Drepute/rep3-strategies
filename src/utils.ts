import utils from './utils/index';
import _strategies from './strategies';

import { CallStrategyParamsType } from './types';

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

async function multipleCallStrategy(
  strategiesCofig: {
    strategy: string;
    contractAddress: string;
    eoa: [string];
    options: object;
  }[]
) {
  strategiesCofig.map(
    async (x: {
      strategy: string;
      contractAddress: string;
      eoa: [string];
      options: object;
    }) => {
      const res: boolean = await _strategies[x.strategy].strategy({
        contractAddress: x.contractAddress,
        eoa: x.eoa,
        options: x.options,
      });
      return res;
    }
  );
}

export const { subgraph } = utils;

export default {
  subgraph,
  callStrategy,
  multipleCallStrategy,
};

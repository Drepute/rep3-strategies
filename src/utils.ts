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

export const { subgraph } = utils;

export default {
  subgraph,
  callStrategy,
};

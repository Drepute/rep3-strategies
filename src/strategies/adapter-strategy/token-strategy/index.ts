import {
  AdapterNames,
  AdapterWithVariables,
  StrategyParamsType,
} from '../../../types';
import { operationOnXNumberOfToken } from '../../../adapters/tokens';

const buildStrategyFromOptions = async <T extends AdapterNames>(
  eoa: string,
  adapterName: T,
  variables: AdapterWithVariables['operationOnXNumberOfToken']
): Promise<boolean> => {
  switch (adapterName) {
    case 'operationOnXNumberOfToken':
      return await operationOnXNumberOfToken(eoa, variables);
    default:
      return false;
  }
};

export async function genericStrategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  console.log(eoa, contractAddress, options);
  return await buildStrategyFromOptions(eoa[0], options.name, options.variable);
}

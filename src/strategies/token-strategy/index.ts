import {
  AdapterNames,
  AdapterWithVariables,
  StrategyParamsType,
} from '../../../types';
import {
  genericOperationOnToken,
  operationOnXNumberOfToken,
} from '../../../adapters/tokens';

const buildStrategyFromOptions = async <T extends AdapterNames>(
  eoa: string,
  adapterName: T,
  variables: AdapterWithVariables[
    | 'operationOnXNumberOfToken'
    | 'genericOperationOnNft']
): Promise<boolean> => {
  switch (adapterName) {
    case 'operationOnXNumberOfToken':
      return await operationOnXNumberOfToken(eoa, variables);

    case 'genericOperationOnNft':
      return await genericOperationOnToken(eoa, variables);
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

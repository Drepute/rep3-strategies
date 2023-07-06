import {
  AdapterNames,
  AdapterWithVariables,
  StrategyParamsType,
} from '../../../types';
import {
  genericOperationOnNft,
  operationOnXNumberOfNft,
} from '../../../adapters/nft';

const buildStrategyFromOptions = async <T extends AdapterNames>(
  eoa: string,
  adapterName: T,
  variables: AdapterWithVariables[T]
): Promise<boolean> => {
  switch (adapterName) {
    case 'operationOnXNumberOfNft':
      return await operationOnXNumberOfNft(eoa, variables);
    case 'genericOperationOnNft':
      return await genericOperationOnNft(eoa, variables);
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

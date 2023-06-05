import {
  AdapterNames,
  AdapterWithVariables,
  StrategyParamsType,
} from '../../../types';
import { operationOnXNumberOfNft } from '../../../adapters/nft';

const buildStrategyFromOptions = async <T extends AdapterNames>(
  eoa: string,
  adapterName: T,
  variables: AdapterWithVariables['operationOnXNumberOfNft']
): Promise<boolean> => {
  switch (adapterName) {
    case 'operationOnXNumberOfNft':
      return await operationOnXNumberOfNft(eoa, variables);
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

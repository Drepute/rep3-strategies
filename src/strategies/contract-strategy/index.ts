import { viewAdapter } from '../../adapters/contract';
import { AdapterWithVariables, contractAdapterStrategy } from '../../types';

const getFunctionOnType = async (
  eoa: string,
  options: AdapterWithVariables['contractAdapter']
) => {
  switch (options.type) {
    case 'view':
      try {
        return await viewAdapter(eoa, options);
      } catch (error) {
        return false;
      }
    default:
      return false;
  }
};
export async function strategy({
  contractAddress,
  eoa,
  options,
}: contractAdapterStrategy) {
  console.log('contract strategy', contractAddress);
  const executionResult = await getFunctionOnType(eoa[0], options.variable);
  return executionResult;
}

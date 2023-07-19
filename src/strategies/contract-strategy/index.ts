import { viewAdapter } from '../../adapters/contract';
import { contractAdapterStrategy } from '../../types';

export async function strategy({
  contractAddress,
  eoa,
  options,
}: contractAdapterStrategy) {
  console.log('contract adapter', contractAddress, eoa, options);
  const executionResult:boolean = await viewAdapter(eoa[0],options.variable)
  return executionResult
}

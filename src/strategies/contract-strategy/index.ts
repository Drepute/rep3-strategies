import { contractAdapterStrategy } from '../../types';

export async function strategy({
  contractAddress,
  eoa,
  options,
}: contractAdapterStrategy) {
  console.log('contract address', contractAddress, eoa, options);
  // return await buildStrategyFromOptions(eoa[0]);
}

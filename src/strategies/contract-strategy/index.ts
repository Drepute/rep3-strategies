import {
  adapterStrategy,
} from '../../types';


export async function strategy({
  contractAddress,
  eoa,
  options,
}: adapterStrategy) {
  console.log('contract address', contractAddress,eoa,options);
  // return await buildStrategyFromOptions(eoa[0]);
}

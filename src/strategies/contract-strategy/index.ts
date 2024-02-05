import { viewAdapter } from '../../adapters/contract';
import { AdapterWithVariables, contractAdapterStrategy } from '../../types';

const getFunctionOnType = async (
  eoa: string,
  onlyValue: boolean,
  options: AdapterWithVariables['contractAdapter']
) => {
  switch (options.type) {
    case 'view':
      try {
        console.log(eoa, onlyValue, options);
        return await viewAdapter(eoa, onlyValue, options);
      } catch (error) {
        return false;
      }
    case 'erc1155':
      try {
        console.log(eoa, onlyValue, options);
        return await viewAdapter(eoa, onlyValue, options);
      } catch (error) {
        return false;
      }
    case 'erc20':
      try {
        console.log(eoa, onlyValue, options);
        return await viewAdapter(eoa, onlyValue, options);
      } catch (error) {
        return false;
      }
    case 'erc721':
      try {
        console.log(eoa, onlyValue, options);
        return await viewAdapter(eoa, onlyValue, options);
      } catch (error) {
        return false;
      }
    default:
      return false;
  }
};
export async function strategy(
  onlyValue: boolean,
  { contractAddress, eoa, options }: contractAdapterStrategy
) {
  console.log('contract address', contractAddress);
  const executionResult = await getFunctionOnType(
    eoa[0],
    onlyValue,
    options.variable
  );
  return executionResult;
}

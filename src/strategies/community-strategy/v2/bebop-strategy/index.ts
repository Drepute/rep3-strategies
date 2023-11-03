import { StrategyParamsType } from '../../../../types';
import { viewAdapter } from '../../../../adapters/contract';

export async function strategy({ eoa, options }: StrategyParamsType) {
  const maticExecutionResult = await viewAdapter(eoa[0], {
    contractAddress: options.maticAddress,
    type: 'view',
    contractType: 'erc1155',
    balanceThreshold: 0,
    chainId: 137,
    operator: '>',
    functionName: 'balanceOf',
    functionParam: [options.maticTokenId],
  });
  const ethExecutionResult = await viewAdapter(eoa[0], {
    contractAddress: options.ethAddress,
    type: 'view',
    contractType: 'erc1155',
    balanceThreshold: 0,
    chainId: 1,
    operator: '>',
    functionName: 'balanceOf',
    functionParam: [options.ethTokenId],
  });
  return ethExecutionResult || maticExecutionResult;
}

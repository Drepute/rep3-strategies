import { StrategyParamsType } from '../../../../types';
import { arithmeticOperand, viewAdapter } from '../../../../adapters/contract';

const getSwapperTransactionCount = async (
  walletAddr: string,
  startTime: string
) => {
  const endTIme = Math.floor(new Date().getTime() / 1000) * 1e9;
  const res = await fetch(
    `https://api.bebop.xyz/history/trades?wallet_address=${walletAddr}&start=${startTime}&end=${endTIme}&size=${100}`
  );
  const data = await res.json();
  return data.metadata.results;
};
const actionOnQuestType = async (
  type: string,
  eoa: string,
  startTime: string
) => {
  switch (type) {
    case 'swapper': {
      try {
        const txCount = await getSwapperTransactionCount(eoa, startTime);
        return txCount;
      } catch (error) {
        return 0;
      }
    }
    default:
      return 0;
  }
};
export async function strategy({ eoa, options }: StrategyParamsType) {
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
  let maticExecutionResult = false;
  if (ethExecutionResult) {
    maticExecutionResult = await viewAdapter(eoa[0], {
      contractAddress: options.maticAddress,
      type: 'view',
      contractType: 'erc1155',
      balanceThreshold: 0,
      chainId: 137,
      operator: '>',
      functionName: 'balanceOf',
      functionParam: [options.maticTokenId],
    });
  }

  if (ethExecutionResult || maticExecutionResult) {
    return ethExecutionResult || maticExecutionResult;
  } else {
    const thresholdCount = await actionOnQuestType(
      options.questType,
      eoa[0],
      options.startTime
    );
    return arithmeticOperand(
      thresholdCount,
      options.threshold,
      options.operator
    );
  }
}

import { arithmeticOperand } from '../../adapters/contract';
import { getTwitterMetrics } from '../../adapters/twitter';
import { AdapterWithVariables, twitterStrategy } from '../../types';

const getFunctionOnType = async (
  type: 'like' | 'mention' | 'retweet' | 'replies',
  options: AdapterWithVariables['twitterAdapter']
) => {
  if (
    type === 'like' ||
    type === 'mention' ||
    type === 'retweet' ||
    type === 'replies'
  ) {
    try {
      const count = await getTwitterMetrics(
        options.serviceConfig,
        options.type,
        options.accountId ?? '',
        options.dateInfo,
        options.followingAccountId
      );
      console.log(
        'here..........',
        count,
        options.countThreshold,
        options.operator
      );
      return arithmeticOperand(count, options.countThreshold, options.operator);
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: twitterStrategy) {
  console.log(contractAddress, eoa);
  const executionResult = await getFunctionOnType(
    options.variable.type,
    options.variable
  );
  return executionResult;
}

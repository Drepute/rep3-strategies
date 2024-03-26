import { arithmeticOperand } from '../../adapters/contract';
import { getTwitterMetrics } from '../../adapters/twitter';
import { AdapterWithVariables, twitterStrategy } from '../../types';

const getFunctionOnType = async (
  onlyValue: boolean,
  type: 'likeCount' | 'mentionCount' | 'retweetCount' | 'repliesCount',
  options: AdapterWithVariables['twitterAdapter']
) => {
  if (
    type === 'likeCount' ||
    type === 'mentionCount' ||
    type === 'retweetCount' ||
    type === 'repliesCount' ||
    type === 'impressionCount'
  ) {
    try {
      const count = await getTwitterMetrics(
        options.serviceConfig,
        options.type,
        options.accountId ?? '',
        options.dateInfo,
        options.followingAccountId
      );
      if (onlyValue) {
        return count;
      } else {
        return arithmeticOperand(
          count,
          options.countThreshold,
          options.operator
        );
      }
    } catch (error) {
      return false;
    }
  } else {
    return false;
  }
};

export async function strategy(
  onlyValue: boolean,
  { contractAddress, eoa, options }: twitterStrategy
) {
  console.log(contractAddress, eoa);
  const executionResult = await getFunctionOnType(
    onlyValue,
    options.variable.type,
    options.variable
  );
  return executionResult;
}

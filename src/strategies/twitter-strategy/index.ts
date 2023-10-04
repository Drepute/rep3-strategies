import { isGuildMemberOrNot } from '../../adapters/discord';
import { getTwitterMetrics } from '../../adapters/twitter';
import { AdapterWithVariables, twitterStrategy } from '../../types';

const getFunctionOnType = async (
  type: 'like' | 'mention' | 'retweet' | 'replies',
  options: AdapterWithVariables['twitterAdapter']
) => {
  switch (type) {
    case 'like':
      try {
        const response = getTwitterMetrics(
          options.serviceConfig,
          options.type,
          options.accountId,
          options.followingAccountId
        );
      } catch (error) {
        return false;
      }
      break;
    case 'mention':
      try {
        const response = getTwitterMetrics(
          options.serviceConfig,
          options.type,
          options.accountId,
          options.followingAccountId
        );
      } catch (error) {
        return false;
      }
      break;
    case 'retweet':
      try {
        const response = getTwitterMetrics(
          options.serviceConfig,
          options.type,
          options.accountId,
          options.followingAccountId
        );
      } catch (error) {
        return false;
      }
      break;
    case 'replies':
      try {
        const response = getTwitterMetrics(
          options.serviceConfig,
          options.type,
          options.accountId,
          options.followingAccountId
        );
      } catch (error) {
        return false;
      }
      break;
    default:
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

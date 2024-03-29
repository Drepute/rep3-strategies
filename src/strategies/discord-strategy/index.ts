import { isGuildMemberOrNot } from '../../adapters/discord';
import { AdapterWithVariables, discordAdapterStrategy } from '../../types';

const getFunctionOnType = async (
  type: 'isMember' | 'haveRole',
  options: AdapterWithVariables['discordAdapter']
) => {
  switch (type) {
    case 'isMember':
      try {
        if (options.guildId) {
          return await isGuildMemberOrNot(
            options.serviceConfig,
            options.discordUserTokens,
            options.guildId,
            options.roleId
          );
        }
      } catch (error) {
        return false;
      }
      break;
    case 'haveRole':
      try {
        if (options.guildId) {
          return await isGuildMemberOrNot(
            options.serviceConfig,
            options.discordUserTokens,
            options.guildId,
            options.roleId
          );
        }
      } catch (error) {
        return false;
      }
      break;
    default:
      return false;
  }
};

export async function strategy(
  onlyValue: boolean,
  { contractAddress, eoa, options }: discordAdapterStrategy
) {
  console.log(onlyValue, contractAddress, eoa);
  const executionResult = await getFunctionOnType(
    options.variable.type,
    options.variable
  );
  return executionResult;
}

import { isGuildMemberOrNot } from '../../adapters/discord';
import { AdapterWithVariables, discordAdapterStrategy } from '../../types';

const getFunctionOnType = async (
  type: 'isMember',
  options: AdapterWithVariables['discordAdapter']
) => {
    console.log("type here ==>", type)
  switch (type) {
    case 'isMember':
      try {
        if (options.guildId) {
          return await isGuildMemberOrNot(
            options.serviceConfig,
            options.discordUserTokens,
            options.guildId,
            options.roleId && options.roleId
          );
        }
      } catch (error) {
        return false;
      }
      break
    default:
        return false
  }
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: discordAdapterStrategy) {
  console.log("Here ====>", contractAddress, eoa, options);
  const executionResult = await getFunctionOnType(options.variable.type, options.variable);
  console.log("execution",executionResult)
  return executionResult;
}

import { isGuildMemberOrNot } from '../../adapters/discord';
import { AdapterWithVariables, discordAdapterStrategy } from '../../types';

const getFunctionOnType = async (
  type: 'isMember',
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
            options.roleId && options.roleId
          );
        }
      } catch (error) {
        return false;
      }
  }
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: discordAdapterStrategy) {
  console.log('contract address', contractAddress, eoa, options);
  const executionResult = await getFunctionOnType(options.type, options);
  return executionResult;
}

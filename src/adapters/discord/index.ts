import fetch from 'cross-fetch';
export const isGuildMemberOrNot = async (
  serviceConfig: { url: string; authToken: string },
  discordUserTokens: {
    refreshToken: string;
    accessToken: string;
  },
  guildId: string,
  roleId?: string
) => {
  const url = roleId
    ? `${serviceConfig.url}/discord_bot/adapter/checkRole?accessToken=${discordUserTokens.accessToken}&refreshToken=${discordUserTokens.refreshToken}&guild_id=${guildId}&role_id=${roleId}`
    : `${serviceConfig.url}/discord_bot/adapter/checkRole?accessToken=${discordUserTokens.accessToken}&refreshToken=${discordUserTokens.refreshToken}&guild_id=${guildId}`;
  try {
    const response = await fetch(url, {
      headers: {
        'X-Authentication': serviceConfig.authToken,
      },
    });
    const res = await response.json();
    console.log('response', res?.data);
    if (roleId) {
      return res.data.role;
    } else {
      return res.data.member;
    }
  } catch (error) {
    return false;
  }
};

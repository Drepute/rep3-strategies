import fetch from 'cross-fetch';
export const isGuildMemberOrNot = async (
  serviceConfig: { url: string; authToken: string },
  discordUserTokens: {
    refreshToken: string;
    accessToken: string;
    uuid: string;
  },
  guildId: string,
  roleId?: string
) => {
  const url = roleId
    ? `${serviceConfig.url}/discord_bot/adapter/checkRole?accessToken=${discordUserTokens.accessToken}&refreshToken=${discordUserTokens.refreshToken}&guild_id=${guildId}&role_id=${roleId}&uuid=${discordUserTokens.uuid}`
    : `${serviceConfig.url}/discord_bot/adapter/isGuildMember?accessToken=${discordUserTokens.accessToken}&refreshToken=${discordUserTokens.refreshToken}&guild_id=${guildId}&uuid=${discordUserTokens.uuid}`;
  console.log('role......', url, roleId, guildId);
  try {
    const response = await fetch(url, {
      headers: {
        'X-Authentication': serviceConfig.authToken,
      },
    });
    const res = await response.json();
    console.log('res......', res, url, roleId, guildId);
    if (roleId) {
      return res.role;
    } else {
      return res.member;
    }
  } catch (error) {
    return false;
  }
};

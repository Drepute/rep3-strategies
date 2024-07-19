import fetch from 'cross-fetch';
import { delay } from '../../utils';
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
  let response;
  let res;
  try {
    response = await fetch(url, {
      headers: {
        'X-Authentication': serviceConfig.authToken,
      },
    });
    res = await response.json();
    if (res?.message && res?.message?.includes('rate limited')) {
      await delay(1000);
      response = await fetch(url, {
        headers: {
          'X-Authentication': serviceConfig.authToken,
        },
      });
      res = await response.json();
    }
    if (roleId) {
      return res.role;
    } else {
      return res.member;
    }
  } catch (error) {
    console.error('err', error);
    return false;
  }
};

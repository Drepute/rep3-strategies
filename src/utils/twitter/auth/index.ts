import { OAuth2User } from 'twitter-api-sdk/dist/OAuth2User';

const getOauthURL = (authClient: OAuth2User, state: string) => {
  const authUrl = authClient.generateAuthURL({
    state,
    code_challenge_method: 's256',
  });
  return authUrl;
};

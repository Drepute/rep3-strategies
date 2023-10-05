import fetch from 'cross-fetch';
const getFetchRouteWithType = (
  type: 'like' | 'mention' | 'retweet' | 'replies'
) => {
  switch (type) {
    case 'like':
      return 'twitter_service/account/likes';
    case 'mention':
      return 'twitter_service/account/mentions';
    case 'retweet':
      return 'twitter_service/account/retweets';
    case 'replies':
      return 'twitter_service/account/replies';
    default:
      return false;
  }
};
export const getTwitterMetrics = async (
  serviceConfig: {
    url: string;
    authToken: string;
  },
  type: 'like' | 'mention' | 'retweet' | 'replies',
  accountId: string,
  dateInfo: { from: number; to: number },
  followingAccountId?: string
) => {
  const url = `${serviceConfig.url}/${getFetchRouteWithType(
    type
  )}/${accountId}/${followingAccountId}?from_timestamp=${
    dateInfo?.from
  }&to_timestamp=${dateInfo?.to}`;
  try {
    const response = await fetch(url);
    const res = await response.json();
    console.log('metrics response', res.data?.likes_count);

    return res.data?.likes_count;
    // } else {
    //   return res.member;
    // }
  } catch (error) {
    return false;
  }
};

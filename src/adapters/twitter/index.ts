import fetch from 'cross-fetch';
const getFetchRouteWithType = (
  type: 'likeCount' | 'mentionCount' | 'retweetCount' | 'repliesCount'
) => {
  switch (type) {
    case 'likeCount':
      return 'twitter_service/account/likes';
    case 'mentionCount':
      return 'twitter_service/account/mentions';
    case 'retweetCount':
      return 'twitter_service/account/retweets';
    case 'repliesCount':
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
  type: 'likeCount' | 'mentionCount' | 'retweetCount' | 'repliesCount',
  accountId: string,
  dateInfo: { from: number; to?: number },
  followingAccountId?: string
) => {
  const url = `${serviceConfig.url}/${getFetchRouteWithType(
    type
  )}/${accountId}/${followingAccountId}?from_timestamp=${dateInfo?.from}${
    dateInfo?.to ? `&to_timestamp=${dateInfo?.to}` : ''
  }`;

  console.log('url....', url);
  try {
    const response = await fetch(url);
    const res = await response.json();
    //change to generic function
    if (type === 'likeCount') {
      return res.data?.likes_count;
    } else {
      return res.data?.mentions_count;
    }
  } catch (error) {
    return false;
  }
};

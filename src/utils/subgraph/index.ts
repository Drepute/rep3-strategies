import fetch from 'cross-fetch';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

export async function subgraphRequest(
  url: string,
  query: {},
  options: any = {}
) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: JSON.stringify({ query: jsonToGraphQLQuery({ query }) }),
  });
  const responseData = await res.json();
  if (responseData.errors) {
    throw new Error(
      'Errors found in subgraphRequest: ' +
        url +
        JSON.stringify(responseData.errors)
    );
  }
  const { data } = responseData;
  return data || {};
}

export default {
  subgraphRequest,
};

import fetch from 'cross-fetch';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { Client, fetchExchange } from '@urql/core';

export async function subgraphRequest(
  url: string,
  query: object
  // options: object | any = {}
) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Node',
      },
      body: JSON.stringify({
        query: jsonToGraphQLQuery({ query }, { pretty: true }),
      }),
    });
    const responseData: any = await res.json();
    const { data } = responseData;
    return data || {};
  } catch (error) {
    throw new Error(
      'Errors found in subgraphRequest: ' + url + JSON.stringify(error)
    );
  }
}

export async function subgraphRequestWithClient(
  url: string,
  query: string,
  variables: object
) {
  try {
    const client = new Client({
      url,
      fetch: fetch,
      exchanges: [fetchExchange],
      requestPolicy: 'network-only',
    });
    const data = await client.query(query, variables).toPromise();
    if (data.data) {
      return data.data;
    } else {
      console.log('errror', data);
      return subgraphRequestWithClient(url, query, variables);
    }
  } catch (error) {
    console.log('Error fetching data: ', error);
    throw error;
  }
}
export async function getSubgraphFetchCall(
  url: string,
  query: string,
  variables: any
) {
  console.log(url, query, variables);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
      // variables: { address: eoa },
    }),
  });
  const response = await res.json();
  console.log(response);
  return response?.data;
  // let allDelegateTxCount = response?.data?.info?.map(x => x?.total_tx);
  // allDelegateTxCount = allDelegateTxCount?.reduce(
  //   (partialSum, a) => partialSum + a,
  //   0
  // );
  // return allDelegateTxCount;
}

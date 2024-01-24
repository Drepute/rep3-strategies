import { subgraphRequest } from './index';

const URL = 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic';

const QUERY = {
  membershipNFTs: {
    __args: {
      where: {
        contractAddress: '0xb24836d0f1441d69f4ddf0fa48de907a5751c892',
        claimer: '0x565CBd65Cb3e65445AfD14169003A528C985e9C7',
      },
      orderBy: 'time',
      orderDirection: 'desc',
    },
    claimer: true,
    level: true,
  },
};

(async () => {
  console.time('subgraphRequest');
  try {
    const responseData = await subgraphRequest(URL, QUERY);
    console.info(responseData['membershipNFTs'][0]);
    console.timeEnd('subgraphRequest');
  } catch (error) {
    console.error(error);
  }
})();

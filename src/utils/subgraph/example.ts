import { subgraphRequest } from './index';

const URL = 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic';
// const QUERY = {
//   dao: {
//     __args: {
//       id: '0x9e00c9a53e71073cee827d54db9e32005d1b95ac',
//     },
//     membershipNFT: {
//       claimer: true,
//     },
//   },
// };

const QUERY = {
  membershipNFTs: {
    __args: {
      where: {
        contractAddress: '0x9e00c9a53e71073cee827d54db9e32005d1b95ac',
        claimer: '0x280a53cbf252f1b5f6bde7471299c94ec566a7c8',
      },
    },
    claimer: true,
  },
};

(async () => {
  console.time('subgraphRequest');
  try {
    const responseData = await subgraphRequest(URL, QUERY);
    console.info(responseData);
    console.timeEnd('subgraphRequest');
  } catch (error) {
    console.error(error);
  }
})();

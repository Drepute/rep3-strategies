import { subgraphRequest } from './index';

const URL = 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic';
const QUERY = {
  membershipNFTs: {
    __args: {
      where: {
        claimer: '0x81c9039F206B690918fCd5dDAd41e4D1039DD535',
      },
    },
    id: true,
    tokenID: true,
    contractAddress: true,
    time: true,
    claimer: true,
    metadataUri: true,
    level: true,
    category: true,
  },
};

const runExample = async () => {
  try {
    const responseData = await subgraphRequest(URL, QUERY);
    console.info(responseData);
  } catch (error) {
    console.error(error);
  }
};

runExample();

import { getAllStakers } from '.';

(async () => {
  try {
    await getAllStakers(
      'https://api.thegraph.com/subgraphs/name/eth-jashan/across-staking',
      15977129,
      0
    );
  } catch (error) {
    //console.log(error);
  }
})();

import { StrategyParamsType } from '../../../../types';
import fetch from 'cross-fetch';

const getSmashAndRockTypeCounts = async (options: any) => {
  const res = await fetch(
    `https://api.peonnft.com/user/${options?.discordUserTokens?.username}`
  );
  const data = await res.json();
  console.log('api', options, data);
  const value = options?.strategyOptions?.keysToTrack.map(keyTracker => {
    if (keyTracker.name === 'smash_count') {
      return data?.smash_count >= keyTracker.value;
    } else {
      const currentKeyValue = data?.gems?.filter(
        x => x.name === keyTracker.name
      );
      console.log(currentKeyValue, keyTracker);
      return currentKeyValue?.length > 0
        ? currentKeyValue[0]?.count >= keyTracker.value
        : false;
    }
  });
  console.log('value....', value);
  return value;
};

export async function strategy({ eoa, options }: StrategyParamsType) {
  console.log(eoa);
  const res = await getSmashAndRockTypeCounts(options);
  return !res?.includes(false) ? 1 : 0;
}

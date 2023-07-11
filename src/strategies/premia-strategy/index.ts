/* eslint-disable @typescript-eslint/no-unused-vars */
import ActionCallerV1 from '../../actions/v1';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';
// import { network } from '../../utils/contract/network';
import fetch from 'cross-fetch';
import { createClient } from 'redis';

const listOfCourses = {
  '0': ['1.5-exam', '2.5-exam', '3.5-exam', '4.5-exam', '5.5-exam'],
  '1': ['tc-exam'],
  '2': ['1.5-strat-exam', '2.5-strat-exam', '3.5-strat-exam'],
};
let redisClient:any;
const initialize = async () => {
  redisClient = createClient({
    password: 'CW4xB0fi22GN6Enp8z6P4PUJt3cVRP30',
    socket: {
      host: 'redis-12292.c15.us-east-1-2.ec2.cloud.redislabs.com',
      port: 12292,
    },
  });

  redisClient.on('error', error => console.error(`Error here 2 : ${error}`));

  await redisClient.connect();
};
const getAllPaginatedMembers = async (
  url: string,
  contractAddress: string,
  lastTokenId: number,
  page = 0,
  allMembers: any[] = []
) => {
  const stakers = await subgraph.subgraphRequest(url, {
    membershipNFTs: {
      __args: {
        where: {
          contractAddress,
          tokenID_gt: lastTokenId,
        },
        first: 1000,
      },
      claimer: true,
      id: true,
      tokenID: true,
    },
  });
  const all = allMembers.concat(stakers.membershipNFTs);
  if (stakers.membershipNFTs.length === 1000) {
    page = page + 1;
    const res: any[] | undefined = await getAllPaginatedMembers(
      url,
      contractAddress,
      all[all.length - 1].tokenID,
      page,
      all
    );
    return res;
  } else {
    return all;
  }
};

const getAllMembers = async (
  url: string,
  contractAddress: string,
  page = 0,
  allMembers: any[] = []
) => {
  if (page < 1) {
    const claimer = await subgraph.subgraphRequest(url, {
      membershipNFTs: {
        __args: {
          where: {
            contractAddress,
          },
          orderBy: 'tokenID',
          orderDirection: 'asc',
          skip: page * 100,
        },
        claimer: true,
        id: true,
        tokenID: true,
      },
    });
    const all = allMembers.concat(claimer.membershipNFTs);
    if (claimer.membershipNFTs.length === 100) {
      page = page + 1;
      const res: any[] | undefined = await getAllMembers(
        url,
        contractAddress,
        page,
        all
      );
      return res;
    } else {
      return all;
    }
  } else {
    return await getAllPaginatedMembers(
      url,
      contractAddress,
      allMembers[allMembers.length - 1].tokenID,
      page,
      allMembers
    );
  }
};

const getLevelCategory = (courses: any[], category: string) => {
  let newArray = [courses, listOfCourses[category]];
  newArray = newArray.reduce((x, y) => x.filter(z => y.includes(z)));
  if (newArray.length > 0) {
    if (category === '0') {
      console.log('categories 0', newArray);
      newArray = newArray.map((x: any) => parseInt(x[0]) + 1);
      return { level: Math.max(...newArray), category: 0 };
    } else if (category === '1') {
      return { level: 1, category: 1 };
    } else if (category === '2') {
      newArray = newArray.map((x: any) => parseInt(x[0]));
      return { level: Math.max(...newArray), category: 2 };
    } else {
      return { level: false, category: false };
    }
  } else if (newArray.length === 0 && category === '0') {
    return { level: 1, category: 0 };
  } else {
    return { level: false, category: false };
  }
};

export const getCourseFinished = async (
  user: string,
  apiKey: string
): Promise<{ level: number | boolean; category: number | boolean }[]> => {
  try {
    const response = await fetch(
      `https://academy.premia.blue/api/user?api_key=${apiKey}&account=${user}`
    );
    const courses = await response.json();
    const categories = Object.keys(listOfCourses);
    const levelCategory = categories.map(x => {
      return getLevelCategory(courses.courses, x);
    });
    return levelCategory;
  } catch (error) {
    return [{ level: false, category: false }];
  }
};

const getActionOnEOA = async (
  eoa: string,
  contractAddress: string,
  network: string,
  apiKey: string
) => {
  let levelCategory = await getCourseFinished(eoa, apiKey);
  levelCategory = levelCategory.filter(
    x => x.level !== false && x.category !== false
  );
  const actions = new ActionCallerV1(
    contractAddress,
    ActionOnType.category,
    eoa,
    network === 'mainnet' ? 137 : 80001,
    {
      changingLevelCategory: levelCategory,
    }
  );
  return await actions.calculateActionParams();
};
const getAllPremiaUser = async () => {
  try {
    const response = await fetch(
      `https://academy.premia.blue/api/user?api_key=2d6WNtGrX8X60BSSn3Lkb2icTF`
    );
    const courses = await response.json();
    return courses.accounts;
  } catch (error) {
    return [];
  }
};
export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  let pageNumber = 0;
  let addressLimit = 50;
  let targetAddress;
  if (eoa.length > 0) {
    targetAddress = eoa;
  } else {
    await initialize()
    pageNumber = parseInt(await redisClient.get('premia-strategy'));
    addressLimit = pageNumber !== 0 ? pageNumber * 50 : 50;
    targetAddress = await getAllPremiaUser();
  }
  
  const results: any = [];
  console.log("addresses",pageNumber,addressLimit,targetAddress.length,targetAddress.slice(pageNumber !== 0 ? addressLimit - 50 : 0, addressLimit).length,targetAddress.slice(pageNumber !== 0 ? addressLimit - 50 : 0, addressLimit))
  await Promise.all(
    targetAddress.slice(pageNumber !== 0 ? addressLimit - 50 : 0, addressLimit).map(async (x: string) => {
        const res: any = await getActionOnEOA(
          x,
          contractAddress,
          options.network,
          options.apiKey
        );
        res.forEach((x: any) => results.push(x));
      })
  );
  const nonNullResult = results.filter(x => x !== null && x !== undefined);
  if (targetAddress.length <= addressLimit) {
    await redisClient.set('premia-strategy', 0);
  } else {
    await redisClient.set('premia-strategy', pageNumber + 1);
  }
  return nonNullResult.filter(x => x.action !== false && x.action !== 'false');
}

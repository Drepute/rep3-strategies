/* eslint-disable @typescript-eslint/no-unused-vars */
import ActionCallerV1 from '../../actions/v1';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';
import { network } from '../../utils/contract/network';
import fetch from 'cross-fetch';

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

export const getCourseFinished = async (
  user: string,
  apiKey: string
): Promise<{ tier: any[]; category: boolean | number }> => {
  const response = await fetch(
    `https://academy.premia.blue/api/user?api_key=${apiKey}&account=${user}`
  );
  const courses = await response.json();
  if (courses.courses.length > 0) {
    const res = courses.courses
      .filter((x: string) => x !== 'tc-exam')
      .map((x: string) => parseInt(x[0]));
    return {
      tier: res,
      category:
        courses.courses.filter((x: string) => x === 'tc-exam').length > 0
          ? 1
          : false,
    };
  } else {
    return {tier:courses.courses,category:false};
  }
};

const getActionOnEOA = async (
  eoa: string,
  contractAddress: string,network:string,
  apiKey: string
) => {
  const coursesCount = await getCourseFinished(eoa, apiKey);
  const tier =
    coursesCount.tier.length > 0 ? Math.max(...coursesCount.tier) : 0;
  const actions = new ActionCallerV1(
    contractAddress,
    ActionOnType.membership,
    eoa,
    network === 'mainnet' ? 137 : 80001,
    {
      changingLevel: tier + 1,
      isVoucher: true,
    }
  );
  return await actions.calculateActionParams(coursesCount.category);
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  console.log(eoa);
  let targetAddress = await getAllMembers(
    network[options.network === 'mainnet' ? 137 : 80001].subgraph,
    contractAddress
  );
  targetAddress = targetAddress.map(x => x.claimer);
  targetAddress = targetAddress.filter((c, index) => {
    return targetAddress.indexOf(c) === index;
  });
  const results:any[] = []
  await Promise.all(
    targetAddress.slice(0,100).map(async (x: string) => {
      const res:any =  await getActionOnEOA(x, contractAddress,options.network, options.apiKey);
      results.push(res.category)
      results.push(res.returnObj)
    })
  );
  const nonNullResult =  results.filter(x=>x!==null&&x!==undefined);
  return nonNullResult.filter(x=>x.action !==false)
}

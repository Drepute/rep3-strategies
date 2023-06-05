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
  console.log({
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
    },
  });
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
    const stakers = await subgraph.subgraphRequest(url, {
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
    const all = allMembers.concat(stakers.membershipNFTs);
    if (stakers.membershipNFTs.length === 100) {
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
    console.log(allMembers[allMembers.length - 1].tokenID);
    return await getAllPaginatedMembers(
      url,
      contractAddress,
      allMembers[allMembers.length - 1].tokenID,
      page,
      allMembers
    );
  }
};

const getCourseFinished = async (
  user: string,
  apiKey: string
): Promise<any[]> => {
  const response = await fetch(
    `https://academy.premia.blue/api/user?api_key=${apiKey}&account=${user}`
  );
  const courses = await response.json();
  console.log('number of courses', courses);
  return courses.courses;
};

const getActionOnEOA = async (
  eoa: string,
  contractAddress: string,
  apiKey: string
) => {
  const coursesCount = await getCourseFinished(eoa, apiKey);
  const tier = coursesCount.length > 0 ? 2 : 1;
  console.log(apiKey);
  const actions = new ActionCallerV1(
    contractAddress,
    ActionOnType.membership,
    eoa,
    137,
    {
      changingLevel: tier,
      isVoucher: true,
    }
  );
  return await actions.calculateActionParams();
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

  console.log('all target', targetAddress);

  const results = await Promise.all(
    targetAddress.map(async (x: string) => {
      return await getActionOnEOA(x, contractAddress, options.apiKey);
    })
  );
  return results;
}

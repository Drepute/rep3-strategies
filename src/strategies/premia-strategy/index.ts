import ActionCallerV1 from '../../actions/actionV1';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';
import { network } from '../../utils/contract/network';

const getAllPaginatedStakers = async (
  url: string,
  contractAddress:string,
  lastId: string,
  page = 0,
  allMembers: any[] = []
) => {
  const stakers = await subgraph.subgraphRequest(url, {
    membershipNFTs: {
      __args: {
        where: {
          contractAddress,
          id_gt: lastId,
        },
        first: 1000,
      },
      claimer:true,
      id:true
    },
  });
  const all = allMembers.concat(stakers.membershipNFTs);
  if (stakers.membershipNFTs.length === 1000) {
    page = page + 1;
    const res: any[] | undefined = await getAllPaginatedStakers(
      url,
      lastId,
      all[all.length - 1].id,
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
  contractAddress:string,
  page = 0,
  allMembers: any[] = [],
) => {
  if (page < 1) {
    const stakers = await subgraph.subgraphRequest(url, {
      membershipNFTs: {
        __args: {
          where:{
            contractAddress
          },
          orderBy: 'time',
          orderDirection: 'asc',
          skip: page * 100,
        },
        claimer:true,
        id:true
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
    return await getAllPaginatedStakers(
      url,
      contractAddress,
      allMembers[allMembers.length - 1].id,
      page,
      allMembers,
    );
  }
};

// const getCourseFinished = async(user:string,apiKey:string):Promise<any[]> => {
//   const response = await fetch(`https://academy.premia.blue/api/user?api_key=${apiKey}&account=${user}`)
//   const courses = await response.json()
//   console.log("number of courses", courses)
//   return courses.courses
// }

const getActionOnEOA = async (eoa: string, contractAddress: string,apiKey:string) => {
  // const coursesCount = await getCourseFinished(eoa,apiKey)
  // const tier = coursesCount.length>0?2:1
  console.log(apiKey)
  const actions = new ActionCallerV1(
    contractAddress,
    ActionOnType.membership,
    eoa,
    137,
    {
      changingLevel:2,
      isVoucher:true
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

  let targetAddress = await getAllMembers(network[options.network==="mainnet"?137:80001].subgraph,contractAddress)
  targetAddress = targetAddress.map((x)=>x.claimer)
  
  targetAddress = targetAddress.filter((c, index) => {
    return targetAddress.indexOf(c) === index;
  });
  
  console.log("all target",targetAddress)
  
  const results = await Promise.all(
    targetAddress.map(async (x: string) => {
      return await getActionOnEOA(x, contractAddress,options.apiKey);
    })
  );
  return results;
}

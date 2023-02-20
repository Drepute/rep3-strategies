import ActionCaller from '../../actions';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { subgraph } from '../../utils';


// includedLevels: { 1: { expiry: 2 }, 2: { expiry: 6 } },
// chainId: 80001,
// type: associationBadge
// config:{
  // type:3,
  // data:{ 1: { expiry: 2 }, 2: { expiry: 6 } }
// }
// }

function getDaysInSeconds(numODays: number) {
  return numODays * 24 * 60 * 60;
}

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

function timeDifference(date1: number, date2: number) {
  const difference = date1 - date2;
  return difference;
}

function isExpiredDate (date:string){
  return Math.floor(new Date(date).getTime() / 1000) < getTimestampInSeconds()
}

const getAllMembershipNfts = async (
  url: string,
  contractAddress: string,
  page = 0,
  allMembership: any[] = []
) => {
  const membership = await subgraph.subgraphRequest(url, {
    membershipNFTs: {
      __args: {
        where: {
          contractAddress,
        },
        orderBy: 'time',
        orderDirection: 'desc',
        skip: page * 100,
      },
      claimer: true,
      tokenID: true,
      level: true,
      time: true,
      metadataUri: true,
    },
  });
  const all = allMembership.concat(membership.membershipNFTs);

  if (membership.membershipNFTs.length === 100) {
    page = page + 1;
    const res: any[] = await getAllMembershipNfts(
      url,
      contractAddress,
      page,
      all
    );
    return res;
  } else {
    return all;
  }
};

const getAllExpiringMembershipBadges = async (
  subgraphUrls: any,
  contractAddress: string,
  includedLevels: { [key: string]: { expiry: number } }
) => {
  try {
    const responseData = await getAllMembershipNfts(
      subgraphUrls,
      contractAddress
    );
    const latestValidMembership: any[] = [];

    // to remove duplicate from upgrade of memberships

    responseData.forEach((membership: any) => {
      if (
        latestValidMembership.filter(
          (x: any) => x.tokenID === membership.tokenID
        ).length === 0
      ) {
        latestValidMembership.push(membership);
      }
    });

    const expiredAddress: any[] = [];

    latestValidMembership.forEach((membership: any) => {
      const currentTime = getTimestampInSeconds();
      if (
        Object.keys(includedLevels).includes(membership.level) &&
        timeDifference(currentTime, parseInt(membership.time)) >
          getDaysInSeconds(includedLevels[membership.level].expiry)
      ) {
        expiredAddress.push(membership);
      }
    });

    return expiredAddress;
  } catch (error) {
    console.log('error', error);
    return [];
  }
};

const getAllAssociationBadges = async (
  url: string,
  contractAddress: string,
  _type:number,
  page = 0,
  allBadges: any[] = []
) => {
  const badges = await subgraph.subgraphRequest(url, {
    associationBadges: {
      __args: {
        where: {
          contractAddress,
          _type
        },
        orderBy: 'time',
        orderDirection: 'desc',
        skip: page * 100,
      },
      claimer: true,
      tokenID: true,
      time: true,
      metadataUri: true,
    },
  });
  const all = allBadges.concat(badges.associationBadges);

  if (badges.associationBadges.length === 100) {
    page = page + 1;
    const res: any[] = await getAllAssociationBadges(
      url,
      contractAddress,
      _type,
      page,
      all
    );
    return res;
  } else {
    return all;
  }
};

const getAllExpiredAssociationBadges = async(
  subgraphUrls: any,
  contractAddress: string,
  config:{type:number,data:{[key: string]: { expiry: string }}}
  ) => {
    try {
      const responseData = await getAllAssociationBadges(
        subgraphUrls,
        contractAddress,
        config.type
      );
      const expiredbadges :any[] = [];
      responseData.forEach((badges:any)=>{
        if(Object.keys(config.data).includes(badges.data) && isExpiredDate(config.data[badges.data].expiry)){
          expiredbadges.push(badges)
        }
      })
      return expiredbadges
    } catch (error) {
      console.log('error', error);
      return [];
    }
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  const SUBGRAPH_URLS: any = {
    137: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
    80001: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
  };
  console.log('eoa', eoa);
  const latestMembership = await getAllExpiringMembershipBadges(
    SUBGRAPH_URLS[options.chainId],
    contractAddress,
    options.includedLevels
  );
  const results = await Promise.all(
    latestMembership.map(async (x: any) => {
      const actions = new ActionCaller(
        contractAddress,
        ActionOnType.expiry,
        x.claimer,
        1,
        {
          changingLevel: 0,
        }
      );
      return await actions.calculateActionParams();
    })
  );
  return results;
}

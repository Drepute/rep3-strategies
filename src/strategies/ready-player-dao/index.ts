import ActionCaller from '../../actions';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { getAllAssociationBadges } from '../../utils/rep3';

//TODO: Membership differentiation from expiry

// function getDaysInSeconds(numODays: number) {
//   return numODays * 24 * 60 * 60;
// }

// function getTimestampInSeconds() {
//   return Math.floor(Date.now() / 1000);
// }

// function timeDifference(date1: number, date2: number) {
//   const difference = date1 - date2;
//   return difference;
// }

// function isExpiredDate(date: string) {
//   console.log('expired time', Math.floor(new Date(date).getTime() / 1000));
//   console.log('current time', getTimestampInSeconds());
//   return Math.floor(new Date(date).getTime() / 1000) < getTimestampInSeconds();
// }

const calculateTier = (contriNumber:number) => {
    if(contriNumber === 0){
        return 1
    }else if(contriNumber<4){
        return 2
    }else if(contriNumber>4){
        return 3
    }else{
        return 1
    }
}

const getAllExpiredAssociationBadges = async (
  subgraphUrls: any,
  contractAddress: string,
  type: number
) => {
  try {
    const responseData = await getAllAssociationBadges(
      subgraphUrls,
      contractAddress,
      type
    );
    console.log("ressss", responseData)
    const badges:any[] = []
    responseData.forEach((badge:any) => {
        if(badges.filter(x=>x.claimer === badge.claimer).length===0){
            badges.push({...badge,tier:calculateTier(responseData.filter(x => x.claimer === badge.claimer).length)})
        }
    })
    // responseData.forEach((badges: any) => {
    //   console.log(
    //     'rep3 badges',
    //     responseData,
    //     Object.keys(config.data),
    //     badges.data,
    //     isExpiredDate(config.data[badges.data].expiry)
    //   );
    //   if (
    //     Object.keys(config.data).includes(badges.data) &&
    //     isExpiredDate(config.data[badges.data].expiry)
    //   ) {
    //     expiredbadges.push(badges);
    //   }
    // });
    return badges;
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
    console.log(eoa)
  const SUBGRAPH_URLS: any = {
    137: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
    80001: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
  };
    const badgeList: any[] = await getAllExpiredAssociationBadges(
      SUBGRAPH_URLS[options.chainId],
      contractAddress,
      options.type
    );

  const results = await Promise.all(
    badgeList.map(async (x: any) => {
      const actions = new ActionCaller(
        contractAddress,
        ActionOnType.membership,
        x.claimer,
        1,
        {
          changingLevel:x.tier
        }
      );
      return await actions.calculateActionParams();
    })
  );
  return results;
}
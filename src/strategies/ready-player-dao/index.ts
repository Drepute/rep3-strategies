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

const getInfoOnMonth = (months:number) => {
    switch (months>=0){
        case months === 0 :
            return {startDate:`1/${months+1}/24`,endDate:`31/${months+1}/24`}
        case months === 1 :
            return {startDate:`1/${months+1}/24`,endDate:`28/${months+1}/24`}
        case months === 2 :
            return {startDate:`1/${months+1}/24`,endDate:`31/${months+1}/24`}
        case months === 3 :
            return {startDate:`1/${months+1}/23`,endDate:`30/${months+1}/23`}
        case months === 4 :
            return {startDate:`1/${months+1}/23`,endDate:`31/${months+1}/23`}
        case months === 5 :
            return {startDate:`1/${months+1}/23`,endDate:`30/${months+1}/23`}
        case months === 6 :
            return {startDate:`1/${months+1}/23`,endDate:`31/${months+1}/23`}
        case months === 7 :
            return {startDate:`1/${months+1}/23`,endDate:`31/${months+1}/23`}
        case months === 8 :
            return {startDate:`1/${months+1}/23`,endDate:`30/${months+1}/23`}
        case months === 9 :
            return {startDate:`1/${months+1}/23`,endDate:`31/${months+1}/23`}
        case months === 10 :
            return {startDate:`1/${months+1}/23`,endDate:`30/${months+1}/23`}
        case months === 11 :
            return {startDate:`1/${months+1}/23`,endDate:`31/${months+1}/23`}
        default :
            return {startDate:`1/${months+1}/24`,endDate:`31/${months+1}/24`}
    }
}

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
    const currentMonth = new Date().getMonth()
    console.log("info month",getInfoOnMonth(currentMonth))
    //const validBadges = responseData.filter(x=>x.time>=new Date(getInfoOnMonth(currentMonth)?.startDate).getTime() && x.time<=new Date(getInfoOnMonth(currentMonth)?.endDate).getTime())
    const badges:any[] = []
    responseData.forEach((badge:any) => {
        if(badges.filter(x=>x.claimer === badge.claimer).length===0){
          console.log("tier",calculateTier(responseData.filter(x =>x.time>=new Date(getInfoOnMonth(currentMonth)?.startDate).getTime() && x.time<=new Date(getInfoOnMonth(currentMonth)?.endDate).getTime() && x.claimer === badge.claimer).length))
            badges.push({...badge,tier:calculateTier(responseData.filter(x =>x.time>=new Date(getInfoOnMonth(currentMonth)?.startDate).getTime() && x.time<=new Date(getInfoOnMonth(currentMonth)?.endDate).getTime() && x.claimer === badge.claimer).length)})
        }
    })
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
        "mainnet": 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
        "testnet": 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    };

    const badgeList: any[] = await getAllExpiredAssociationBadges(
      SUBGRAPH_URLS[options.network],
      contractAddress,
      options.type
    );

  const results = await Promise.all(
    badgeList.map(async (x: any) => {
      const actions = new ActionCaller(
        contractAddress,
        ActionOnType.membership,
        x.claimer,
        options.network==='mainnet'?137:80001,
        {
          changingLevel:x.tier
        }
      );
      return await actions.calculateActionParams();
    })
  );
  return results;
}
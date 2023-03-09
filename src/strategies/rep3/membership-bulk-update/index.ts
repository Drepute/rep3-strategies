import ActionCaller from '../../../actions';
import { ActionOnType } from '../../../actions/utils/type';
import { StrategyParamsType } from '../../../types';
import { getAllAssociationBadges, getAllMembershipNfts } from '../../../utils/rep3';

//TODO: Membership differentiation from expiry

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

function isExpiredDate(date: string) {
  console.log('expired time', Math.floor(new Date(date).getTime() / 1000));
  console.log('current time', getTimestampInSeconds());
  return Math.floor(new Date(date).getTime() / 1000) < getTimestampInSeconds();
}



const getActiveMembership =  (
  validMembership: any,
  eao:string
) => {
  const eoaSpecificMembership = validMembership.filter(x=>x.claimer.toLowerCase() === eao.toLowerCase()).sort((a,b)=>parseFloat(b.time) - parseFloat(a.time))
  return eoaSpecificMembership[0]
};

const getIncludedMembership = async(subgraohUrl:string, contractAddress:string, includedLevels:number[]) => {
  const allMemberships = getAllMembershipNfts(subgraohUrl,contractAddress)
  // check levels with active mebership
  const validMembership = (await allMemberships).filter(x=>includedLevels.includes(x.level) === true)
  const validEoa:string[] = []
  validMembership.forEach(x=>{
    if(!validEoa.includes(x.claimer)){
      validEoa.push(x.claimer)
    }
  })
  return validEoa
}


export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  const SUBGRAPH_URLS: any = {
    "mainnet": 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
    "testnet": 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
  };
  console.log('eoa', eoa);
  const eoaList = getIncludedMembership(SUBGRAPH_URLS["testnet"],contractAddress,options.includedLevels)
  console.log('eoss',eoaList)

}

import ActionCallerV1 from '../../../actions/v1';
import { ActionOnType } from '../../../actions/utils/type';
import { StrategyParamsType } from '../../../types';
import { getAllMembershipNfts } from '../../../utils/rep3';

//TODO: Membership differentiation from expiry

const getActiveMembership = (validMembership: any[], eao: string) => {
  const eoaSpecificMembership = validMembership
    .filter(x => x.claimer.toLowerCase() === eao.toLowerCase())
    .sort((a, b) => parseFloat(b.time) - parseFloat(a.time));
  return eoaSpecificMembership[0];
};

const getIncludedMembership = async (
  subgraohUrl: string,
  contractAddress: string,
  includedLevels: number[]
) => {
  const allMemberships = await getAllMembershipNfts(
    subgraohUrl,
    contractAddress
  );
  // check levels with active mebership
  // const validMembership = (await allMemberships).filter(x=>includedLevels.includes(x.level) === true)
  //console.log(allMemberships)
  const validEoa: any[] = [];
  allMemberships.forEach(x => {
    //console.log(validEoa.filter(y=>y.claimer === x.claimer))
    if (validEoa.filter(y => y.claimer === x.claimer).length === 0) {
      validEoa.push(getActiveMembership(allMemberships, x.claimer));
    }
  });
  //console.log("su",validEoa,includedLevels)
  return validEoa.filter(
    x => includedLevels.includes(parseInt(x.level)) === true
  );
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  const SUBGRAPH_URLS: any = {
    mainnet: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
    testnet: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
  };
  //console.log('eoa', eoa);
  const eoaList = await getIncludedMembership(
    SUBGRAPH_URLS[options.network],
    contractAddress,
    options.includedLevels
  );
  // //console.log('eoss',eoaList)
  const results = await Promise.all(
    eoaList.map(async (x: any) => {
      const actions = new ActionCallerV1(
        contractAddress,
        ActionOnType.updateUri,
        x.claimer,
        options.network === 'testnet' ? 80001 : 137,
        { changingLevel: x.level, isVoucher: false }
      );
      return await actions.calculateActionParams();
    })
  );
  return results;
}

import ActionCallerV1 from '../../actions/v1';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import { getAllAssociationBadges } from '../../utils/rep3';

const getInfoOnMonth = (months: number) => {
  //console.log('current month', months);
  switch (months >= 0) {
    case months === 0:
      return { startDate: `1/${months}/24`, endDate: `31/${months}/24` };
    case months === 1:
      return { startDate: `1/${months}/24`, endDate: `28/${months}/24` };
    case months === 2:
      return { startDate: `1/${months}/24`, endDate: `31/${months}/24` };
    case months === 3:
      return { startDate: `1/${months}/23`, endDate: `30/${months}/23` };
    case months === 4:
      return { startDate: `1/${months}/23`, endDate: `30/${months}/23` };
    case months === 5:
      return { startDate: `1/${months}/23`, endDate: `31/${months}/23` };
    case months === 6:
      return { startDate: `1/${months}/23`, endDate: `30/${months}/23` };
    case months === 7:
      return { startDate: `1/${months}/23`, endDate: `31/${months}/23` };
    case months === 8:
      return { startDate: `1/${months}/23`, endDate: `31/${months}/23` };
    case months === 9:
      return { startDate: `1/${months}/23`, endDate: `30/${months}/23` };
    case months === 10:
      return { startDate: `1/${months}/23`, endDate: `31/${months}/23` };
    case months === 11:
      return { startDate: `1/${months}/23`, endDate: `30/${months}/23` };
    default:
      return { startDate: `1/${months}/24`, endDate: `31/${months}/24` };
  }
};

const calculateTier = (contriNumber: number) => {
  //console.log('badges', contriNumber);
  if (contriNumber === 0) {
    return 1;
  } else if (contriNumber >= 4) {
    return 3;
  } else {
    return 2;
  }
};

const getAllExpiredAssociationBadges = async (
  subgraphUrls: any,
  contractAddress: string,
  type: number
) => {
  try {
    const currentMonth = new Date().getMonth();
    let startDate: any = getInfoOnMonth(currentMonth).startDate;
    startDate = startDate.split('/');
    const startTimestamp = new Date(
      parseInt(`20${startDate[2]}`),
      startDate[1] - 1,
      startDate[0]
    );
    let endDate: any = getInfoOnMonth(currentMonth).endDate;
    endDate = endDate.split('/');
    const endTimestamp = new Date(
      parseInt(`20${endDate[2]}`),
      endDate[1] - 1,
      endDate[0]
    );
    //console.log('info month', startTimestamp.getTime(), endTimestamp);
    const responseData = await getAllAssociationBadges(
      subgraphUrls,
      contractAddress,
      type,
      startTimestamp.getTime() / 1000,
      endTimestamp.getTime() / 1000
    );
    const badges: any[] = [];
    responseData.forEach((badge: any) => {
      if (badges.filter(x => x.claimer === badge.claimer).length === 0) {
        //console.log(
          'claimer',
          badge.claimer,
          calculateTier(
            responseData.filter(x => x.claimer === badge.claimer).length
          )
        );
        badges.push({
          ...badge,
          tier: calculateTier(
            responseData.filter(x => x.claimer === badge.claimer).length
          ),
        });
      }
    });
    return badges;
  } catch (error) {
    //console.log('error', error);
    return [];
  }
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  //console.log(eoa);
  const SUBGRAPH_URLS: any = {
    mainnet: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
    testnet: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
  };

  const badgeList: any[] = await getAllExpiredAssociationBadges(
    SUBGRAPH_URLS[options.network],
    contractAddress,
    options.type
  );
  //console.log('badge list', badgeList);

  const results = await Promise.all(
    badgeList.map(async (x: any) => {
      const actions = new ActionCallerV1(
        contractAddress,
        ActionOnType.membership,
        x.claimer,
        options.network === 'mainnet' ? 137 : 80001,
        {
          changingLevel: x.tier,
          isVoucher: false,
        }
      );
      return await actions.calculateActionParams();
    })
  );
  return results;
}

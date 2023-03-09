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

const getAllExpiredAssociationBadges = async (
  subgraphUrls: any,
  contractAddress: string,
  config: { type: number; data: { [key: string]: { expiry: string } } }
) => {
  try {
    const responseData = await getAllAssociationBadges(
      subgraphUrls,
      contractAddress,
      config.type
    );
    const expiredbadges: any[] = [];
    responseData.forEach((badges: any) => {
      console.log(
        'rep3 badges',
        responseData,
        Object.keys(config.data),
        badges.data,
        isExpiredDate(config.data[badges.data].expiry)
      );
      if (
        Object.keys(config.data).includes(badges.data) &&
        isExpiredDate(config.data[badges.data].expiry)
      ) {
        expiredbadges.push(badges);
      }
    });
    return expiredbadges;
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
  let badgeList: any[];
  if (options.type === 'associationBadge') {
    badgeList = await getAllExpiredAssociationBadges(
      SUBGRAPH_URLS[options.chainId],
      contractAddress,
      options.config
    );
  } else {
    badgeList = await getAllExpiringMembershipBadges(
      SUBGRAPH_URLS[options.chainId],
      contractAddress,
      options.includedLevels
    );
  }
  const results = await Promise.all(
    badgeList.map(async (x: any) => {
      const actions = new ActionCaller(
        contractAddress,
        ActionOnType.expiry,
        x.claimer,
        1,
        {
          tokenId: x.tokenId,
          badgeType: options.config.type,
          metadataUri: x.metadatUri,
        }
      );
      return await actions.calculateActionParams();
    })
  );
  return results;
}

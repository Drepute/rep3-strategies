import { getRep3MembershipDetails, getRep3MembershipHistory } from '../../utils/subgraph/helperFunction';
import { BadgeActions, MembershipActions } from './type';

export const createOrUpdateMembership = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  upgradeTier: number | undefined,
  isVoucher: true | false = false,
  category: boolean | number = false
) => {
  let membershipDetailsForEOA
  if(category){
   membershipDetailsForEOA = await getRep3MembershipHistory(
    contractAddress,
    eoa,
    networkId
  )
  if(membershipDetailsForEOA.length>0){
    let returnObj
    if (membershipDetailsForEOA.filter((x:any)=>x.category==="0")[0].level === upgradeTier?.toString()) {
      returnObj =  {
        params: { ...membershipDetailsForEOA.filter((x:any)=>x.category==="0")[0], upgradeTier },
        action: false,
        eoa,
      };
    } else {
      returnObj =  {
        params: { ...membershipDetailsForEOA.filter((x:any)=>x.category==="0")[0], upgradeTier },
        action: MembershipActions.upgradeMembershipNFT,
        eoa,
      };
    }
    return {returnObj,category:membershipDetailsForEOA.filter((x:any)=>x.category === category.toString()).length>0?{
      params: { category:1, upgradeTier:1 },
      action: false,
      eoa,
    }:{
      params: { category:1, upgradeTier:1 },
      action: MembershipActions.issueMembership,
      eoa,
    }}
  }else{
    return{returnObj:{
      params: { ...membershipDetailsForEOA, upgradeTier },
      action: false,
      eoa,
    },category:{
      params: { ...membershipDetailsForEOA, upgradeTier },
      action: false,
      eoa,
    }}
  }
  }else{
    membershipDetailsForEOA = await getRep3MembershipDetails(
      contractAddress,
      eoa,
      networkId
    )
    if (membershipDetailsForEOA) {
      if (membershipDetailsForEOA.level === upgradeTier?.toString()) {
        return {
          params: { ...membershipDetailsForEOA, upgradeTier },
          action: false,
          eoa,
        };
      } else {
        return {
          params: { ...membershipDetailsForEOA, upgradeTier },
          action: MembershipActions.upgradeMembershipNFT,
          eoa,
        };
      }
    } else {
      return {
        params: { ...membershipDetailsForEOA, upgradeTier },
        action: isVoucher
          ? MembershipActions.issueMembership
          : MembershipActions.createMembershipVoucher,
        eoa,
      };
    }
  }
};

export const createBadgeVoucherOrMint = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  badgeType: number,
  badgeActionType: BadgeActions
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eoa,
    networkId
  );
  if (membershipDetailsForEOA) {
    return {
      params: {
        level: membershipDetailsForEOA.level,
        type: badgeType,
        memberTokenId: membershipDetailsForEOA.tokenID,
      },
      action: badgeActionType,
    };
  } else {
    return {
      params: {},
      action: false,
      eoa,
    };
  }
};

export const expireBadgeParam = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  badgeType: number,
  tokenId: number,
  metadataUri: string
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eoa,
    networkId
  );

  return {
    params: {
      level: membershipDetailsForEOA.level,
      memberTokenId: membershipDetailsForEOA.tokenID,
      badgeType,
      badgeTokenId: tokenId,
      metadataUri,
    },
    action: BadgeActions.burnBadge,
  };
};

export const updateMembershipUri = async (
  contractAddress: string,
  eoa: string,
  networkId: number
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eoa,
    networkId
  );
  return {
    params: { ...membershipDetailsForEOA },
    action: MembershipActions.bulkMembershipURIChange,
    eoa,
  };
};

export const generateData = (
  levels: string | any[],
  categories: string | any[]
) => {
  if (levels.length !== categories.length) {
    return [];
  }
  const levelCategoryArray: any[] = [];
  for (let i = 0; i < levels.length; i++) {
    const levelCategory = (levels[i] << 8) | categories[i];
    levelCategoryArray.push(levelCategory);
  }
  return levelCategoryArray;
};

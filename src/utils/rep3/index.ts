import { subgraph } from "../../utils";

// gives all membershipNFTs  for a contract address

export const getAllMembershipNfts = async (
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

// gives all membershipNFTs  for a contract address and type
  export const getAllAssociationBadges = async (
    url: string,
    contractAddress: string,
    _type: number,
    page = 0,
    allBadges: any[] = []
  ) => {
    const badges = await subgraph.subgraphRequest(url, {
      associationBadges: {
        __args: {
          where: {
            contractAddress,
            type: _type,
          },
          orderBy: 'time',
          orderDirection: 'desc',
          skip: page * 100,
        },
        claimer: true,
        tokenID: true,
        time: true,
        metadatUri: true,
        type: true,
        // data: true,
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
import { ethers } from 'ethers';
import {
  getRep3MembershipDetails,
  getRep3MembershipHistory,
} from '../../utils/subgraph/helperFunction';
import { BadgeActions, MembershipActions } from './type';

export const createOrUpdateMembership = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  upgradeTier: number | undefined,
  isVoucher: true | false = false
) => {
  const membershipDetailsForEOA = await getRep3MembershipDetails(
    contractAddress,
    eoa,
    networkId
  );
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
export const createOrUpdateMembershipWithCategory = async (
  contractAddress: string,
  eoa: string,
  networkId: number,
  upgradeLevelCategory: { level: number; category: number }[]
) => {
  if (upgradeLevelCategory.length > 0) {
    try {
      const membershipDetailsForEOA = await getRep3MembershipHistory(
        contractAddress,
        eoa,
        networkId
      );
      if (membershipDetailsForEOA) {
        const latestMembership = await Promise.all(
          upgradeLevelCategory.map(async x => {
            const latest = membershipDetailsForEOA.filter(
              y => y.category === x.category.toString()
            )[0];
            try {
              const res2 = new ethers.Contract(
                '0x362ba4dff07e64d3b582dd8ba19fe0c2c5be87dd',
                [
                  {
                    inputs: [],
                    stateMutability: 'nonpayable',
                    type: 'constructor',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                      },
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'approved',
                        type: 'address',
                      },
                      {
                        indexed: true,
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'Approval',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                      },
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'operator',
                        type: 'address',
                      },
                      {
                        indexed: false,
                        internalType: 'bool',
                        name: 'approved',
                        type: 'bool',
                      },
                    ],
                    name: 'ApprovalForAll',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'approver',
                        type: 'address',
                      },
                    ],
                    name: 'ApproverAdded',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'approver',
                        type: 'address',
                      },
                    ],
                    name: 'ApproverRemoved',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'uint8',
                        name: 'level',
                        type: 'uint8',
                      },
                      {
                        indexed: true,
                        internalType: 'uint8',
                        name: 'category',
                        type: 'uint8',
                      },
                      {
                        indexed: true,
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'Claim',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: false,
                        internalType: 'uint8',
                        name: 'version',
                        type: 'uint8',
                      },
                    ],
                    name: 'Initialized',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'uint256',
                        name: 'memberTokenId',
                        type: 'uint256',
                      },
                      {
                        indexed: true,
                        internalType: 'uint8',
                        name: '_type',
                        type: 'uint8',
                      },
                      {
                        indexed: true,
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'Issue',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                      {
                        indexed: false,
                        internalType: 'string',
                        name: 'tokenURI',
                        type: 'string',
                      },
                      {
                        indexed: true,
                        internalType: 'uint8',
                        name: 'level',
                        type: 'uint8',
                      },
                      {
                        indexed: true,
                        internalType: 'uint8',
                        name: 'category',
                        type: 'uint8',
                      },
                    ],
                    name: 'MembershipTokenChange',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: false,
                        internalType: 'string',
                        name: 'name',
                        type: 'string',
                      },
                    ],
                    name: 'NameChange',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'previousOwner',
                        type: 'address',
                      },
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'newOwner',
                        type: 'address',
                      },
                    ],
                    name: 'OwnershipTransferred',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                      },
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'approved',
                        type: 'address',
                      },
                      {
                        indexed: true,
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'Revoke',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'from',
                        type: 'address',
                      },
                      {
                        indexed: true,
                        internalType: 'address',
                        name: 'to',
                        type: 'address',
                      },
                      {
                        indexed: true,
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'Transfer',
                    type: 'event',
                  },
                  {
                    anonymous: false,
                    inputs: [
                      {
                        indexed: true,
                        internalType: 'uint8',
                        name: 'level',
                        type: 'uint8',
                      },
                      {
                        indexed: true,
                        internalType: 'uint8',
                        name: 'category',
                        type: 'uint8',
                      },
                      {
                        indexed: true,
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'Upgrade',
                    type: 'event',
                  },
                  {
                    inputs: [],
                    name: 'DOMAIN_SEPARATOR',
                    outputs: [
                      {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address[]',
                        name: 'accounts',
                        type: 'address[]',
                      },
                      {
                        internalType: 'uint16[]',
                        name: 'levelCategories',
                        type: 'uint16[]',
                      },
                      {
                        internalType: 'bool[]',
                        name: 'values',
                        type: 'bool[]',
                      },
                    ],
                    name: '_bulkUpdateMemberTokenId',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'approver',
                        type: 'address',
                      },
                    ],
                    name: 'addApprover',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'to',
                        type: 'address',
                      },
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'approve',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'account',
                        type: 'address',
                      },
                    ],
                    name: 'balanceOf',
                    outputs: [
                      {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256[]',
                        name: 'badgeTokenIds',
                        type: 'uint256[]',
                      },
                    ],
                    name: 'batchBurnBadge',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256[]',
                        name: 'memberTokenIds',
                        type: 'uint256[]',
                      },
                      {
                        internalType: 'uint8[]',
                        name: 'type_',
                        type: 'uint8[]',
                      },
                      {
                        internalType: 'uint256[]',
                        name: 'data',
                        type: 'uint256[]',
                      },
                      {
                        internalType: 'string',
                        name: 'tokenUri',
                        type: 'string',
                      },
                    ],
                    name: 'batchIssueBadge',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address[]',
                        name: 'accounts',
                        type: 'address[]',
                      },
                      {
                        internalType: 'uint256[]',
                        name: 'data',
                        type: 'uint256[]',
                      },
                      {
                        internalType: 'string[]',
                        name: 'tokenUri',
                        type: 'string[]',
                      },
                    ],
                    name: 'bulkIssueMembership',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        components: [
                          {
                            internalType: 'string',
                            name: 'tokenUri',
                            type: 'string',
                          },
                          {
                            internalType: 'uint256',
                            name: 'tokenId',
                            type: 'uint256',
                          },
                        ],
                        internalType: 'struct IREP3TokenTypes.LevelUri[]',
                        name: 'updateInfo',
                        type: 'tuple[]',
                      },
                    ],
                    name: 'bulkMembershipURIChange',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256[]',
                        name: 'tokenId',
                        type: 'uint256[]',
                      },
                      {
                        internalType: 'uint256[]',
                        name: 'data',
                        type: 'uint256[]',
                      },
                      {
                        internalType: 'string[]',
                        name: 'tokenUri',
                        type: 'string[]',
                      },
                    ],
                    name: 'bulkUpdateMembership',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'badgeTokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'burnBadge',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address[]',
                        name: 'approverToAdd',
                        type: 'address[]',
                      },
                      {
                        internalType: 'address[]',
                        name: 'approversToRemove',
                        type: 'address[]',
                      },
                    ],
                    name: 'changeApprover',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        components: [
                          {
                            internalType: 'uint32',
                            name: 'index',
                            type: 'uint32',
                          },
                          {
                            internalType: 'uint256[]',
                            name: 'memberTokenIds',
                            type: 'uint256[]',
                          },
                          {
                            internalType: 'uint8[]',
                            name: 'type_',
                            type: 'uint8[]',
                          },
                          {
                            internalType: 'string',
                            name: 'tokenUri',
                            type: 'string',
                          },
                          {
                            internalType: 'uint256[]',
                            name: 'data',
                            type: 'uint256[]',
                          },
                          {
                            internalType: 'uint32[]',
                            name: 'nonces',
                            type: 'uint32[]',
                          },
                          {
                            internalType: 'bytes',
                            name: 'signature',
                            type: 'bytes',
                          },
                        ],
                        internalType: 'struct IREP3TokenTypes.BadgeVoucher',
                        name: 'voucher',
                        type: 'tuple',
                      },
                      {
                        internalType: 'uint256',
                        name: 'memberTokenId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256[]',
                        name: 'approvedIndex',
                        type: 'uint256[]',
                      },
                    ],
                    name: 'claimBadge',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        components: [
                          {
                            internalType: 'uint256[]',
                            name: 'data',
                            type: 'uint256[]',
                          },
                          {
                            internalType: 'uint8[]',
                            name: 'end',
                            type: 'uint8[]',
                          },
                          {
                            internalType: 'address[]',
                            name: 'to',
                            type: 'address[]',
                          },
                          {
                            internalType: 'string',
                            name: 'tokenUris',
                            type: 'string',
                          },
                          {
                            internalType: 'bytes',
                            name: 'signature',
                            type: 'bytes',
                          },
                        ],
                        internalType: 'struct IREP3TokenTypes.NFTVoucher',
                        name: 'voucher',
                        type: 'tuple',
                      },
                      {
                        internalType: 'uint256',
                        name: 'approvedIndex',
                        type: 'uint256',
                      },
                    ],
                    name: 'claimMembership',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint8',
                        name: 'slot',
                        type: 'uint8',
                      },
                    ],
                    name: 'dataSlot',
                    outputs: [
                      {
                        internalType: 'uint8',
                        name: '',
                        type: 'uint8',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'getApproved',
                    outputs: [
                      {
                        internalType: 'address',
                        name: '',
                        type: 'address',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'getTokenData',
                    outputs: [
                      {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'getType',
                    outputs: [
                      {
                        internalType: 'uint8',
                        name: '',
                        type: 'uint8',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'memberTokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'getVoucherNonce',
                    outputs: [
                      {
                        internalType: 'uint32',
                        name: '',
                        type: 'uint32',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'string',
                        name: 'name_',
                        type: 'string',
                      },
                      {
                        internalType: 'string',
                        name: 'symbol_',
                        type: 'string',
                      },
                      {
                        internalType: 'address[]',
                        name: '_approvers',
                        type: 'address[]',
                      },
                      {
                        internalType: 'address',
                        name: 'trustedForwarder_',
                        type: 'address',
                      },
                    ],
                    name: 'initialize',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                      },
                      {
                        internalType: 'address',
                        name: 'operator',
                        type: 'address',
                      },
                    ],
                    name: 'isApprovedForAll',
                    outputs: [
                      {
                        internalType: 'bool',
                        name: '',
                        type: 'bool',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'approver',
                        type: 'address',
                      },
                    ],
                    name: 'isApprover',
                    outputs: [
                      {
                        internalType: 'bool',
                        name: '',
                        type: 'bool',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'memberTokenId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint8',
                        name: 'type_',
                        type: 'uint8',
                      },
                      {
                        internalType: 'uint256',
                        name: 'data',
                        type: 'uint256',
                      },
                      {
                        internalType: 'string',
                        name: 'tokenUri',
                        type: 'string',
                      },
                    ],
                    name: 'issueBadge',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'account',
                        type: 'address',
                      },
                      {
                        internalType: 'uint256',
                        name: 'data',
                        type: 'uint256',
                      },
                      {
                        internalType: 'string',
                        name: 'tokenUri',
                        type: 'string',
                      },
                    ],
                    name: 'issueMembership',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'account',
                        type: 'address',
                      },
                      {
                        internalType: 'uint16',
                        name: 'levelCategory',
                        type: 'uint16',
                      },
                    ],
                    name: 'membershipExists',
                    outputs: [
                      {
                        internalType: 'bool',
                        name: '',
                        type: 'bool',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'account',
                        type: 'address',
                      },
                      {
                        internalType: 'uint8',
                        name: 'level',
                        type: 'uint8',
                      },
                    ],
                    name: 'membershipLevelExists',
                    outputs: [
                      {
                        internalType: 'bool',
                        name: '',
                        type: 'bool',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'string',
                        name: 'tokenUri',
                        type: 'string',
                      },
                    ],
                    name: 'membershipURIChange',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [],
                    name: 'migrate',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [],
                    name: 'name',
                    outputs: [
                      {
                        internalType: 'string',
                        name: '',
                        type: 'string',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [],
                    name: 'owner',
                    outputs: [
                      {
                        internalType: 'address',
                        name: '',
                        type: 'address',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'ownerOf',
                    outputs: [
                      {
                        internalType: 'address',
                        name: '',
                        type: 'address',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'approver',
                        type: 'address',
                      },
                    ],
                    name: 'removeApprover',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [],
                    name: 'renounceOwnership',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'revokeMembership',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'from',
                        type: 'address',
                      },
                      {
                        internalType: 'address',
                        name: 'to',
                        type: 'address',
                      },
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'safeTransferFrom',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'from',
                        type: 'address',
                      },
                      {
                        internalType: 'address',
                        name: 'to',
                        type: 'address',
                      },
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'bytes',
                        name: '_data',
                        type: 'bytes',
                      },
                    ],
                    name: 'safeTransferFrom',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'operator',
                        type: 'address',
                      },
                      {
                        internalType: 'bool',
                        name: 'approved',
                        type: 'bool',
                      },
                    ],
                    name: 'setApprovalForAll',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        components: [
                          {
                            internalType: 'uint256',
                            name: 'tokenId',
                            type: 'uint256',
                          },
                          {
                            internalType: 'address',
                            name: 'to',
                            type: 'address',
                          },
                          {
                            internalType: 'bytes',
                            name: 'signature',
                            type: 'bytes',
                          },
                        ],
                        internalType: 'struct IREP3TokenTypes.TransferVoucher',
                        name: 'voucher',
                        type: 'tuple',
                      },
                    ],
                    name: 'soulTransfer',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'bytes4',
                        name: 'interfaceId',
                        type: 'bytes4',
                      },
                    ],
                    name: 'supportsInterface',
                    outputs: [
                      {
                        internalType: 'bool',
                        name: '',
                        type: 'bool',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [],
                    name: 'symbol',
                    outputs: [
                      {
                        internalType: 'string',
                        name: '',
                        type: 'string',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'tokenURI',
                    outputs: [
                      {
                        internalType: 'string',
                        name: '',
                        type: 'string',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [],
                    name: 'totalSupply',
                    outputs: [
                      {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256',
                      },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'from',
                        type: 'address',
                      },
                      {
                        internalType: 'address',
                        name: 'to',
                        type: 'address',
                      },
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                    ],
                    name: 'transferFrom',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'address',
                        name: 'newOwner',
                        type: 'address',
                      },
                    ],
                    name: 'transferOwnership',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                  {
                    inputs: [
                      {
                        internalType: 'uint256',
                        name: 'tokenId',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'data',
                        type: 'uint256',
                      },
                      {
                        internalType: 'string',
                        name: 'tokenUri',
                        type: 'string',
                      },
                    ],
                    name: 'updateMembership',
                    outputs: [],
                    stateMutability: 'nonpayable',
                    type: 'function',
                  },
                ],
                new ethers.providers.JsonRpcProvider(
                  'https://polygon-mainnet.g.alchemy.com/v2/gBoo6ihGnSUa3ObT49K36yHG6BdtyuVo'
                )
              );
              const addr = await res2.ownerOf(latest.tokenID);
              if (latest && addr) {
                return {
                  params: { ...latest, upgradeTier: x.level },
                  action:
                    latest.level === x.level.toString()
                      ? MembershipActions.noChange
                      : MembershipActions.upgradeMembershipNFT,
                  eoa,
                };
              } else {
                return {
                  params: { category: x.category, upgradeTier: x.level },
                  action: MembershipActions.issueMembership,
                  eoa,
                };
              }
            } catch (error) {
              return {
                params: { category: x.category, upgradeTier: x.level },
                action: MembershipActions.issueMembership,
                eoa,
              };
            }
          })
        );
        return latestMembership;
      } else {
        return [
          {
            params: {
              category: upgradeLevelCategory[0].category,
              upgradeTier: upgradeLevelCategory[0].level,
            },
            action: MembershipActions.issueMembership,
            eoa,
          },
        ];
      }
    } catch (error) {
      console.log('error', error);
      return error;
    }
  } else {
    return [
      {
        params: {},
        action: false,
        eoa,
      },
    ];
  }
};

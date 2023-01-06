export enum ActionOnType {
  membership = 'membership',
  badge = 'badge',
}

export enum MembershipActions {
  createMembershipVoucher = 'createMembershipVoucher',
  upgradeMembershipNFT = 'updateMembership',
  downgradeMembershipNFT = 'updateMembership',
  noChange = 'false',
}

export enum BadgeActions {
  createBadgeVoucher = 'createBadgeVoucher',
  directMint = 'batchIssueBadge',
}

export enum ActionOnType {
  membership = 'membership',
  directMembership = 'directMembership',
  badge = 'badge',
  expiry = 'expiry',
  updateUri = 'updateUri',
}

export enum MembershipActions {
  createMembershipVoucher = 'createMembershipVoucher',
  upgradeMembershipNFT = 'updateMembership',
  downgradeMembershipNFT = 'updateMembership',
  bulkMembershipURIChange = 'bulkMembershipURIChange',
  noChange = 'false',
}
export enum ActionOnTypeV2 {
  badge = 'badge',
}
export enum MembershipActionsV2 {
  badgeMint = 'mint',
  updateTier = 'updateTier',
}

export enum BadgeActions {
  createBadgeVoucher = 'createBadgeVoucher',
  directMint = 'batchIssueBadge',
  burnBadge = 'batchBurnBadge',
}

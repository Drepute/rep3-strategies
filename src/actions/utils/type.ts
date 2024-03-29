export enum ActionOnType {
  membership = 'membership',
  directMembership = 'directMembership',
  badge = 'badge',
  expiry = 'expiry',
  updateUri = 'updateUri',
  category = 'categoryLevel',
}

export enum MembershipActions {
  createMembershipVoucher = 'createMembershipVoucher',
  upgradeMembershipNFT = 'updateMembership',
  issueMembership = 'issueMembership',
  bulkMembershipURIChange = 'bulkMembershipURIChange',
  noChange = 'false',
}
export enum ActionOnTypeV2 {
  badge = 'badge',
  dynamicBadge = 'dynamicBadge',
  currentParams = 'currentParams',
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

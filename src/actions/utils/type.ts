export enum ActionOnType {
  membership = 'membership',
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

export enum MembershipActionsV2 {
  tierMint = 'tierMint',
  upgradeTier= 'upgradeTier'
  // upgradeMembershipNFT = 'updateMembership',
  // downgradeMembershipNFT = 'updateMembership',
  // bulkMembershipURIChange = 'bulkMembershipURIChange',
  // noChange = 'false',
}

export enum BadgeActions {
  createBadgeVoucher = 'createBadgeVoucher',
  directMint = 'batchIssueBadge',
  burnBadge = 'batchBurnBadge',
}

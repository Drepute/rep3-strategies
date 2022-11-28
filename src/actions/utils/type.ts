export enum ActionOnType {
  membership = 'membership',
  badge = 'badge',
}

export enum MembershipActions {
  createMembershipVoucher = 'createMembershipVoucher',
  upgradeMembershipNFT = 'upgradeMembershipNFT',
  downgradeMembershipNFT = 'downgradeMembershipNFT',
}

export enum BadgeActions {
  createBadgeVoucher = 'createBadgeVoucher',
  directMint = 'directMint',
}

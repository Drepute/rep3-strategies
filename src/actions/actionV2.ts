import { createOrUpdateBadgeV2 } from './utils/helperFunctionsV2';
import { ActionOnTypeV2, BadgeActions } from './utils/type';

export default class ActionCallerV2 {
  public contractAddress: string;
  public actionType: ActionOnTypeV2;
  public eoa: string;
  public network: number;
  public membershipOptions?: { changingLevel: number } | any;
  // public badgeOptions?: { badgeType: number; actionType: BadgeActions } | any;
  constructor(
    contractAddress: string,
    actionType: ActionOnTypeV2,
    eoa: string,
    network: number,
    options:
      | { changingLevel: number }
      | { badgeType: number; actionType: BadgeActions }
      | { tokenId: number; badgeType: number; metadataUri: string }
  ) {
    this.contractAddress = contractAddress;
    this.actionType = actionType;
    this.eoa = eoa;
    this.network = network;
    if (actionType === ActionOnTypeV2.badge) {
      this.membershipOptions = options;
    }
  }

  calculateActionParams = async () => {
    switch (this.actionType) {
      case ActionOnTypeV2.badge:
        try {
          return await createOrUpdateBadgeV2(
            this.contractAddress,
            this.eoa,
            this.network,
            this?.membershipOptions?.changingLevel
          );
        } catch (error) {
          return error;
        }
      default:
        return null;
    }
  };
}
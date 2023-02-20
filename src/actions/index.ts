import {
  createBadgeVoucherOrMint,
  createOrUpdateMembership,
  expireBadgeParam,
} from './utils/helperFunctions';
import { ActionOnType, BadgeActions } from './utils/type';

export default class ActionCaller {
  public contractAddress: string;
  public actionType: ActionOnType;
  public eoa: string;
  public network: number;
  public membershipOptions?: { changingLevel: number } | any;
  public badgeOptions?: { badgeType: number; actionType: BadgeActions } | any;
  constructor(
    contractAddress: string,
    actionType: ActionOnType,
    eoa: string,
    network: number,
    options:
      | { changingLevel: number }
      | { badgeType: number; actionType: BadgeActions }
      | { tokenId:number}
  ) {
    this.contractAddress = contractAddress;
    this.actionType = actionType;
    this.eoa = eoa;
    this.network = network;
    if (actionType === ActionOnType.membership) {
      this.membershipOptions = options;
    } else {
      this.badgeOptions = options;
    }
  }

  calculateActionParams = async () => {
    switch (this.actionType) {
      case ActionOnType.membership:
        try {
          return await createOrUpdateMembership(
            this.contractAddress,
            this.eoa,
            this.network,
            this?.membershipOptions?.changingLevel
          );
        } catch (error) {
          return error;
        }
      case ActionOnType.badge:
        try {
          return await createBadgeVoucherOrMint(
            this.contractAddress,
            this.eoa,
            this.network,
            this.badgeOptions.badgeType,
            this.badgeOptions.actionType
          );
        } catch (error) {
          return error;
        }
        case ActionOnType.expiry:
          try {
            return await expireBadgeParam(
              this.contractAddress,
              this.eoa,
              this.network,
              this.badgeOptions.tokenID
            );
          } catch (error) {
            return error;
          }
      default:
        return null;
    }
  };
}

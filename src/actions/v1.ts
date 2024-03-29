import {
  createBadgeVoucherOrMint,
  createOrUpdateMembership,
  createOrUpdateMembershipWithCategory,
  expireBadgeParam,
  updateMembershipUri,
} from './utils/helperFunctionsV1';
import { ActionOnType, BadgeActions } from './utils/type';

export default class ActionCallerV1 {
  public contractAddress: string;
  public actionType: ActionOnType;
  public eoa: string;
  public network: number;
  public membershipOptions?:
    | { changingLevel: number }
    | { changingLevelCategory: { level: number; category: number }[] }
    | any;
  public badgeOptions?: { badgeType: number; actionType: BadgeActions } | any;
  constructor(
    contractAddress: string,
    actionType: ActionOnType,
    eoa: string,
    network: number,
    options:
      | { changingLevel: number; isVoucher: true | false }
      | { badgeType: number; actionType: BadgeActions }
      | { tokenId: number; badgeType: number; metadataUri: string }
      | {
          changingLevelCategory: {
            level: number | boolean | string;
            category: number | boolean | string;
          }[];
        }
  ) {
    this.contractAddress = contractAddress;
    this.actionType = actionType;
    this.eoa = eoa;
    this.network = network;
    if (
      actionType === ActionOnType.membership ||
      ActionOnType.directMembership ||
      ActionOnType.category
    ) {
      this.membershipOptions = options;
    } else if (actionType === ActionOnType.badge || ActionOnType.expiry) {
      this.badgeOptions = options;
    } else if (actionType === ActionOnType.category) {
      this.membershipOptions = options;
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
            this?.membershipOptions?.changingLevel,
            this?.membershipOptions?.isVoucher
          );
        } catch (error) {
          return error;
        }
      case ActionOnType.category:
        try {
          return await createOrUpdateMembershipWithCategory(
            this.contractAddress,
            this.eoa,
            this.network,
            this.membershipOptions.changingLevelCategory
          );
        } catch (error) {
          return error;
        }
      case ActionOnType.directMembership:
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
      case ActionOnType.expiry:
        try {
          return await expireBadgeParam(
            this.contractAddress,
            this.eoa,
            this.network,
            this?.badgeOptions?.badgeType,
            this?.badgeOptions?.tokenId,
            this?.badgeOptions?.metadataUri
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
      case ActionOnType.updateUri:
        try {
          return await updateMembershipUri(
            this.contractAddress,
            this.eoa,
            this.network
          );
        } catch (error) {
          return error;
        }
      default:
        return null;
    }
  };
}

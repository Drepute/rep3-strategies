import {
  createOrUpdateBadgeV2WithMetadata,
  getCurrentParams,
} from './utils/helperFunctionsV2';
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
    options?:
      | { changingLevel: number }
      | { badgeType: number; actionType: BadgeActions }
      | { tokenId: number; badgeType: number; metadataUri: string }
  ) {
    this.contractAddress = contractAddress;
    this.actionType = actionType;
    this.eoa = eoa;
    this.network = network;
    if (actionType === ActionOnTypeV2.badge || ActionOnTypeV2.dynamicBadge) {
      this.membershipOptions = options;
    }
  }

  calculateActionParams = async (metaDataOptions?: {
    amount: number;
    isDaysStaked: number;
    tokenStaked: number;
  }) => {
    switch (this.actionType) {
      case ActionOnTypeV2.dynamicBadge:
        try {
          if (metaDataOptions) {
            return await createOrUpdateBadgeV2WithMetadata(
              this.contractAddress,
              this.eoa,
              this.network,
              this?.membershipOptions?.changingLevel,
              metaDataOptions
            );
          }
          return null;
        } catch (error) {
          return error;
        }
      case ActionOnTypeV2.currentParams:
        try {
          return await getCurrentParams(
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

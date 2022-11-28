import { createOrUpdateMembership } from './utils/helperFunctions';
import { ActionOnType } from './utils/type';

export default class ActionCaller {
  public contractAddress: string;
  public actionType: ActionOnType;
  public eoa: string;
  public network: number;
  public membershipOptions?: { changingLevel: number } | any;
  public badgeOptions?: { badgeType: number } | any;
  constructor(
    contractAddress: string,
    actionType: ActionOnType,
    eoa: string,
    network: number,
    options: { changingLevel: number } | { badgeType: number }
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
      default:
        return null;
    }
  };
}

import { Contract } from '@ethersproject/contracts';
import { ContractObj } from './utils/types';
import { ethers } from 'ethers';
import { network } from './network';

export default class ContractCaller {
  public contractInfo: ContractObj[];
  public contractInstances: Record<string, Contract> | undefined;

  constructor(contractInfo: ContractObj[]) {
    this.contractInfo = contractInfo;
  }

  contractSetup = () => {
    const instances: Record<string, Contract> | undefined = {};
    this.contractInfo.forEach(contractObj => {
      instances[contractObj.name] = new ethers.Contract(
        contractObj.address,
        contractObj.abi,
        new ethers.providers.JsonRpcProvider(
          network[contractObj.network.toString()].rpc
        )
      );
    });
    this.contractInstances = instances;
  };

  executeFunctionCall = async (
    contractName: string,
    functionName: string,
    ...args: any
  ) => {
    if (this.contractInstances) {
      console.log('Contract Instance');
      try {
        const res = await this.contractInstances[contractName][functionName](
          ...args
        );
        return res;
      } catch (error) {
        console.log('error', error);
      }
    } else {
      throw 'Contract not initiated';
    }
  };
}

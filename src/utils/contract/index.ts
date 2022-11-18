import { Contract } from '@ethersproject/contracts';
import { ContractObj } from './utils/types';
import { ethers } from 'ethers';

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
        contractObj.abi
      );
    });
    this.contractInstances = instances;
  };

  executeFunctionCall = async (
    contractName: string,
    functionName: string,
    args: any[]
  ) => {
    if (this.contractInstances) {
      const encodedResult: string = this.contractInstances[
        contractName
      ].interface.encodeFunctionResult(functionName, args);
      const decoded: ethers.utils.Result = this.contractInstances[
        contractName
      ].interface.decodeFunctionResult(functionName, encodedResult);
      return decoded;
    } else {
      throw 'Contract not initiated';
    }
  };
}

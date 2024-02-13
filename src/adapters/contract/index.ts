import { ethers } from 'ethers';
import { network } from '../../network.js';
import { AdapterWithVariables } from '../../types.js';
import { erc1155Abi } from '../../abis/erc1155Abi.js';
import { erc20Abi } from '../../abis/erc20Abi.js';
import { erc721Abi } from '../../abis/erc721Abi.js';

const genericViewCall = async (
  address: string,
  abi: any[],
  functionName: string,
  params: any[],
  chainId: number
) => {
  const provider = new ethers.providers.JsonRpcProvider(network[chainId].rpc);
  const nftContract = new ethers.Contract(address, abi, provider);
  if (params.length > 0) {
    const res = await nftContract[functionName](...params);
    console.log('checkkkk', res);
    return res;
  } else {
    const res = await nftContract[functionName]();

    return res;
  }
};

export const arithmeticOperand = (a: number, b: number, op: string) => {
  if (op === '===') {
    return a === b;
  } else if (op === '>=') {
    return a >= b;
  } else if (op === '<=') {
    return a <= b;
  } else if (op === '>') {
    return a > b;
  } else if (op === '<') {
    return a < b;
  } else {
    return false;
  }
};
const getAbiOnType = (type: 'erc1155' | 'erc721' | 'erc20' | 'custom') => {
  switch (type) {
    case 'erc1155':
      return erc1155Abi;
    case 'erc721':
      return erc721Abi;
    case 'erc20':
      return erc20Abi;
    default:
      return erc20Abi;
  }
};
export const viewAdapter = async (
  holder: string,
  onlyValue: boolean,
  functionParams: AdapterWithVariables['contractAdapter']
) => {
  let response;
  if (
    functionParams.contractType === 'custom' &&
    functionParams.abi &&
    functionParams.functionName
  ) {
    if (
      functionParams.functionParam &&
      functionParams.functionParam?.length > 0
    ) {
      const params = functionParams.functionParam;
      const indexOfUserAddress = params.indexOf('<USER_ADDRESS>');
      params.splice(indexOfUserAddress, 1, holder);
      response = await genericViewCall(
        functionParams.contractAddress,
        functionParams.abi,
        functionParams.functionName,
        params,
        functionParams.chainId ?? 1
      );
    } else {
      console.log('hereeeeee', functionParams.abi);
      response = await genericViewCall(
        functionParams.contractAddress,
        functionParams.abi,
        functionParams.functionName,
        [],
        functionParams.chainId ?? 1
      );
    }
  } else if (
    (functionParams.contractType === 'erc1155' ||
      functionParams.contractType === 'erc20' ||
      functionParams.contractType === 'erc721') &&
    functionParams.functionName
  ) {
    response = await genericViewCall(
      functionParams.contractAddress,
      getAbiOnType(functionParams.contractType),
      functionParams.functionName,
      functionParams.functionParam
        ? [holder, ...functionParams.functionParam]
        : [holder],
      functionParams.chainId ?? 1
    );
    console.log('here started!!!!', parseInt(response.toString()));
  }
  if (!onlyValue) {
    return arithmeticOperand(
      parseInt(response.toString()),
      functionParams.balanceThreshold ??
        eval(functionParams.thresholdEval ?? ''),
      functionParams.operator ?? '=='
    );
  } else {
    return response.toString();
  }
};

//getters function

import { ethers } from 'ethers';
import { erc721 } from '../../../abis/erc721Abi.js';
import { network } from '../../network';

const nftGetterCall = async (
  address: string,
  functionName: string,
  params: any[],
  chainId: number
) => {
  console.log(functionName, ...params);
  const provider = new ethers.providers.JsonRpcProvider(network[chainId].rpc);
  const nftContract = new ethers.Contract(address, erc721, provider);
  const res = await nftContract[functionName](...params);
  //   console.log('response', res.toString());
  return res;
};

const arthematicOperand = (a:number,b:number,op:string) => {
  if(op === "==="){
    return a === b
  }else if(op === ">="){
    return a >= b
  }else if(op === "<="){
    return a <= b
  }else if(op === ">"){
    return a > b
  }else if(op === "<"){
    return a < b
  }else{
    return false
  }
}

export const operationOnXNumberOfNft = async (
  holder: string,
  functionParams: {
    nftAddress: string;
    balanceThreshold: number;
    chainId: number;
    operator:"==="|">="|"<="|"<"|">"
  }
) => {
  console.log(holder,functionParams)
  const response = await nftGetterCall(
    functionParams.nftAddress,
    'balanceOf',
    [ethers.utils.getAddress(holder)],
    functionParams.chainId
  );
  return arthematicOperand(functionParams.balanceThreshold,parseInt(response.toString()),functionParams.operator);
};

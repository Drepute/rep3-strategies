import { ethers } from 'ethers';
import { network } from '../../network.js';
import { AdapterWithVariables } from '../../types.js';

const genericViewCall = async (
  address: string,
  abi: any[],
  functionName: string,
  params: any[],
  chainId: number
) => {
  const provider = new ethers.providers.JsonRpcProvider(network[chainId].rpc);
  const nftContract = new ethers.Contract(address, abi, provider);
  const res = await nftContract[functionName](...params);
  return res;
};

const arithmeticOperand = (a: number, b: number, op: string) => {
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
const getAbiOnType = () => {
  
}
export const viewAdapter = async (
  holder: string,
  functionParams: AdapterWithVariables['contractViewAdapter']
) => {
  let response
  if(functionParams.type==='custom'&&functionParams.abi&&functionParams.functionFragment){
    response = await genericViewCall(
      functionParams.contractAddress,functionParams.abi,functionParams.functionFragment,[holder],functionParams.chainId
    )
  }else if (functionParams.type==='erc1155'||functionParams.type==='erc20'||functionParams.type==='erc721'){
    response = await genericViewCall(
      functionParams.contractAddress,functionParams.abi,functionParams.functionFragment,[holder],functionParams.chainId
    )
  }
  return arithmeticOperand(
    functionParams.balanceThreshold,
    parseInt(response.toString()),
    functionParams.operator
  );
};



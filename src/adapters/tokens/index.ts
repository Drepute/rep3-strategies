import { network } from "../../network";
import { erc20Abi } from '../../../abis/erc20Abi.js';
import { ethers } from "ethers";
import BlockExplorer from "../../utils/getBlockOnTime";

const tokenGetterCall = async (
    address: string,
    functionName: string,
    params: any[],
    chainId: number
  ) => {
    console.log(functionName, ...params);
    const provider = new ethers.providers.JsonRpcProvider(network[chainId].rpc);
    const tokenContract = new ethers.Contract(address, erc20Abi, provider);
    const res = await tokenContract[functionName](...params);
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
  
export const operationOnXNumberOfToken = async (
    holder: string,
    functionParams: {
        tokenAddress: string;
        balanceThreshold: number;
        chainId: number;
        operator:"==="|">="|"<="|"<"|">"
    }
  ) => {
    const response = await tokenGetterCall(
      functionParams.tokenAddress,
      'balanceOf',
      [ethers.utils.getAddress(holder)],
      functionParams.chainId
    );
    return arthematicOperand(functionParams.balanceThreshold,parseInt(response.toString()),functionParams.operator);
};

  // large sample size
export const getBalanceOfTokenAtXTime = async(holder:string,functionParams: {
    tokenAddress: string;
    balanceThreshold: number;
    chainId: number;
    timeStampInUnix:string
}) => {
    const blockExplorer = new BlockExplorer(functionParams.chainId)
    const toBlock = await blockExplorer.getDate(functionParams.timeStampInUnix)
    console.log(holder,toBlock)
    const eventSignature = 'Transfer(address,address,uint256)';
    const eventTopic = ethers.utils.id(eventSignature); // Get the data hex string
    const provider = new ethers.providers.JsonRpcProvider(network[functionParams.chainId].rpc)
    const allPastLogs =  await provider.getLogs({address:functionParams.tokenAddress,topics:[eventTopic],toBlock:toBlock.block,fromBlock:17328013})
    console.log(allPastLogs)
}
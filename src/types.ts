export interface StrategyParamsType {
  contractAddress: string;
  eoa: [string];
  options: object | any;
}

export interface CallStrategyParamsType extends StrategyParamsType {
  strategy: string;
}

export interface StrategyType {
  strategy: ({ ...args }: StrategyParamsType) => Promise<any>;
  example?: CallStrategyParamsType | null;
  about?: string;
}
// export type StrategyWithAdapters = {
//   operationOnXNumberOfNft: {
//     nftAddress: string;
//     balanceThreshold: number;
//     operator: '===' | '>=' | '<=' | '<' | '>';
//     chainId: number;
//   };
//   operationOnXNumberOfToken: {
//     tokenAddress: string;
//     balanceThreshold: number;
//     operator: '===' | '>=' | '<=' | '<' | '>';
//     chainId: number;
//   };
// };
export type AdapterWithVariables = {
  operationOnXNumberOfNft: {
    nftAddress: string;
    balanceThreshold: number;
    operator: '===' | '>=' | '<=' | '<' | '>';
    chainId: number;
  };
  genericOperationOnNft: {
    nftAddress: string;
    functionFragment: string;
    abi: any[];
    balanceThreshold: number;
    operator: '===' | '>=' | '<=' | '<' | '>';
    chainId: number;
  };
  operationOnXNumberOfToken: {
    tokenAddress: string;
    balanceThreshold: number;
    operator: '===' | '>=' | '<=' | '<' | '>';
    chainId: number;
  };
  genericOperationOnToken: {
    tokenAddress: string;
    functionFragment: string;
    abi: any[];
    balanceThreshold: number;
    operator: '===' | '>=' | '<=' | '<' | '>';
    chainId: number;
  };
};
export type AdapterNames = keyof AdapterWithVariables;

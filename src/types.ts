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

export enum GenericAdapters {
  holdXNumberOfNft = 'holdXNumberOfNft',
  holdSpecialNft = 'holdSpecialNft',
}

export type AdapterWithVariables = {
  operationOnXNumberOfNft: {
    
      nftAddress: string;
      balanceThreshold: number;
      operator:"==="|">="|"<="|"<"|">"
      chainId: number;
    
  };
  operationOnXNumberOfToken:{
     
      tokenAddress: string;
      balanceThreshold: number;
      operator:"==="|">="|"<="|"<"|">"
      chainId: number;
    
  }
};
export type AdapterNames = keyof AdapterWithVariables;


export interface StrategyParamsType {
  contractAddress: string;
  eoa: [string];
  options: object | any;
}
export interface adapterStrategy {
  contractAddress: string;
  eoa: [string];
  options: AdapterWithVariables['contractViewAdapter'];
}
export interface CallStrategyParamsType extends StrategyParamsType {
  strategy: string;
}

export interface StrategyType {
  strategy: ({ ...args }: StrategyParamsType) => Promise<any>;
  example?: CallStrategyParamsType | null;
  about?: string;
}
export type AdapterWithVariables = {
  contractViewAdapter: {
    contractAddress: string;
    type:'erc1155'|'erc721'|'erc20'|'custom'
    operator: '===' | '>=' | '<=' | '<' | '>';
    chainId: number;
    balanceThreshold: number;
    functionFragment?: string;
    abi?: any[];
  };
};
export type AdapterNames = keyof AdapterWithVariables;

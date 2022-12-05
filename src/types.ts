export interface StrategyParamsType {
  // contractAddress: string;
  eoa: string;
  options: object | any;
}

export interface CallStrategyParamsType extends StrategyParamsType {
  strategy: string;
}

export interface StrategyType {
  strategy: ({ ...args }: StrategyParamsType) => Promise<boolean>;
  example?: CallStrategyParamsType | null;
  about?: string;
}

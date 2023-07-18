export interface StrategyParamsType {
  contractAddress: string;
  eoa: [string];
  options: object | any;
}
export interface contractAdapterStrategy {
  contractAddress: string;
  eoa: [string];
  network: 'mainnet' | 'testnet';
  options: AdapterWithVariables['contractViewAdapter'];
}
export interface discordAdapterStrategy {
  contractAddress: string;
  eoa: [string];
  network: 'mainnet' | 'testnet';
  options: AdapterWithVariables['discordAdapter'];
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
    type: 'erc1155' | 'erc721' | 'erc20' | 'custom';
    operator: '===' | '>=' | '<=' | '<' | '>';
    chainId: number;
    balanceThreshold: number;
    functionFragment?: string;
    abi?: any[];
  };
  discordAdapter: {
    type: 'isMember';
    serviceConfig: { url: string; authToken: string };
    discordUserTokens: { refreshToken: string; accessToken: string };
    guildId?: string;
    roleId?: string;
  };
};
export type AdapterNames = keyof AdapterWithVariables;

export interface StrategyParamsType {
  contractAddress: string;
  eoa: [string];
  options: object | any;
}
export type AdapterWithVariables = {
  contractAdapter: {
    contractAddress: string;
    type: 'view' | 'events' | 'across' | '88mph';
    contractType?: 'erc1155' | 'erc721' | 'erc20' | 'custom';
    chainId?: number;
    balanceThreshold?: number;
    thresholdEval?: string;
    operator?: '===' | '>=' | '<=' | '<' | '>';
    functionName?: string;
    abi?: any[];
  };
  discordAdapter: {
    type: 'isMember';
    serviceConfig: { url: string; authToken: string };
    discordUserTokens: { refreshToken: string; accessToken: string };
    guildId?: string;
    roleId?: string;
  };
  twitterAdapter: {
    type: 'like' | 'mention' | 'retweet' | 'replies';
    serviceConfig: { url: string; authToken: string };
    operator: '===' | '>=' | '<=' | '<' | '>';
    countThreshold: number;
    accountId?: string;
    followingAccountId?: string;
    dateInfo: { from: number; to: number };
  };
};
export type AdapterNames = keyof AdapterWithVariables;
export interface contractAdapterStrategy {
  contractAddress: string;
  eoa: [string];
  network: 'mainnet' | 'testnet';
  options: {
    variable: AdapterWithVariables['contractAdapter'];
    tier: number;
  };
}
export interface discordAdapterStrategy {
  contractAddress: string;
  eoa: [string];
  network: 'mainnet' | 'testnet';
  options: { variable: AdapterWithVariables['discordAdapter']; tier: number };
}
export interface twitterStrategy {
  contractAddress: string;
  eoa: [string];
  network: 'mainnet' | 'testnet';
  options: { variable: AdapterWithVariables['twitterAdapter']; tier: number };
}
export interface CallStrategyParamsType extends StrategyParamsType {
  strategy: string;
}
export interface StrategyType {
  strategy: ({ ...args }: StrategyParamsType) => Promise<any>;
  example?: CallStrategyParamsType | null;
  about?: string;
}

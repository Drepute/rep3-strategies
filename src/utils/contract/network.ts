import { NetwrokObj } from './utils/types';

export const network: NetwrokObj = {
  '1': {
    name: 'Ethereum Mainnet',
    chainId: 1,
    network: 'homestead',
    rpc:
      'https://eth-mainnet.g.alchemy.com/v2/TjxOaj0jbq-FVA2jFK2p_h_KnrooFuHg',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
  },
  '2': {
    name: 'Ethereum Mainnet',
    chainId: 1,
    network: 'homestead',
    rpc:
      'https://eth-mainnet.alchemyapi.io/v2/4bdDVB5QAaorY2UE-GBUbM2yQB3QJqzv',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
  },
  '137': {
    name: 'Matic Mainnet',
    chainId: 137,
    network: 'homestead',
    rpc:
      'https://eth-mainnet.alchemyapi.io/v2/4bdDVB5QAaorY2UE-GBUbM2yQB3QJqzv',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
  },
  '80001': {
    name: 'Mumbai Testnet',
    chainId: 80001,
    network: 'homestead',
    rpc:
      'https://eth-mainnet.alchemyapi.io/v2/4bdDVB5QAaorY2UE-GBUbM2yQB3QJqzv',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
  },
};

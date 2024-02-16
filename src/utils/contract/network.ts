import { NetworkObj } from './utils/types';

export const network: NetworkObj = {
  '1': {
    name: 'Ethereum Mainnet',
    chainId: 1,
    network: 'homestead',
    rpc:
      'https://eth-mainnet.g.alchemy.com/v2/ppadjzXPF3e1iqEu3YZaBOqW-WaXGIH1',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '137': {
    name: 'Matic Mainnet',
    chainId: 137,
    network: 'homestead',
    rpc:
      'https://polygon-mainnet.g.alchemy.com/v2/cI1PchyLH0nUYm_Io2uMjZ0BgofUVIWx',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-matic',
  },
  '80001': {
    name: 'Mumbai Testnet',
    chainId: 80001,
    network: 'homestead',
    rpc:
      'https://polygon-mumbai.g.alchemy.com/v2/eEwaiSpkH7pzEDWWoO5u77V91bk9BxOs',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '43114': {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    network: 'homestead',
    rpc:
      'https://avalanche-mainnet.infura.io/v3/ae505d933166471ba6ad5e92d7f71b00',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
};

import { NetworkObj } from './utils/contract/utils/types';

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
      'https://polygon-mumbai.g.alchemy.com/v2/8zhyGM-aq1wJ4TFspyVp-dOAQ27TWozK',
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
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '8453': {
    name: 'Base',
    chainId: 8453,
    network: 'homestead',
    rpc:
      'https://base-mainnet.g.alchemy.com/v2/1yytYM_nUZmrCZtF41mAsF_IEZ14XlWB',
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '84532': {
    name: 'Base Sepolia',
    chainId: 84532,
    network: 'homestead',
    rpc:
      'https://base-sepolia.g.alchemy.com/v2/z0SgXdIelcQZILk9nKzV2YBO8Cx-ySxu',
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '421614': {
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    network: 'homestead',
    rpc:
      'https://arb-sepolia.g.alchemy.com/v2/6Rj5aMHQ2P_6hA8dPx4ww7fkIz4ezwPw',
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '42161': {
    name: 'Arbitrum',
    chainId: 42161,
    network: 'homestead',
    rpc:
      'https://arb-mainnet.g.alchemy.com/v2/951K2Ei5ZQEAwp4zIm3Y293TXVHHQ2uO',
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '11155420': {
    name: 'OP Sepolia',
    chainId: 11155420,
    network: 'homestead',
    rpc:
      'https://opt-sepolia.g.alchemy.com/v2/K8UmbgYgJ3UxdsEzbAZBHMICiY2Eey2P',
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '10': {
    name: 'OP',
    chainId: 10,
    network: 'homestead',
    rpc:
      'https://opt-mainnet.g.alchemy.com/v2/Q7PrLR-b0kqb70AhFIVqEtmPDaYFX-KV',
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '11155111': {
    name: 'Sepolia',
    chainId: 11155111,
    network: 'homestead',
    rpc:
      'https://eth-sepolia.g.alchemy.com/v2/FJG5-gtZMg3gEM_s53uIhiiXpqY5-mXF',
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '1442': {
    name: 'Polygon zkEVM Testnet',
    chainId: 1442,
    network: 'homestead',
    rpc:
      'https://polygonzkevm-testnet.g.alchemy.com/v2/6a02FldHuZy8ttIe9XKVWGF22__P8GC5',
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
  '1101': {
    name: 'Polygon zkEvm',
    chainId: 1101,
    network: 'homestead',
    rpc:
      'https://polygonzkevm-mainnet.g.alchemy.com/v2/CKAFo_PRO7Ae0jbrayQRdF9-6r4JEXIG',
    // ,
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:
      'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai',
  },
};

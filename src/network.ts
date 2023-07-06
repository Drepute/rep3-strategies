import { NetwrokObj } from "./utils/contract/utils/types";


export const network: NetwrokObj = {
  '1': {
    name: 'Ethereum Mainnet',
    chainId: 1,
    network: 'homestead',
    rpc:
      'https://eth-mainnet.g.alchemy.com/v2/TjxOaj0jbq-FVA2jFK2p_h_KnrooFuHg',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
    subgraphV2:"https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai"
  },
  '137': {
    name: 'Matic Mainnet',
    chainId: 137,
    network: 'homestead',
    rpc:
      'https://polygon-mainnet.g.alchemy.com/v2/gBoo6ihGnSUa3ObT49K36yHG6BdtyuVo',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-matic',
    subgraphV2:"https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-matic"
  },
  '80001': {
    name: 'Mumbai Testnet',
    chainId: 80001,
    network: 'homestead',
    rpc:
      'https://polygon-mumbai.g.alchemy.com/v2/8zhyGM-aq1wJ4TFspyVp-dOAQ27TWozK',
    subgraph: 'https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-mumbai',
    subgraphV2:"https://api.thegraph.com/subgraphs/name/eth-jashan/rep3-v2-mumbai"
  },
};
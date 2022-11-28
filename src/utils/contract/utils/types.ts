export interface ContractObj {
  address: string;
  abi: any[];
  name: string;
  network: number;
}

interface NetworkInfos {
  name: string;
  chainId: number;
  network: string;
  rpc: string;
  subgraph: string;
}

export interface NetwrokObj {
  [key: string]: NetworkInfos;
}

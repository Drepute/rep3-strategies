import ContractCaller from './index';

(async () => {
  console.time('subgraphRequest');
  try {
    const contract = new ContractCaller([
      {
        address: 'string',
        abi: ['function transfer(address to, uint amount)'],
        name: 'string',
        network: 2,
      },
    ]);
    console.info(contract.contractSetup());
    console.timeEnd('subgraphRequest');
  } catch (error) {
    console.error(error);
  }
})();

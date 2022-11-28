// eslint-disable-next-line @typescript-eslint/no-var-requires

import ContractCaller from './index';

async () => {
  console.time('contract Call');
  try {
    const contract = new ContractCaller([
      {
        address: 'string',
        abi: ['function transfer(address to, uint amount)'],
        name: 'erc20',
        network: 1,
      },
    ]);
    console.info(contract.contractSetup());
    contract.executeFunctionCall('erc20', 'transfer', [
      '0x444708c5c90247355F1817855B96dD9Ce4b3742b',
      1,
    ]);
    console.timeEnd('contract Call');
  } catch (error) {
    console.error(error);
  }
};

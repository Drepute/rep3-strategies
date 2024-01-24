import ContractCaller from './index';
const { abi } = './utils/abis/erc20Abi';
(async () => {
  console.time('contract Call');
  try {
    const contract = new ContractCaller([
      {
        address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        abi,
        name: 'erc20',
        network: 1,
      },
    ]);
    contract.contractSetup();
    const result = await contract.executeFunctionCall(
      'erc20',
      'balanceOf',
      '0x565CBd65Cb3e65445AfD14169003A528C985e9C7'
    );
    //console.log(result);
    console.timeEnd('contract Call');
  } catch (error) {
    console.error(error);
  }
})();

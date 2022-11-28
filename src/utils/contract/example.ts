// eslint-disable-next-line @typescript-eslint/no-var-requires

import ActionCaller from '../../actions';
import { ActionOnType } from '../../actions/utils/type';
import ContractCaller from './index';
import { abi } from './utils/abis/erc20Abi';
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
    console.log('result', result);
    if (result.toString() >= 0) {
      const actions = new ActionCaller(
        '0xb24836d0f1441d69f4ddf0fa48de907a5751c892',
        ActionOnType.membership,
        '0x565CBd65Cb3e65445AfD14169003A528C985e9C7',
        137,
        { changingLevel: 2 }
      );
      const final = await actions.calculateActionParams();
      console.log('results', final);
    }
    console.timeEnd('contract Call');
  } catch (error) {
    console.error(error);
  }
})();

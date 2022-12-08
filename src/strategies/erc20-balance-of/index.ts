import ActionCaller from '../../actions';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';
import ContractCaller from '../../utils/contract';

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  const contract = new ContractCaller([
    {
      address: options.erc20Address,
      abi: options.abi,
      name: options.name,
      network: options.network,
    },
  ]);
  contract.contractSetup();
  console.log('params', contractAddress, eoa, options);
  const result = await contract.executeFunctionCall('erc20', 'balanceOf', eoa);
  console.log('params', result.toString());
  if (result.toString() === '0') {
    const actions = new ActionCaller(
      contractAddress,
      ActionOnType.membership,
      eoa,
      options.network,
      { changingLevel: 2 }
    );
    const final = await actions.calculateActionParams();
    return final;
  } else {
    return false;
  }
}

import ActionCallerV1 from '../../actions/v1';
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
  const result = await contract.executeFunctionCall('erc20', 'balanceOf', eoa);
  if (result.toString() === '0') {
    const actions = new ActionCallerV1(
      contractAddress,
      ActionOnType.membership,
      eoa[0],
      options.network,
      { changingLevel: 2 }
    );
    const final = await actions.calculateActionParams();
    return final;
  } else {
    return false;
  }
}

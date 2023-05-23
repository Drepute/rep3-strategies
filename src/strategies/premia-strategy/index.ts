import ActionCallerV1 from '../../actions/actionV1';
import { ActionOnType } from '../../actions/utils/type';
import { StrategyParamsType } from '../../types';

const getActionOnEOA = async (eoa: string, contractAddress: string) => {
  const actions = new ActionCallerV1(
    contractAddress,
    ActionOnType.membership,
    eoa,
    80001,
    {
      changingLevel: 1,
    }
  );
  return await actions.calculateActionParams();
};

export async function strategy({
  contractAddress,
  eoa,
  options,
}: StrategyParamsType) {
  console.log(options);
  const results = await Promise.all(
    [eoa[0]].map(async (x: string) => {
      return await getActionOnEOA(x, contractAddress);
    })
  );
  return results;
}

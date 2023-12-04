import utils from './utils/index';
import _strategies, {
  communityStrategy,
  multipleStrategies,
} from './strategies';
import {
  AdapterNames,
  AdapterWithVariables,
  CallStrategyParamsType,
} from './types';
import { ActionOnTypeV2 } from './actions/utils/type';
import ActionCallerV2 from './actions/v2';

// UTILS //
const getCurrentParams = async (
  contractAddress: string,
  eoa: string,
  network: 'mainnet' | 'testnet'
) => {
  const action = new ActionCallerV2(
    contractAddress,
    ActionOnTypeV2.currentParams,
    eoa,
    network === 'mainnet' ? 137 : 80001
  );
  return await action.calculateActionParams();
};

// STRATEGY CALLERS //
async function callStrategy({
  strategy,
  contractAddress,
  eoa,
  options,
}: CallStrategyParamsType) {
  const res: boolean = await _strategies[strategy].strategy({
    contractAddress,
    eoa,
    options,
  });
  return res;
}
// MULTIPLE STRATEGY CALLERS //
async function multipleCallStrategy<T extends AdapterNames>(
  contractAddress: string,
  eoa: [string],
  network: 'mainnet' | 'testnet',
  strategiesConfig: {
    strategy: string;
    options: {
      variable: AdapterWithVariables[T];
      tier: number;
      task_id: number;
    };
  }[]
) {
  if (
    strategiesConfig?.[0]?.strategy === 'smart-contract-strategy' &&
    strategiesConfig?.[0]?.options.variable.type === 'across'
  ) {
    const res = await _strategies[
      `${strategiesConfig?.[0]?.options.variable.type}-strategy`
    ].strategy({
      contractAddress,
      eoa,
      options: { network: network },
    });
    if (res.length > 0 && res[0]?.action) {
      const resultObj = res.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.params.upgradeTier.tier]: [
            {
              executionResult: true,
              task_id: strategiesConfig.filter(
                x => x.options.tier === cur.params.upgradeTier.tier
              )?.[0]?.options?.task_id,
            },
          ],
        }),
        {}
      );

      if (res[0].action) {
        const response = {
          tierMatrix: resultObj,
          params: { metaData: res[0].metaData, action: res[0].action },
        };
        return response;
      } else {
        return {};
      }
    } else {
      return {};
    }
  } else if (
    strategiesConfig?.[0]?.strategy === 'smart-contract-strategy' &&
    (strategiesConfig?.[0]?.options.variable.type === 'bebop' ||
      strategiesConfig?.[0]?.options.variable.type === 'bebopHalloween')
  ) {
    const res = await _strategies[
      `${strategiesConfig?.[0]?.options.variable.type}-strategy`
    ].strategy({
      contractAddress,
      eoa,
      options: strategiesConfig?.[0]?.options.variable.strategyOptions,
    });
    let results = [
      {
        executionResult: res,
        tier: strategiesConfig?.[0]?.options.tier,
        id: strategiesConfig?.[0]?.options.task_id,
        strategy: strategiesConfig?.[0]?.strategy,
      },
    ];
    results = results.filter(x => x.executionResult !== false);
    const currentParams = await getCurrentParams(
      contractAddress,
      eoa[0],
      network
    );
    const resultObj = results.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.tier]: [{ executionResult: cur.executionResult, task_id: cur.id }],
      }),
      {}
    );
    return { tierMatrix: resultObj, params: currentParams };
  } else if (
    strategiesConfig?.[0]?.strategy === 'community-strategy' &&
    communityStrategy.includes(strategiesConfig?.[0]?.options.variable.type)
  ) {
    const res = await _strategies[
      `${strategiesConfig?.[0]?.options.variable.type}-strategy`
    ].strategy({
      contractAddress,
      eoa,
      options: strategiesConfig?.[0]?.options.variable.strategyOptions,
    });
    console.log('res...', res);

    let results = [
      {
        executionResult: true,
        tier: res,
        id: strategiesConfig?.[0]?.options.task_id,
        strategy: strategiesConfig?.[0]?.strategy,
      },
    ];
    results = results.filter(x => x.executionResult !== false);
    const currentParams = await getCurrentParams(
      contractAddress,
      eoa[0],
      network
    );
    const resultObj = results.reduce(
      (acc, cur) => ({
        ...acc,
        [res]: [{ executionResult: cur.executionResult, task_id: cur.id }],
      }),
      {}
    );
    return { tierMatrix: resultObj, params: currentParams };
  } else if (
    strategiesConfig?.[0]?.strategy === 'smart-contract-strategy' &&
    strategiesConfig?.[0]?.options.variable.type === 'entangle'
  ) {
    const res = await _strategies[
      `${strategiesConfig?.[0]?.options.variable.type}-strategy`
    ].strategy({
      contractAddress,
      eoa,
      options: strategiesConfig?.[0]?.options.variable.strategyOptions,
    });
    console.log('res...', res);

    let results = [
      {
        executionResult: true,
        tier: res,
        id: strategiesConfig?.[0]?.options.task_id,
        strategy: strategiesConfig?.[0]?.strategy,
      },
    ];
    results = results.filter(x => x.executionResult !== false);
    const currentParams = await getCurrentParams(
      contractAddress,
      eoa[0],
      network
    );
    const resultObj = results.reduce(
      (acc, cur) => ({
        ...acc,
        [res]: [{ executionResult: cur.executionResult, task_id: cur.id }],
      }),
      {}
    );
    return { tierMatrix: resultObj, params: currentParams };
  } else if (
    strategiesConfig?.[0]?.strategy === 'smart-contract-strategy' &&
    strategiesConfig?.[0]?.options.variable.type === 'csv' &&
    strategiesConfig?.[0]?.options.variable.strategyOptions?.subType !==
      'trader-joe'
  ) {
    const res = await _strategies[
      `${strategiesConfig?.[0]?.options.variable.type}-strategy`
    ].strategy({
      contractAddress,
      eoa,
      options: strategiesConfig?.[0]?.options.variable.strategyOptions,
    });
    console.log(res);
    let results = [
      {
        executionResult: res,
        tier: strategiesConfig?.[0]?.options.tier,
        id: strategiesConfig?.[0]?.options.task_id,
        strategy: strategiesConfig?.[0]?.strategy,
      },
    ];
    results = results.filter(x => x.executionResult !== false);
    const currentParams = await getCurrentParams(
      contractAddress,
      eoa[0],
      network
    );
    const resultObj = results.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.tier]: [{ executionResult: cur.executionResult, task_id: cur.id }],
      }),
      {}
    );
    return { tierMatrix: resultObj, params: currentParams };
  } else if (
    strategiesConfig?.[0]?.strategy === 'smart-contract-strategy' &&
    strategiesConfig?.[0]?.options.variable.type === 'csv' &&
    strategiesConfig?.[0]?.options.variable.strategyOptions?.subType ===
      'trader-joe'
  ) {
    const res = await _strategies[
      `${strategiesConfig?.[0]?.options.variable.type}-strategy`
    ].strategy({
      contractAddress,
      eoa,
      options: strategiesConfig?.[0]?.options.variable.strategyOptions,
    });

    if (res?.executionResult) {
      let results = [
        {
          tier: res?.tier,
          executionResult: res?.executionResult,
          id: strategiesConfig.filter(x => x?.options.tier === res?.tier)[0]
            ?.options?.task_id,
          strategy: strategiesConfig?.[0]?.strategy,
        },
      ];
      results = results.filter(x => x.executionResult !== false);
      const currentParams = await getCurrentParams(
        contractAddress,
        eoa[0],
        network
      );

      const resultObj = results.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.tier]: [
            { executionResult: cur.executionResult, task_id: cur.id },
          ],
        }),
        {}
      );

      return { tierMatrix: resultObj, params: currentParams };
    } else {
      return {};
    }
  } else {
    const promiseResults = strategiesConfig.map(
      async (x: {
        strategy: string;
        options: {
          variable: AdapterWithVariables[T];
          tier: number;
          task_id: number;
        };
      }) => {
        const res: boolean = await multipleStrategies[x.strategy].strategy({
          contractAddress: contractAddress,
          eoa: eoa,
          options: x.options,
        });
        return {
          executionResult: res,
          tier: x.options.tier,
          id: x.options.task_id,
          strategy: x.strategy,
        };
      }
    );
    let results = await Promise.all(promiseResults);

    results = results.filter(x => x.executionResult !== false);
    const currentParams = await getCurrentParams(
      contractAddress,
      eoa[0],
      network
    );
    console.log(results);
    const resultObj = results.reduce(
      (acc, cur) => ({
        ...acc,
        [cur.tier]: results
          .filter(x => x.tier === cur.tier)
          .map(x => {
            return { executionResult: x.executionResult, task_id: x.id };
          }),
      }),
      {}
    );
    return {
      tierMatrix: resultObj,
      params: currentParams,
    };
  }
}

export const { subgraph } = utils;

export default {
  subgraph,
  callStrategy,
  multipleCallStrategy,
};

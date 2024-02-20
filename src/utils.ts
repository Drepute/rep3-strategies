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
import { arithmeticOperand } from './adapters/contract';

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
    strategiesConfig?.[0]?.strategy === 'community-strategy-strategy' &&
    communityStrategy.includes(strategiesConfig?.[0]?.options.variable.type) &&
    strategiesConfig?.[0]?.options?.variable?.strategyOptions?.questType !==
      'struct'
  ) {
    const res = await _strategies[
      `${strategiesConfig?.[0]?.options.variable.type}-strategy`
    ].strategy({
      contractAddress,
      eoa,
      options: strategiesConfig?.[0]?.options.variable,
    });

    let results = [
      {
        executionResult: true,
        tier: res,
        id: strategiesConfig?.filter(x => x.options?.tier === parseInt(res))[0]
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
  } else if (
    strategiesConfig?.[0]?.strategy === 'community-strategy-strategy' &&
    strategiesConfig?.[1]?.strategy === 'discord-strategy' &&
    strategiesConfig?.[0]?.options?.variable?.strategyOptions?.questType ===
      'struct'
  ) {
    const res = await _strategies[
      `${strategiesConfig?.[0]?.options.variable.type}-strategy`
    ].strategy({
      contractAddress,
      eoa,
      options: strategiesConfig?.[0]?.options.variable,
    });

    let results = [
      {
        executionResult: true,
        tier: res,
        id: strategiesConfig?.filter(x => x.options?.tier === parseInt(res))[0]
          ?.options?.task_id,
        strategy: strategiesConfig?.[0]?.strategy,
      },
    ];
    results = results.filter(x => x.executionResult !== false);
    const promiseResults = strategiesConfig
      .filter(x => x.strategy !== 'community-strategy-strategy')
      .map(
        async (x: {
          strategy: string;
          options: {
            variable: AdapterWithVariables[T];
            tier: number;
            task_id: number;
          };
        }) => {
          const res: boolean = await multipleStrategies[x.strategy].strategy(
            false,
            {
              contractAddress: contractAddress,
              eoa: eoa,
              options: x.options,
            }
          );
          return {
            executionResult: res,
            tier: x.options.tier,
            id: x.options.task_id,
            strategy: x.strategy,
          };
        }
      );
    let discordResults = await Promise.all(promiseResults);

    discordResults = discordResults.filter(x => x.executionResult !== false);
    const finalResult = discordResults.concat(results);
    // const resultObj = finalResult.reduce(
    //   (acc, cur) => ({
    //     ...acc,
    //     [cur.tier]: results
    //       .filter(x => x.tier === cur.tier)
    //       .map(x => {
    //         return { executionResult: x.executionResult, task_id: x.id };
    //       }),
    //   }),
    //   {}
    // );
    console.log('hereeeeeee!!!!!', finalResult);
    const currentParams = await getCurrentParams(
      contractAddress,
      eoa[0],
      network
    );
    console.log('strategy length', {
      tierMatrix: finalResult?.map(x => {
        return { executionResult: x?.executionResult, task_id: x?.id };
      }),
      params: currentParams,
    });
    return {
      tierMatrix: finalResult?.map(x => {
        return { executionResult: x?.executionResult, task_id: x?.id };
      }),
      params: currentParams,
    };
  } else {
    console.log('strategy length', strategiesConfig.length);
    const promiseResults = strategiesConfig.map(
      async (x: {
        strategy: string;
        options: {
          variable: AdapterWithVariables[T];
          tier: number;
          task_id: number;
        };
      }) => {
        const res: boolean = await multipleStrategies[x.strategy].strategy(
          false,
          {
            contractAddress: contractAddress,
            eoa: eoa,
            options: x.options,
          }
        );
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
const getKeyForConfig = (obj: any) => {
  switch (obj.strategy) {
    case 'twitter-strategy':
      return `${obj.strategy}-${obj.options?.variable?.type}-${
        obj?.options?.variable?.followingAccountId
      }-${obj?.options?.variable?.accountId}-${
        obj?.options?.variable?.dateInfo?.from
      }${obj?.options?.variable?.dateInfo?.to || ''}`;
    case 'smart-contract-strategy':
      if (obj.options?.variable?.type === 'view') {
        return `${obj.strategy}-${obj.options?.variable?.type}-${
          obj.options?.variable?.contractType
        }-${obj.options?.variable?.contractAddress}-${
          obj.options?.variable?.chainId
        }-${obj?.options?.variable?.functionName || ''}-${obj?.options?.variable
          ?.functionParam || ''}`;
      } else {
        return 'null';
      }
    default:
      return 'null';
  }
};
const getOperandValueOnStrategy = (obj: any, strategyCompareValue: number) => {
  switch (obj.strategy) {
    case 'twitter-strategy':
      return arithmeticOperand(
        strategyCompareValue,
        obj?.options?.variable?.countThreshold,
        obj?.options?.variable?.operator
      );
    case 'smart-contract-strategy':
      if (obj.options?.variable?.type === 'view') {
        return arithmeticOperand(
          strategyCompareValue,
          obj?.options?.variable?.balanceThreshold,
          obj?.options?.variable?.operator
        );
      } else {
        return 'null';
      }
    default:
      return 'null';
  }
};
async function multipleBatchCallStrategy(batchObj: any) {
  let key: string;
  let value: any;
  const executionObj = {};
  for ([key, value] of Object.entries(batchObj)) {
    let executionArrayResult: any = [];
    const communityStrategy = value.filter(
      x => x.strategy === 'community-strategy-strategy'
    );
    const templateStrategy = value.filter(
      x =>
        x.strategy === 'twitter-strategy' ||
        x.strategy === 'smart-contract-strategy'
    );
    const csvStrategy = value.filter(
      x => x.strategy === 'csv-strategy' || x.strategy === 'discord-strategy'
    );

    if (communityStrategy.length > 0) {
      console.log('started !!!');
      const res = await _strategies[
        `${communityStrategy?.[0]?.options.variable.type}-strategy`
      ].strategy({
        contractAddress: 'contractAddress',
        eoa: [key],
        options: communityStrategy?.[0]?.options.variable,
      });
      console.log('response community', res);

      for (let i = 1; i <= res; i++) {
        executionArrayResult.push({
          executionResult: true,
          tier: i,
          id: communityStrategy.filter(x => x.options.tier === i)?.[0]?.options
            ?.task_id,
          strategy: 'community-strategy-strategy',
        });
      }
    }
    if (csvStrategy.length > 0) {
      const promiseResults = csvStrategy.map(async (x: any) => {
        const res: boolean = await multipleStrategies[x.strategy].strategy({
          contractAddress: 'contractAddress',
          eoa: [key],
          options: x.options,
        });

        return {
          executionResult: res,
          tier: x.options.tier,
          id: x.options.task_id,
          strategy: x.strategy,
        };
      });
      const result = await Promise.all(promiseResults);
      executionArrayResult = executionArrayResult.concat(result);
    }
    if (templateStrategy.length > 0) {
      const resultObject = templateStrategy.reduce((acc, obj) => {
        const key = getKeyForConfig(obj);
        acc[key] = acc[key] || [];
        acc[key].push(obj);
        return acc;
      }, {});
      let configKeys: string;
      let configValue: any;

      for ([configKeys, configValue] of Object.entries(resultObject)) {
        const strategyCompareValue = await multipleStrategies[
          configValue[0].strategy
        ].strategy(true, {
          contractAddress: 'contractAddress',
          eoa: [key],
          options: configValue[0].options,
        });
        const executionArray = configValue.map(x => {
          return {
            executionResult: getOperandValueOnStrategy(x, strategyCompareValue),
            tier: x?.options?.tier,
            id: x?.options?.task_id,
            strategy: x?.strategy,
          };
        });
        executionArrayResult = executionArrayResult.concat(executionArray);
      }
    }
    executionObj[key] = executionArrayResult;
  }
  return executionObj;
}

export const { subgraph } = utils;

export default {
  subgraph,
  callStrategy,
  multipleCallStrategy,
  multipleBatchCallStrategy,
};

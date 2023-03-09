import { readFileSync } from 'fs';
import path from 'path';

import { StrategyType } from '../types';
import * as rep3IsMember from './rep3/rep3-is-member';
import * as erc20BalanceOf from './erc20-balance-of';
import * as cultGov from './cult-strategy';
import * as rep3BadgeExpiry from './rep3/rep3-badge-expiry';

const strategies: Record<string, StrategyType> = {
  'rep3-is-member': rep3IsMember,
  'erc-20-balance-of': erc20BalanceOf,
  'cult-gov': cultGov,
  'rep3-badge-expiry': rep3BadgeExpiry,
};

Object.keys(strategies).forEach(function(strategyName) {
  let example = null;
  let about = '';

  try {
    example = JSON.parse(
      readFileSync(path.join(__dirname, strategyName, 'example.json'), 'utf8')
    );
  } catch (error) {
    example = null;
  }

  try {
    about = readFileSync(
      path.join(__dirname, strategyName, 'README.md'),
      'utf8'
    );
  } catch (error) {
    about = '';
  }

  strategies[strategyName].example = example;
  strategies[strategyName].about = about;
});

export default strategies;

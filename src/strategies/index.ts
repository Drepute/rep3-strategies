import { readFileSync } from 'fs';
import path from 'path';

import { StrategyType } from '../types';
import * as rep3IsMember from './rep3-is-member';

const strategies: Record<string, StrategyType> = {
  'rep3-is-member': rep3IsMember,
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

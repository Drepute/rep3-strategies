import { readFileSync } from 'fs';
import path from 'path';

import { StrategyType } from '../types';
import * as rep3IsMember from './community-strategy/v1/rep3-platform/rep3-is-member';
import * as erc20BalanceOf from './community-strategy/v1/erc20-balance-of';
import * as cultGov from './community-strategy/v1/cult-strategy';
import * as readyPlayerDao from './community-strategy/v1/ready-player-dao';
import * as rep3BadgeExpiry from './community-strategy/v1/rep3-platform/rep3-badge-expiry';
import * as rep3BulkMembershipUri from './community-strategy/v1/rep3-platform/membership-bulk-update';
import * as acrossStrategy from './community-strategy/v2/across-strategy';
import * as premiaStrategy from './community-strategy/v1/premia-strategy';
import * as contractStrategy from './contract-strategy';
import * as discordStrategy from './discord-strategy';
import * as twitterStrategy from './twitter-strategy';

const strategies: Record<string, StrategyType> = {
  'rep3-is-member': rep3IsMember,
  'erc-20-balance-of': erc20BalanceOf,
  'cult-gov': cultGov,
  'rep3-badge-expiry': rep3BadgeExpiry,
  'rep3-bulk-membership-uri': rep3BulkMembershipUri,
  'ready-player-dao': readyPlayerDao,
  'across-strategy': acrossStrategy,
  'premia-strategy': premiaStrategy,
};

const multipleStrategies: Record<string, any> = {
  'smart-contract-strategy': contractStrategy,
  'discord-strategy': discordStrategy,
  'twitter-strategy': twitterStrategy,
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

export { multipleStrategies };
export default strategies;

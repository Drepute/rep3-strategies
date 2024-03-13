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
import * as bebopStrategy from './community-strategy/v2/bebop-strategy';
import * as bebopHalloweenStrategy from './community-strategy/v2/bebop-haloween-strategy';
import * as entangleStrategy from './community-strategy/v2/entangle-strategy';
import * as traderJoeStrategy from './community-strategy/v2/traderJoe-strategy';
import * as premiaStrategy from './community-strategy/v1/premia-strategy';
import * as notumStrategy from './community-strategy/v2/notum-strategy';
import * as avaxStrategy from './community-strategy/v2/avax-strategy';
import * as hoverStrategy from './community-strategy/v2/hover-strategy';
import * as matchStrategy from './community-strategy/v2/matcha-strategy';
import * as contractStrategy from './contract-strategy';
import * as discordStrategy from './discord-strategy';
import * as twitterStrategy from './twitter-strategy';
import * as csvStrategy from './csv-strategy';
//convert it to uuid mapping;
const strategies: Record<string, StrategyType> = {
  'rep3-is-member': rep3IsMember,
  'erc-20-balance-of': erc20BalanceOf,
  'cult-gov': cultGov,
  'rep3-badge-expiry': rep3BadgeExpiry,
  'rep3-bulk-membership-uri': rep3BulkMembershipUri,
  'ready-player-dao': readyPlayerDao,
  'across-strategy': acrossStrategy,
  'premia-strategy': premiaStrategy,
  'bebop-strategy': bebopStrategy,
  'bebopHalloween-strategy': bebopHalloweenStrategy,
  'entangle-strategy': entangleStrategy,
  'rich peon, poor peon-strategy': traderJoeStrategy,
  'notum-strategy': notumStrategy,
  'avalanche-strategy': avaxStrategy,
  'hover-strategy': hoverStrategy,
  'matcha-strategy': matchStrategy,
};

const multipleStrategies: Record<string, any> = {
  'smart-contract-strategy': contractStrategy,
  'discord-strategy': discordStrategy,
  'twitter-strategy': twitterStrategy,
  'csv-strategy': csvStrategy,
  'community-strategy': contractStrategy,
};
export const communityEnabledStrategy = [
  'entangle',
  'bebop',
  'rich peon, poor peon',
  'notum',
  'avalanche',
  'hover',
  'bebopHalloween',
  'matcha',
];
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

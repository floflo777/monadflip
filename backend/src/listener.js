import { ethers } from 'ethers';
import config from './config.js';
import { updateStats, addRecentGame, addReferralReward } from './stats.js';

let provider;
let contract;
let lastBlockProcessed = 0;
let isPolling = false;
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 5;

export async function startListener() {
  console.log('Connecting to Monad RPC...');
  
  provider = new ethers.JsonRpcProvider(config.rpcUrl, undefined, {
    staticNetwork: true,
    batchMaxCount: 1
  });
  
  try {
    const network = await provider.getNetwork();
    const currentBlock = await provider.getBlockNumber();
    lastBlockProcessed = currentBlock;
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);
    console.log(`Current block: ${currentBlock}`);
  } catch (error) {
    console.error('Failed to connect to RPC:', error.message);
    process.exit(1);
  }

  contract = new ethers.Contract(
    config.contractAddress,
    config.contractABI,
    provider
  );

  console.log(`Listening to contract: ${config.contractAddress}`);
  console.log('Using polling mode with rate limit protection');

  setTimeout(() => pollEvents(), 2000);
  setInterval(pollEvents, 15000);

  console.log('Event polling started (15s interval)');
}

async function pollEvents() {
  if (isPolling) {
    console.log('Poll already in progress, skipping...');
    return;
  }

  isPolling = true;

  try {
    const currentBlock = await provider.getBlockNumber();
    
    if (currentBlock <= lastBlockProcessed) {
      isPolling = false;
      return;
    }

    const fromBlock = lastBlockProcessed + 1;
    const maxBlockRange = 100;
    const toBlock = Math.min(currentBlock, fromBlock + maxBlockRange);

    await new Promise(resolve => setTimeout(resolve, 500));

    const filterResolved = contract.filters.GameResolved();
    const eventsResolved = await contract.queryFilter(filterResolved, fromBlock, toBlock);

    for (const event of eventsResolved) {
      await handleGameResolved(event);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const filterReferral = contract.filters.ReferralReward();
    const eventsReferral = await contract.queryFilter(filterReferral, fromBlock, toBlock);

    for (const event of eventsReferral) {
      await handleReferralReward(event);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    lastBlockProcessed = toBlock;

    if (eventsResolved.length > 0 || eventsReferral.length > 0) {
      console.log(`Processed blocks ${fromBlock}-${toBlock}: ${eventsResolved.length} games, ${eventsReferral.length} referrals`);
    }

    consecutiveErrors = 0;
  } catch (error) {
    consecutiveErrors++;
    
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      console.warn(`Rate limit hit (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}), backing off...`);
      const backoffTime = Math.min(30000, 5000 * Math.pow(2, consecutiveErrors - 1));
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    } else {
      console.error('Error polling events:', error.message);
    }

    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.error('Too many consecutive errors, pausing for 60 seconds...');
      await new Promise(resolve => setTimeout(resolve, 60000));
      consecutiveErrors = 0;
    }
  } finally {
    isPolling = false;
  }
}

async function handleGameResolved(event) {
  try {
    const [gameId, winner, result, payout] = event.args;
    
    console.log(`Game ${gameId} resolved - Winner: ${winner.slice(0, 8)}...`);

    const block = await event.getBlock();

    const payoutNum = parseFloat(ethers.formatEther(payout));
    const betAmount = ethers.parseEther((payoutNum / 1.985).toFixed(18));

    const gameData = {
      gameId,
      winner,
      betAmount,
      payout,
      result,
      txHash: event.transactionHash,
      timestamp: block.timestamp
    };

    updateStats(gameData);
    addRecentGame(gameData);
  } catch (error) {
    console.error('Error processing GameResolved:', error);
  }
}

async function handleReferralReward(event) {
  try {
    const [referrer, amount, gameId] = event.args;
    
    console.log(`Referral reward: ${ethers.formatEther(amount)} MON to ${referrer.slice(0, 8)}...`);

    const block = await event.getBlock();

    const rewardData = {
      referrer,
      amount,
      gameId,
      txHash: event.transactionHash,
      timestamp: block.timestamp
    };

    addReferralReward(rewardData);
  } catch (error) {
    console.error('Error processing ReferralReward:', error);
  }
}

export function getProvider() {
  return provider;
}

export function getContract() {
  return contract;
}
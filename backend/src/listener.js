import { ethers } from 'ethers';
import config from './config.js';
import { updateStats, addRecentGame, addReferralReward } from './stats.js';

let provider;
let contract;
let lastBlockProcessed = 0;

export async function startListener() {
  console.log('Connecting to Monad RPC...');
  
  provider = new ethers.JsonRpcProvider(config.rpcUrl);
  
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
  console.log('Using polling mode (RPC does not support eth_newFilter)');

  pollEvents();
  setInterval(pollEvents, 3000);

  console.log('Event polling started');
}

async function pollEvents() {
  try {
    const currentBlock = await provider.getBlockNumber();
    
    if (currentBlock <= lastBlockProcessed) {
      return;
    }

    const fromBlock = lastBlockProcessed + 1;
    const toBlock = currentBlock;

    const filterResolved = contract.filters.GameResolved();
    const eventsResolved = await contract.queryFilter(filterResolved, fromBlock, toBlock);

    for (const event of eventsResolved) {
      await handleGameResolved(event);
    }

    const filterReferral = contract.filters.ReferralReward();
    const eventsReferral = await contract.queryFilter(filterReferral, fromBlock, toBlock);

    for (const event of eventsReferral) {
      await handleReferralReward(event);
    }

    lastBlockProcessed = currentBlock;

    if (eventsResolved.length > 0 || eventsReferral.length > 0) {
      console.log(`Processed blocks ${fromBlock}-${toBlock}: ${eventsResolved.length} games, ${eventsReferral.length} referrals`);
    }
  } catch (error) {
    console.error('Error polling events:', error.message);
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
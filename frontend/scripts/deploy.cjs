const hre = require("hardhat");

async function main() {
  console.log("Deploying CoinFlip contract...");

  const CoinFlip = await hre.ethers.getContractFactory("CoinFlip");
  const coinflip = await CoinFlip.deploy();

  await coinflip.waitForDeployment();

  const address = await coinflip.getAddress();
  
  console.log(`CoinFlip deployed to: ${address}`);
  console.log(`Owner: ${await coinflip.owner()}`);
  
  // Attendre quelques blocks pour la vérification
  console.log("Waiting for block confirmations...");
  await coinflip.deploymentTransaction().wait(5);
  
  console.log("Deployment complete!");
  console.log("\nUpdate your .env files with:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
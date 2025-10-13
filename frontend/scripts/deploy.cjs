const hre = require("hardhat");

async function main() {
  console.log("Deploying CoinFlip contract...");

  const CoinFlip = await hre.ethers.getContractFactory("CoinFlip");
  const coinflip = await CoinFlip.deploy();

  await coinflip.waitForDeployment();

  const address = await coinflip.getAddress();
  console.log("CoinFlip deployed to:", address);
  console.log("\nAdd this to your .env file:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

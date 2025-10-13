require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    monad: {
      url: process.env.MONAD_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: parseInt(process.env.CHAIN_ID)
    }
  }
};

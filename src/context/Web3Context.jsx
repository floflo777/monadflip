import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, MONAD_CHAIN_ID } from '../utils/constants';
import CoinFlipABI from '../utils/CoinFlipABI.json';
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [chainId, setChainId] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      // DEBUG LOGS DÉSACTIVÉS POUR ÉVITER RATE LIMIT
      // console.log('========== NETWORK DEBUG ==========');
      // console.log('Connected Chain ID:', Number(network.chainId));
      // console.log('Expected Chain ID:', MONAD_CHAIN_ID);
      // console.log('Contract Address:', CONTRACT_ADDRESS);
      // console.log('Account:', accounts[0]);
      // console.log('===================================');
      
      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setChainId(Number(network.chainId));

      const coinflipContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CoinFlipABI,
        signer
      );
      setContract(coinflipContract);

      if (Number(network.chainId) !== MONAD_CHAIN_ID) {
        toast.error(`Wrong network! Please switch to Monad Testnet`);
      } else {
        toast.success('Connected to Monad Testnet!');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${MONAD_CHAIN_ID.toString(16)}` }]
      });
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error('Failed to switch network');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setContract(null);
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const value = {
    account,
    provider,
    signer,
    contract,
    chainId,
    connectWallet,
    switchNetwork
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
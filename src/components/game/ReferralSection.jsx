import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export default function ReferralSection() {
  const { contract, account } = useWeb3();
  const [earnings, setEarnings] = useState('0');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, [account, contract]);

  const loadEarnings = async () => {
    if (!contract || !account) return;

    try {
      const amount = await contract.referralEarnings(account);
      setEarnings(ethers.formatEther(amount));
    } catch (error) {
      console.error('Load earnings error:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!contract) return;

    const toastId = toast.loading('⟳ Withdrawing earnings...');

    try {
      const tx = await contract.withdrawReferralEarnings();
      toast.loading('⟳ Transaction pending...', { id: toastId });
      await tx.wait();
      toast.success('✨ Earnings withdrawn!', { id: toastId });
      loadEarnings();
    } catch (error) {
      console.error('Withdraw error:', error);
      toast.error(`⚠ ${error.reason || 'Failed to withdraw'}`, { id: toastId });
    }
  };

  const copyReferralLink = () => {
    if (!account) return;

    const link = `${window.location.origin}?ref=${account}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('📋 Referral link copied!');

    setTimeout(() => setCopied(false), 2000);
  };

  if (!account) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-xl font-bold text-primary mb-4"> Share & Earn</h3>

      <div className="bg-accent/10 rounded-lg p-4 mb-4 border border-accent/20">
        <p className="text-sm text-primary font-semibold mb-2">Your Earnings</p>
        <p className="text-3xl font-bold text-primary mb-3">
          {parseFloat(earnings).toFixed(4)} MON
        </p>

        {parseFloat(earnings) > 0 && (
          <button
            onClick={handleWithdraw}
            className="w-full bg-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition"
          >
            Withdraw Earnings
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-600 mb-2">Your referral link:</p>
        <div className="bg-gray-100 rounded-lg p-3 text-xs break-all text-primary font-mono">
          {window.location.origin}?ref={account.slice(0, 10)}...
        </div>
      </div>

      <button
        onClick={copyReferralLink}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition flex items-center justify-center gap-2"
      >
        <span>📋</span>
        {copied ? 'Link Copied!' : 'Copy Referral Link'}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Earn 50% of fees (0.05%) when someone uses your link
      </p>
    </div>
  );
}
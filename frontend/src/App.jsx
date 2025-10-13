import React, { useEffect } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtocolStats from './components/protocol/ProtocolStats';
import GameList from './components/game/GameList';
import CreateGameModal from './components/game/CreateGameModal';
import ReferralSection from './components/game/ReferralSection';
import GameHistory from './components/game/GameHistory';
import LiveActivity from './components/activity/LiveActivity';
import CoinFlipAnimation from './components/animations/CoinFlipAnimation';
import CustomToaster from './components/ui/Toast';
import { useGameStore } from './hooks/useGameStore';
import { useGames } from './hooks/useGames';
import { useGameHistory } from './hooks/useGameHistory';
import { checkUrlReferral } from './utils/referral';

function AppContent() {
  const { showCreateModal, showAnimation, flipResult, resultMessage } = useGameStore();
  const { contract, account, provider } = useWeb3();
  const { loadGames, loadMyGames } = useGames();
  
  useGameHistory(contract, account);

  useEffect(() => {
    checkUrlReferral();
  }, []);

  useEffect(() => {
    if (contract || provider?.contract) {
      loadGames();
      loadMyGames();
    }
  }, [contract, provider, loadGames, loadMyGames]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <ProtocolStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GameList />
          </div>
          
          <div className="space-y-6">
            <LiveActivity />
            <ReferralSection />
            <GameHistory />
          </div>
        </div>
      </main>

      <Footer />

      {showCreateModal && <CreateGameModal />}
      
      {showAnimation && flipResult && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <CoinFlipAnimation flipResult={flipResult} />
          <h2 className="mt-8 text-4xl font-bold text-white drop-shadow-lg">
            {resultMessage}
          </h2>
        </div>
      )}

      <CustomToaster />
    </div>
  );
}

function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

export default App;
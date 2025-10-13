import React, { useEffect } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Ticker from './components/layout/Ticker';
import HeroSection from './components/layout/HeroSection';
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
      if (account) {
        loadMyGames();
      }
    }
  }, [contract, provider?.contract, account]);

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Header />
      <Ticker />
      
      <main className="container mx-auto px-4 flex-1">
        <HeroSection />
        
        <ProtocolStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <GameList />
          </div>
          
          <div className="space-y-6">
            <LiveActivity />
            <ReferralSection />
            <GameHistory />
          </div>
        </div>

        {/* How it works section */}
        <section id="how-it-works" className="mt-20 mb-12">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 text-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">1</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Create or Join</h3>
                <p className="text-gray-400 text-sm">
                  Create a new game with your bet amount, or join an existing one
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">2</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Flip the Coin</h3>
                <p className="text-gray-400 text-sm">
                  When someone joins, the smart contract flips the coin using blockchain randomness
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">3</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Win or Lose</h3>
                <p className="text-gray-400 text-sm">
                  Winner gets 1.985x their bet instantly. No delays, 100% on-chain
                </p>
              </div>
            </div>
          </div>
        </section>
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
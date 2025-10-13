import { create } from 'zustand';

export const useGameStore = create((set) => ({
  games: [],
  myGames: [],
  showCreateModal: false,
  showAnimation: false,
  flipResult: null,
  resultMessage: '',
  loading: false,

  setGames: (games) => set({ games }),
  setMyGames: (myGames) => set({ myGames }),
  setShowCreateModal: (show) => set({ showCreateModal: show }),
  setShowAnimation: (show) => set({ showAnimation: show }),
  setFlipResult: (result) => set({ flipResult: result }),
  setResultMessage: (message) => set({ resultMessage: message }),
  setLoading: (loading) => set({ loading })
}));

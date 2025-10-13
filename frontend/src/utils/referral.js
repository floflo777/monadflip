const REFERRAL_KEY = 'coinflip_referral';
const REFERRAL_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 jours

export const saveReferral = (address) => {
  if (!address || address === '0x0000000000000000000000000000000000000000') return;
  
  const data = {
    address,
    timestamp: Date.now()
  };
  
  localStorage.setItem(REFERRAL_KEY, JSON.stringify(data));
};

export const getReferral = () => {
  try {
    const stored = localStorage.getItem(REFERRAL_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    const age = Date.now() - data.timestamp;
    
    if (age > REFERRAL_EXPIRY) {
      localStorage.removeItem(REFERRAL_KEY);
      return null;
    }
    
    return data.address;
  } catch {
    return null;
  }
};

export const clearReferral = () => {
  localStorage.removeItem(REFERRAL_KEY);
};

export const checkUrlReferral = () => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  
  if (ref && ref.startsWith('0x')) {
    saveReferral(ref);
    window.history.replaceState({}, '', window.location.pathname);
  }
};
export const shortAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTimeLeft = (expirationTime) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = expirationTime - now;

  if (timeLeft <= 0) return 'Expired';

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatAmount = (amount) => {
  const num = parseFloat(amount);
  if (num >= 1) return num.toFixed(3);
  return num.toString();
};

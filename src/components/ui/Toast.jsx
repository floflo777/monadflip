import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#14044d',
          color: '#fff',
          borderRadius: '12px',
          border: '1px solid #4FD1C5',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
        },
        success: {
          iconTheme: {
            primary: '#4FD1C5',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #4FD1C5',
          },
        },
        error: {
          iconTheme: {
            primary: '#FFB84D',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #FFB84D',
          },
        },
        loading: {
          iconTheme: {
            primary: '#4FD1C5',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

export const showWinToast = (amount) => {
  return {
    icon: '✨',
    duration: 6000,
    style: {
      background: 'linear-gradient(135deg, #4FD1C5 0%, #37367b 100%)',
    },
  };
};

export const showLossToast = () => {
  return {
    icon: '◐',
    duration: 4000,
    style: {
      background: '#37367b',
      opacity: 0.9,
    },
  };
};
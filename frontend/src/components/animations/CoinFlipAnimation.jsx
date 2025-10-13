import React, { useState, useEffect } from 'react';

export default function CoinFlipAnimation({ flipResult }) {
  const [rotation, setRotation] = useState(0);
  const [isFlipping, setIsFlipping] = useState(true);

  useEffect(() => {
    setRotation(0);
    setIsFlipping(true);

    const targetRotation = flipResult.startsWith('heads') ? 720 : 900;
    
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentRotation = targetRotation * easeOutCubic;
      
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsFlipping(false);
      }
    };

    requestAnimationFrame(animate);
  }, [flipResult]);

  return (
    <div className="w-80 h-80 flex items-center justify-center relative">
      <div 
        className="relative w-64 h-64"
        style={{
          transform: `rotateY(${rotation}deg)`,
          transformStyle: 'preserve-3d',
          transition: isFlipping ? 'none' : 'transform 0.6s ease-out'
        }}
      >
        {/* Heads - Baleine */}
        <div
          className="absolute inset-0 rounded-full shadow-2xl flex items-center justify-center overflow-hidden bg-white"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)'
          }}
        >
          <img 
            src="/heads.png"
            alt="Heads"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Tails - Dollar */}
        <div
          className="absolute inset-0 rounded-full shadow-2xl flex items-center justify-center overflow-hidden bg-white"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <img 
            src="/tails.png"
            alt="Tails"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {!isFlipping && (
        <div className="absolute bottom-8 text-3xl font-bold text-white animate-fadeIn">
          {flipResult.startsWith('heads') ? 'HEADS 🐋' : 'TAILS 💰'}
        </div>
      )}
    </div>
  );
}
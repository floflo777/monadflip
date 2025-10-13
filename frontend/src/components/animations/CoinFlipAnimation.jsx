import React, { useState, useEffect } from 'react';

export default function CoinFlipAnimation({ flipResult }) {
  const [rotation, setRotation] = useState(0);
  const [isFlipping, setIsFlipping] = useState(true);

  useEffect(() => {
    setRotation(0);
    setIsFlipping(true);

    const targetRotation = flipResult.startsWith('heads') ? 720 : 900;
    
    const duration = 2500;
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

  const imageRotation = isFlipping ? 180 : 0;

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
        <div
          className="absolute inset-0 rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
            background: 'linear-gradient(135deg, #4FD1C5 0%, #38B2AC 100%)',
            border: '8px solid #2C7A7B'
          }}
        >
          <div 
            className="text-9xl font-bold text-white transition-transform duration-600"
            style={{ transform: `rotate(${imageRotation}deg)` }}
          >
            🐋
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            border: '8px solid #CC8400'
          }}
        >
          <div 
            className="text-9xl font-bold text-white transition-transform duration-600" 
            style={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              transform: `rotate(${imageRotation}deg)`
            }}
          >
            $
          </div>
        </div>
      </div>

      {!isFlipping && (
        <div 
          className="absolute bottom-8 text-5xl font-bold animate-fadeIn"
          style={{ 
            color: '#FFD700',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)'
          }}
        >
          {flipResult.startsWith('heads') ? 'HEADS' : 'TAILS'}
        </div>
      )}
    </div>
  );
}
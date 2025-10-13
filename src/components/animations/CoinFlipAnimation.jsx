import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Coin({ flipResult }) {
  const coinRef = useRef();
  const angleRef = useRef(0);

  useEffect(() => {
    angleRef.current = 0;
  }, [flipResult]);

  useFrame(() => {
    if (angleRef.current < Math.PI * 4) {
      angleRef.current += 0.2;
      if (coinRef.current) {
        coinRef.current.rotation.x = -Math.PI / 2 + angleRef.current;
      }
    } else {
      if (coinRef.current) {
        coinRef.current.rotation.x = -Math.PI / 2 + (flipResult.startsWith('heads') ? 0 : Math.PI);
      }
    }
  });

  return (
    <mesh ref={coinRef} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1.5, 1.5]}>
      <cylinderGeometry args={[1, 1, 0.1, 32]} />
      <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function CoinFlipAnimation({ flipResult }) {
  return (
    <div className="w-80 h-80">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Coin flipResult={flipResult} />
      </Canvas>
    </div>
  );
}
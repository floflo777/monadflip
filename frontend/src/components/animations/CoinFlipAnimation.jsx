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
    <group>
      <mesh ref={coinRef} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1.5, 1.5]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 0.15, 64]} />
        <meshPhysicalMaterial
          color="#FFD700"
          metalness={1.0}
          roughness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={1.0}
          envMapIntensity={2}
        />
      </mesh>
    </group>
  );
}

export default function CoinFlipAnimation({ flipResult }) {
  return (
    <div className="w-80 h-80">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
      >
        <color attach="background" args={['#000000']} />
        
        <ambientLight intensity={0.3} />
        
        <spotLight
          position={[5, 5, 5]}
          angle={0.3}
          penumbra={0.5}
          intensity={2}
          castShadow
          color="#ffffff"
        />
        
        <spotLight
          position={[-5, 5, 5]}
          angle={0.3}
          penumbra={0.5}
          intensity={1.5}
          color="#ffffaa"
        />
        
        <pointLight position={[0, -3, 3]} intensity={1} color="#ffaa00" />
        
        <directionalLight
          position={[0, 10, 0]}
          intensity={1.5}
          color="#ffffff"
        />
        
        <Coin flipResult={flipResult} />
      </Canvas>
    </div>
  );
}
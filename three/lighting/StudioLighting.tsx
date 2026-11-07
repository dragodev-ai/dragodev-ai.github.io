'use client';

import React from 'react';

export function StudioLighting() {
  return (
    <>
      {/* Subtle room base fill */}
      <ambientLight intensity={0.42} color="#d8d4e8" />
      <hemisphereLight args={['#e2d9f3', '#121018', 0.48]} />

      {/* Warm Amber Studio Key / Practical Softbox Light (Front-Left) */}
      <spotLight
        position={[-2.15, 2.55, 2.45]}
        angle={0.58}
        penumbra={0.75}
        intensity={9.5}
        distance={9}
        color="#ffcf96"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0004}
      />

      {/* Clean Neutral Front Face Fill so Dev's eyes, moustache & blazer lapels read clearly */}
      <directionalLight position={[1.4, 2.0, 3.1]} intensity={1.35} color="#f5f3ff" />

      {/* Controlled Violet / Magenta Rim Light from Rear-Right Studio Tube */}
      <pointLight position={[2.2, 1.85, -1.1]} intensity={5.2} distance={6.5} color="#9333ea" />

      {/* Warm Desk Practical Lamp Glow */}
      <pointLight position={[-1.25, 1.38, -0.55]} intensity={3.4} distance={4.2} color="#f59e0b" />

      {/* Subtle Cyan/Cool Monitor Screen Bounce onto Desk */}
      <pointLight position={[0.0, 1.28, -0.65]} intensity={1.8} distance={3.2} color="#818cf8" />
    </>
  );
}

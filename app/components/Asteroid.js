'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Replace this with actual SVG paths
const asteroidSvgs = [
  '/asteroid1.svg',
  '/asteroid2.svg',
  '/asteroid3.svg',
  '/asteroid4.svg'
];

function getRandomAsteroid(spawnOnScreen = false) {
  const size = Math.random() * 15 + 25; // 10–40px
  const speed = Math.random() * 15 + 10; // 10–25s
  const rotationSpeed = (Math.random() - 0.5) * 60; // -30 to +30 deg/s
  const top = `${Math.random() * 100}%`;
  const delay = spawnOnScreen ? 0 : Math.random(); // No delay for initial burst

  return {
    id: Math.random().toString(36).substr(2, 9),
    svg: asteroidSvgs[Math.floor(Math.random() * asteroidSvgs.length)],
    size,
    speed,
    rotationSpeed,
    top,
    delay,
    spawnOnScreen,
  };
}

function Asteroid({ data, onClick }) {
  const [exploded, setExploded] = useState(false);

  const handleClick = () => {
    setExploded(true);
    setTimeout(() => onClick(data.id), 100);
  };

  return (
    <motion.img
      src={data.svg}
      alt="asteroid"
      onClick={handleClick}
      initial={{
        x: data.spawnOnScreen ? `${Math.random() * 100}vw` : '-10vw',
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        x: '110vw',
        rotate: 360 * (data.speed / 10) * (data.rotationSpeed / 60),
      }}
      transition={{
        x: { duration: data.speed, ease: 'linear', delay: data.delay },
        rotate: { duration: data.speed, ease: 'linear', delay: data.delay },
      }}
      exit={{ scale: 2, opacity: 0 }}
      className="absolute"
      style={{
        top: data.top,
        width: `${data.size}px`,
        height: `${data.size}px`,
        cursor: 'pointer',
        pointerEvents: exploded ? 'none' : 'auto',
      }}
    />
  );
}

export default function AsteroidField({ onClick }) {
  const [asteroids, setAsteroids] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    // Initial burst on screen
    const initialBurst = Array.from({ length: 7 }, () => getRandomAsteroid(true));
    setAsteroids(initialBurst);

    // Continuous spawn
    const spawnInterval = setInterval(() => {
      setAsteroids((prev) => {
        if (prev.length >= 15) {
          const [, ...rest] = prev;
          return [...rest, getRandomAsteroid()];
        }
        return [...prev, getRandomAsteroid()];
      });
    }, 1800);

    return () => clearInterval(spawnInterval);
  }, []);

  const handleRemove = (id) => {
    setAsteroids((prev) => prev.filter((a) => a.id !== id));
    if (onClick) onClick();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <AnimatePresence>
        {asteroids.map((asteroid) => (
          <Asteroid key={asteroid.id} data={asteroid} onClick={handleRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

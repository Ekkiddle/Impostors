'use client'

import React, { useEffect, useState } from "react";

export default function SpaceBackground() {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const area = (width * height) / 10000; // Normalize area
    const density = 1.5; // Dots per 10,000 px²
    const numDots = Math.floor(area * density);

    const newDots = Array.from({ length: numDots }, () => {
      const speed = Math.random() * 30 + 10; // 10–40s
      const animationDelay = -Math.random() * speed; // negative = mid-animation

      return {
        id: Math.random().toString(36).substr(2, 9),
        size: Math.random() * 2 + 3, // 3–5px
        top: Math.random() * 100, // %
        left: Math.random() * 100, // %
        speed,
        animationDelay,
        animationProgress: 0,  // Track animation progress
      };
    });

    setDots(newDots);

    // Remove dots when they go off-screen
    const interval = setInterval(() => {
      setDots((prevDots) => 
        prevDots.filter(dot => dot.left < 100)  // Remove dots that have gone past the right side of the screen
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const createDotStyle = (dot) => ({
    position: "absolute",
    top: `${dot.top}vh`,
    left: `${dot.left}vw`,
    width: `${dot.size}px`,
    height: `${dot.size}px`,
    borderRadius: "50%",
    backgroundColor: "white",
    animation: `moveRight ${dot.speed}s linear infinite`,
    animationDelay: `${dot.animationDelay}s`,
    animationIterationCount: "infinite",
    animationPlayState: "running",
    animationProgress: dot.animationProgress,
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden bg-black">
      {dots.map((dot, index) => (
        <div key={index} style={createDotStyle(dot)} />
      ))}

      <style>
        {`
          @keyframes moveRight {
            0% {
              transform: translateX(-100vw);
            }
            100% {
              transform: translateX(100vw);
            }
          }
        `}
      </style>
    </div>
  );
}

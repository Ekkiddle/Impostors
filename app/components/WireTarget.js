'use client';

import React, { useRef, useEffect, useState } from 'react';
import { darkenColor } from './SpaceManIcon';

export default function WireTarget({
  ref,
  size = 25,
  isHovering,
  color = 'blue',
  hoverColor = 'gray',
}) {
    const darkerColor = darkenColor(color);

  return (
    <div
        className="relative"
        style={{ width: size, height: size }}
        >
        {/* Draggable origin block */}
        <div
            ref={ref}
            className="absolute z-5 border-2 border-black"
            style={{
            top: 0,
            left: 0,
            width: size,
            height: size,
            backgroundColor: isHovering ? hoverColor : darkerColor,
            }}
        />
        <div
            className="absolute z-7"
            style={{
            top: 1,        
            left: 0,
            width: size + 3,
            height: size -2,      
            backgroundColor: darkerColor,
            }}
        />
        <div
            className="absolute z-7"
            style={{
            top: size / 4,         // push it down by 1/4 of the original height
            left: 0,
            width: size + 3,
            height: size / 2,      // half the height
            backgroundColor: color,
            pointerEvents: 'none', // so it doesn't block mouse events
            }}
        />

        {/* Wire end SVG facing left */}
        <svg
            className="absolute z-8 pointer-events-none"
            style={{
            top: size / 2 - (size * 1.2) / 2, // center vertically
            left: -size * 0.3, // move slightly outside the box to the left
            width: size * 1.2,
            height: size * 1.2,
            }}
        >
            <image
            href="/wireend.svg"
            width="100%"
            height="100%"
            transform={`rotate(180, ${size * 1.2 / 2}, ${size * 1.2 / 2})`} // rotate around its center
            />
        </svg>
        </div>

  );
}

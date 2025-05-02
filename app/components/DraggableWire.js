'use client';

import React, { useState, useRef, useEffect } from 'react';
import { darkenColor } from './SpaceManIcon';

export default function DraggableWire({
  color = 'blue',
  onConnection,
  onHover,
  targetRef,
  size = 25,
  wireThickness = 20,
}) {
  const darkerColor = darkenColor(color);

  const originRef = useRef(null);
  const [hover, setHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [current, setCurrent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      e.preventDefault(); // Prevent scrolling while dragging

      const x = e.clientX || e.touches[0].clientX; // Handle both mouse and touch
      const y = e.clientY || e.touches[0].clientY; // Handle both mouse and touch
      setCurrent({ x, y });

      // Hover detection
      setHovering(false);
      if (targetRef?.current) {
        const targetRect = targetRef.current.getBoundingClientRect();
        const inside =
          x >= targetRect.left - wireThickness * 0.3 &&
          x <= targetRect.right &&
          y >= targetRect.top &&
          y <= targetRect.bottom;
        if (inside) {
          if (onHover) onHover();
          setHovering(true);
        }
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      if (hover && current) {
        console.log('Connected');
        setConnected(true);
        if (onConnection) onConnection(current);
      }
      setHovering(false);
    };

    window.addEventListener('mousemove', handleMove, {passive: false});
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, current, onConnection, hover, targetRef, onHover]);

  useEffect(() => {
    const originRect = originRef.current?.getBoundingClientRect();
    if (originRect) {
      setOrigin({
        x: originRect.left + originRect.width / 2,
        y: originRect.top + originRect.height / 2,
      });
    }
  }, []);

  function handleStart(e) {
    if (connected) return;
    e.preventDefault(); // Prevent default behavior, especially for mobile (to avoid scrolling)

    const originRect = originRef.current?.getBoundingClientRect();

    if (originRect) {
      setOrigin({
        x: originRect.left + originRect.width / 2,
        y: originRect.top + originRect.height / 2,
      });

      setCurrent({
        x: e.clientX || e.touches[0].clientX, // Handle both mouse and touch
        y: e.clientY || e.touches[0].clientY, // Handle both mouse and touch
      });

      setIsDragging(true);
    }
  }

  const renderWire = () => {
    const svgSize = wireThickness * 1.5;
    const offset = 10;

    if (!(isDragging || connected)) return (
      <image
        href="/wireend.svg" // Replace with your SVG path
        width={svgSize}
        height={svgSize}
        x={origin.x - offset / 2}
        y={origin.y - svgSize / 2}
      />
    );

    const end = connected ? current : current;
    if (!end) return null;

    const dx = end.x - origin.x;
    const dy = end.y - origin.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const degrees = (angle * 180) / Math.PI;

    return (
      <>
        {/* Wire */}
        <rect
          x={origin.x}
          y={origin.y - wireThickness / 2}
          width={length}
          height={wireThickness}
          fill={darkerColor}
          stroke="black"
          strokeWidth="2"
          transform={`rotate(${degrees}, ${origin.x}, ${origin.y})`}
        />
        {/* Cover the left edge to "remove" border */}
        <rect
          x={origin.x - 1} // Extend slightly to fully cover stroke
          y={origin.y - wireThickness / 2}
          width={5}
          height={wireThickness}
          fill={darkerColor} // same color as wire to blend
          transform={`rotate(${degrees}, ${origin.x}, ${origin.y})`}
        />

        <rect
          x={origin.x - 2}
          y={origin.y - wireThickness * 0.25}
          width={length + 2}
          height={wireThickness * 0.5}
          fill={color}
          transform={`rotate(${degrees}, ${origin.x}, ${origin.y})`}
        />

        {/* SVG icon at the end */}
        <image
          href="/wireend.svg" // Replace with your SVG path
          width={svgSize}
          height={svgSize}
          x={end.x - offset}
          y={end.y - svgSize / 2}
          transform={`rotate(${degrees}, ${end.x}, ${end.y})`}
        />
      </>
    );
  };

  return (
    <div
      className="relative" // Container that is sized to the origin block
      style={{ width: size, height: size }}
    >
      {/* Wire */}
      <svg className="fixed inset-0 pointer-events-none overflow-visible z-20">
        {renderWire()}
      </svg>

      {/* Draggable origin block */}
      <div
        ref={originRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart} // Touch event for mobile
        className="absolute cursor-pointer z-6 border-2 border-black"
        style={{
          top: 0,
          left: 0,
          width: size,
          height: size,
          backgroundColor: darkerColor,
        }}
      />
      <div
        className="absolute z-7"
        style={{
          top: 1,
          left: -3,
          width: size + 3,
          height: size - 2,
          backgroundColor: darkerColor,
          pointerEvents: 'none',
        }}
      />
      <div
        className="absolute z-7"
        style={{
          top: size / 4, // push it down by 1/4 of the original height
          left: -3,
          width: size + 3,
          height: size / 2, // half the height
          backgroundColor: color,
          pointerEvents: 'none', // so it doesn't block mouse events
        }}
      />
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { darkenColor } from './SpaceManIcon';

export default function DraggableWire({
  color = 'blue',
  onConnection,
  onHover,
  targetRef,
  size = 25,
}) {
  const darkerColor = darkenColor(color);

  const originRef = useRef(null);
  const [hover, setHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [current, setCurrent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [connected, setConnected] = useState(false);

  // Updates the origin position based on originRef
  const updateOrigin = () => {
    const originRect = originRef.current?.getBoundingClientRect();
    if (originRect) {
      setOrigin({
        x: originRect.left + originRect.width / 2,
        y: originRect.top + originRect.height / 2,
      });
    }
  };

  // Updates the wire end position continuously if connected
  useEffect(() => {
    let animationFrameId;

    const updateLoop = () => {
      if (connected) {
        updateOrigin();

        if (targetRef?.current) {
          const targetRect = targetRef.current.getBoundingClientRect();
          setCurrent({
            x: targetRect.left - size / 2,
            y: targetRect.top + targetRect.height / 2,
          });
        }
      }

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [connected, targetRef]);

  // Update origin on resize
  useEffect(() => {
    const handleResize = () => updateOrigin();
    window.addEventListener('resize', handleResize);
    updateOrigin();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      e.preventDefault();
      const x = e.clientX || e.touches[0].clientX;
      const y = e.clientY || e.touches[0].clientY;
      setCurrent({ x, y });

      setHovering(false);
      if (targetRef?.current) {
        const targetRect = targetRef.current.getBoundingClientRect();
        const inside =
          x >= targetRect.left - size &&
          x <= targetRect.right + 10 &&
          y >= targetRect.top - 10 &&
          y <= targetRect.bottom + 10;
        if (inside) {
          if (onHover) onHover();
          setHovering(true);
        }
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      if (hover) {
        setConnected(true);
        if (onConnection) onConnection(current);
      }
      setHovering(false);
    };

    window.addEventListener('mousemove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, current, hover, onConnection, targetRef, onHover]);

  const handleStart = (e) => {
    if (connected) return;

    const originRect = originRef.current?.getBoundingClientRect();
    if (originRect) {
      setOrigin({
        x: originRect.left + originRect.width / 2,
        y: originRect.top + originRect.height / 2,
      });

      setCurrent({
        x: e.clientX || e.touches[0].clientX,
        y: e.clientY || e.touches[0].clientY,
      });

      setIsDragging(true);
    }
  };

  const renderWire = () => {
    const svgSize = size * 1.5;
    const offset = 10;

    if (!(isDragging || connected)) {
      return (
        <image
          href="/wireend.svg"
          width={svgSize}
          height={svgSize}
          x={origin.x - offset / 2}
          y={origin.y - svgSize / 2}
        />
      );
    }

    const end = current;
    if (!end) return null;

    const dx = end.x - origin.x;
    const dy = end.y - origin.y;
    const angle = Math.atan2(dy, dx);
    const degrees = (angle * 180) / Math.PI;

    const calculatePoints = (width, offset) => {
      const halfThickness = width / 2;
      const p1 = { x: origin.x + size / 2 + offset, y: origin.y + halfThickness };
      const p2 = { x: origin.x + size / 2 + offset, y: origin.y - halfThickness };
      const p3 = {
        x: end.x + halfThickness * Math.sin(angle),
        y: end.y - halfThickness * Math.cos(angle),
      };
      const p4 = {
        x: end.x - halfThickness * Math.sin(angle),
        y: end.y + halfThickness * Math.cos(angle),
      };
      return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;
    };

    return (
      <>
        <polygon
          points={calculatePoints(size, 0)}
          fill={darkerColor}
          stroke="black"
          strokeWidth="2"
        />
        <polygon
          points={calculatePoints(size - 2, -1)}
          fill={darkerColor}
        />
        <polygon
          points={calculatePoints(size * 0.5, -1)}
          fill={color}
        />
        <image
          href="/wireend.svg"
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
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="fixed inset-0 pointer-events-none overflow-visible z-20">
        {renderWire()}
      </svg>

      <div
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className="absolute cursor-pointer z-6"
        style={{
          top: -5,
          left: -5,
          width: size + 10,
          height: size + 10,
        }}
      />

      <div
        ref={originRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
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
          top: size / 4,
          left: -3,
          width: size + 3,
          height: size / 2,
          backgroundColor: color,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function DraggableWire({
  color = 'blue',
  onConnection,
  onHover,
  targetRef,
  size = 50,
  wireThickness = 30,
}) {
  const originRef = useRef(null);
  const [hover, setHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [current, setCurrent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {

      const x = e.clientX;
      const y = e.clientY;
      setCurrent({ x, y });

      // Hover detection
      
      if (targetRef?.current) {
        const targetRect = targetRef.current.getBoundingClientRect();
        const inside =
          e.clientX >= targetRect.left &&
          e.clientX <= targetRect.right &&
          e.clientY >= targetRect.top &&
          e.clientY <= targetRect.bottom;
        if (inside){
          if (onHover) onHover();
          setHovering(true);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (hover && current) {
        console.log("Connected")
        setConnected(true);
        if (onConnection) onConnection(current);
      }
      setHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, current, onConnection, hover, setHovering, targetRef, onHover]);

  function handleMouseDown(e) {
    if (connected) return;
    e.preventDefault();
    const originRect = originRef.current?.getBoundingClientRect();
    const targetRect = targetRef.current?.getBoundingClientRect();
    console.log("Origin: ", originRect)
    console.log("Target: ", targetRect)

    if (originRect) {
      setOrigin({
        x: originRect.left + originRect.width / 2,
        y: originRect.top + originRect.height / 2,
      });

      setCurrent({
        x: e.clientX,
        y: e.clientY,
      });

      setIsDragging(true);
    }
  }

  const renderWire = () => {
    if (!(isDragging || connected)) return null;

    const end = connected ? current : current;
    if (!end) return null;

    const dx = end.x - origin.x;
    const dy = end.y - origin.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return (
      <rect
        x={origin.x}
        y={origin.y - wireThickness / 2}
        width={length}
        height={wireThickness}
        fill={color}
        stroke={'black'}
        strokeWidth="2"
        transform={`rotate(${angle}, ${origin.x}, ${origin.y})`}
      />
    );
  };

  return (
    <div
      className="relative" // Container that is sized to the origin block
      style={{ width: size, height: size }}
    >
      {/* Wire */}
      <svg className="fixed inset-0 pointer-events-none overflow-visible">
        {renderWire()}
      </svg>

      {/* Draggable origin block */}
      <div
        ref={originRef}
        onMouseDown={handleMouseDown}
        className="absolute cursor-pointer"
        style={{
          top: 0,
          left: 0,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: 4,
        }}
      />
    </div>
  );
}

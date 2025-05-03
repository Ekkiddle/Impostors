'use client';

import { useRef, useState, useEffect } from 'react';

export default function DraggableContainer({
  id,
  defaultPosition = { x: 0, y: 0 },
  width = 100,
  height = 100,
  onDrag,
  forbiddenZones = [],
  children,
  style = {},
}) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(defaultPosition);
  const offset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const containerParentRect = useRef({ left: 0, top: 0 });

  const getTouchOrMouse = (e) => (e.touches ? e.touches[0] : e);

  useEffect(() => {
    // Update parent rect on load
    if (containerRef.current?.offsetParent) {
      containerParentRect.current = containerRef.current.offsetParent.getBoundingClientRect();
    }

    const handleMove = (e) => {
      if (!dragging.current) return;
      e.preventDefault();

      const point = getTouchOrMouse(e);

      const newX = point.clientX - containerParentRect.current.left - offset.current.x;
      const newY = point.clientY - containerParentRect.current.top - offset.current.y;

      const newRect = {
        left: newX,
        top: newY,
        right: newX + width,
        bottom: newY + height,
      };

      const overlaps = forbiddenZones.some((zone) => {
        return !(
          newRect.right < zone.left ||
          newRect.left > zone.right ||
          newRect.bottom < zone.top ||
          newRect.top > zone.bottom
        );
      });

    // Allow me to pass in a function that works and can use the coordinates of my object.
      if (onDrag) onDrag(newRect);

      if (!overlaps) {
        setPosition({ x: newX, y: newY });
      }
    };

    const handleEnd = () => {
      dragging.current = false;
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
  }, [width, height, forbiddenZones]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    const point = getTouchOrMouse(e);

    const rect = containerRef.current.getBoundingClientRect();
    offset.current = {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    };

    if (containerRef.current?.offsetParent) {
      containerParentRect.current = containerRef.current.offsetParent.getBoundingClientRect();
    }

    dragging.current = true;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width,
        height,
        cursor: dragging.current ? 'grabbing' : 'grab',
        touchAction: 'none', // Prevents scroll on touch devices
        ...style,
      }}
    >
      {children}
    </div>
  );
}

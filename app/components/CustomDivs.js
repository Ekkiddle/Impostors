'use client';

import { useRef, useState, useEffect } from 'react';

export function DraggableDiv({
  id,
  ref,
  defaultPosition = { x: 0, y: 0 },
  width = 100,
  height = 100,
  onDrag,
  forbiddenZones = [],
  children,
  style = {},
}) {
  const [position, setPosition] = useState(defaultPosition);
  const offset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const containerParentRect = useRef({ left: 0, top: 0 });

  const getTouchOrMouse = (e) => (e.touches ? e.touches[0] : e);

  useEffect(() => {
    // Update parent rect on load
    if (ref.current?.offsetParent) {
      containerParentRect.current = ref.current.offsetParent.getBoundingClientRect();
    }

    const handleMove = (e) => {
        if (!dragging.current) return;
        e.preventDefault();
      
        const point = getTouchOrMouse(e);
      
        const containerWidth = ref.current.getBoundingClientRect().width;
        const containerHeight = ref.current.getBoundingClientRect().height;
      
        const parentWidth = containerParentRect.current.width;
        const parentHeight = containerParentRect.current.height;
      
        let newX = point.clientX - containerParentRect.current.left - offset.current.x;
        let newY = point.clientY - containerParentRect.current.top - offset.current.y;
      
        const newRect = {
          left: newX,
          top: newY,
          right: newX + containerWidth,
          bottom: newY + containerHeight,
        };
      
        for (let zoneRef of forbiddenZones) {
          const zone = zoneRef?.current?.getBoundingClientRect?.();
          if (!zone) continue;
      
          const zoneLeft = zone.left - containerParentRect.current.left;
          const zoneTop = zone.top - containerParentRect.current.top;
          const zoneRight = zoneLeft + zone.width;
          const zoneBottom = zoneTop + zone.height;
      
          const overlaps =
            !(newRect.right <= zoneLeft ||
              newRect.left >= zoneRight ||
              newRect.bottom <= zoneTop ||
              newRect.top >= zoneBottom);
      
          if (!overlaps) continue;
      
          const options = [
            {
              x: zoneLeft - containerWidth,
              y: newY,
              dist: Math.abs((zoneLeft - containerWidth) - newX),
            },
            {
              x: zoneRight,
              y: newY,
              dist: Math.abs(zoneRight - newX),
            },
            {
              x: newX,
              y: zoneTop - containerHeight,
              dist: Math.abs((zoneTop - containerHeight) - newY),
            },
            {
              x: newX,
              y: zoneBottom,
              dist: Math.abs(zoneBottom - newY),
            },
          ];
      
          // Filter out any options that would go outside the parent container
          const inBounds = options.filter(opt => {
            const xInBounds = opt.x >= 0 && opt.x + containerWidth <= parentWidth;
            const yInBounds = opt.y >= 0 && opt.y + containerHeight <= parentHeight;
            return xInBounds && yInBounds;
          });
      
          const best = (inBounds.length > 0 ? inBounds : options)
            .sort((a, b) => a.dist - b.dist)[0];
      
          newX = best.x;
          newY = best.y;
        }
      
        const allowedRect = {
          left: newX,
          top: newY,
          right: newX + containerWidth,
          bottom: newY + containerHeight,
        };
      
        if (onDrag) onDrag(allowedRect);
        setPosition({ x: newX, y: newY });
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

    const rect = ref.current.getBoundingClientRect();
    offset.current = {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    };

    if (ref.current?.offsetParent) {
      containerParentRect.current = ref.current.offsetParent.getBoundingClientRect();
    }

    dragging.current = true;
  };

  return (
    <div
      ref={ref}
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

export function EmbossedDiv({
    children,
    innerDimensions = { left: 5, right: 95, top: 15, bottom: 85 },
    className = '',
    style = {},
    ...rest
  }) {
    const { left, right, top, bottom } = innerDimensions;
  
    // Build polygon strings dynamically using the passed dimensions
    const leftHighlightClip = `polygon(0 0, ${left}% ${top}%, ${left}% ${bottom}%, 0 100%)`;
    const rightShadowClip = `polygon(${right}% ${top}%, 100% 0, 100% 100%, ${right}% ${bottom}%)`;
    const topHighlightClip = `polygon(0 0, 100% 0, ${right}% ${top}%, ${left}% ${top}%)`;
    const bottomShadowClip = `polygon(${left}% ${bottom}%, ${right}% ${bottom}%, 100% 100%, 0 100%)`;
  
    return (
      <div
        className={`relative ${className}`}
        style={{ position: 'relative', ...style }}
        {...rest}
      >
        {/* Left Highlight */}
        <div
          className="absolute top-0 left-0 h-full w-full bg-white opacity-40 pointer-events-none"
          style={{ clipPath: leftHighlightClip }}
        />
  
        {/* Right Shadow */}
        <div
          className="absolute top-0 right-0 h-full w-full bg-black opacity-30 pointer-events-none"
          style={{ clipPath: rightShadowClip }}
        />
  
        {/* Top Highlight */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-white opacity-70 pointer-events-none"
          style={{ clipPath: topHighlightClip }}
        />
  
        {/* Bottom Shadow */}
        <div
          className="absolute bottom-0 left-0 w-full h-full bg-black opacity-40 pointer-events-none"
          style={{ clipPath: bottomShadowClip }}
        />
  
        {/* Your content goes here */}
        {children}
      </div>
    );
  }
'use client';

import React, { useRef, useEffect, useState } from 'react';

export default function WireTarget({
  ref,
  size = 50,
  isHovering,
  color = 'blue',
  hoverColor = 'gray',
}) {

  return (
    <div
      className="relative" // Container that is sized to the origin block
      style={{ width: size, height: size }}
    >

      {/* Draggable origin */}
      <div
        ref={ref}
        className="absolute"
        style={{
          top:0,
          left:0,
          width: size,
          height: size,
          backgroundColor: isHovering? hoverColor: color,
          borderRadius: 4,
        }}
      />
    </div>
  );
}

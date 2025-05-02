'use client';

import React, { useState, useEffect } from 'react';
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

export default function FullscreenButton({style, color='white', className}) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = async () => {
      try {
        if (!isFullscreen) {
          // Try to request fullscreen
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            await document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari
            await document.documentElement.webkitRequestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            await document.documentElement.msRequestFullscreen();
          }
          setIsFullscreen(true);
        } else {
          // Try to exit fullscreen
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.mozCancelFullScreen) { // Firefox
            await document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) { // Chrome, Safari
            await document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) { // IE/Edge
            await document.msExitFullscreen();
          }
          setIsFullscreen(false);
        }
      } catch (error) {
        console.error("Error toggling fullscreen:", error);
      }
    };

  return (
    <button onClick={toggleFullscreen} className={className} style={style}>
      {/* Icon changes based on fullscreen state */}
      {isFullscreen ? (
        <MdFullscreenExit
            color={color}
        /> // Icon for entering fullscreen
      ) : (
        <MdFullscreen 
            color={color}
        /> // Icon for exiting fullscreen
      )}
    </button>
  );
}

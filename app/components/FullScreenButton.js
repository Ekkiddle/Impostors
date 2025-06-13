'use client';

import React, { useState, useEffect } from 'react';
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

// Utility to detect iOS devices
const isIOS = typeof window !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.MSStream;

export default function FullscreenButton({ style, color = 'white', className }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    if (isIOS) {
      alert("Fullscreen mode is not supported on iOS Safari.");
      return;
    }

    try {
      if (!isFullscreen) {
        const el = document.documentElement;

        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.mozRequestFullScreen) { // Firefox
          await el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) { // Safari
          await el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) { // IE/Edge
          await el.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Listen for any fullscreen change (ESC key, back gesture, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      setIsFullscreen(!!fsElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return (
    <button onClick={toggleFullscreen} className={className} style={style}>
      {isFullscreen ? (
        <MdFullscreenExit color={color} />
      ) : (
        <MdFullscreen color={color} />
      )}
    </button>
  );
}

'use client';

import './globals.css'; // if you have one
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GameProvider, useGame } from './game/gameProvider';
import { registerPlayerSetter } from './game/gameManager';
import { useEffect } from 'react';
import FullscreenButton from './components/FullScreenButton';


// Fonts  -------------------------------------------------------------------
import { Orbitron } from 'next/font/google';
import localFont from 'next/font/local'

const digi = localFont({ 
  src: './fonts/time.ttf', 
  variable: '--font-digi',
  display: 'swap', // optional: improves performance
})

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'], // choose the weights you need
  variable: '--font-orbitron', // optional: useful for Tailwind
});

// ----------------------------------------------------------------------------

function RegisterGameManager() {
  const { setPlayers } = useGame();

  useEffect(() => {
    registerPlayerSetter(setPlayers);
  }, [setPlayers]);

  return null;
}

// Function to lock the screen orientation
const lockOrientation = () => {
  if (screen.orientation && screen.orientation.lock) {
    // Lock the orientation to portrait
    screen.orientation.lock('portrait').catch(function (error) {
      console.log('Error locking orientation: ', error);
    });
  }
};

export default function RootLayout({ children }) {
  useEffect(() => {
    // Lock the orientation when the layout is loaded
    lockOrientation();
  }, []); // Empty array ensures this effect runs only once (on mount)

  return (
    <html lang="en" className={`${orbitron.variable} ${digi.variable}`}>
      <body className={`w-screen h-screen overflow-hidden relative`}>
        <FullscreenButton 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 50,
            opacity: 0.8,  // Set opacity (can adjust value between 0 and 1)
            fontSize: '2rem',  // Make the icon larger (adjust as needed)
            padding: '5px',  // Adjust padding for a larger clickable area
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'opacity 0.3s ease',  // Smooth transition on hover
          }}
        />
        <DndProvider backend={HTML5Backend}>
          <GameProvider>
            <RegisterGameManager />
            {children}
          </GameProvider>
        </DndProvider>
      </body>
    </html>
  );
}

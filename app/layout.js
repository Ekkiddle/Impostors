'use client';

import './globals.css'; // if you have one
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GameProvider, useGame } from './game/gameProvider';
import { registerPlayerSetter } from './game/gameManager';
import { useEffect } from 'react';
import FullscreenButton from './components/FullScreenButton';

function RegisterGameManager() {
  const { setPlayers } = useGame();

  useEffect(() => {
    registerPlayerSetter(setPlayers);
  }, [setPlayers]);

  return null;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='w-screen h-screen overflow-hidden relative'>
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

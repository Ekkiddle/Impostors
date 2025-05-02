'use client';

import './globals.css'; // if you have one
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GameProvider, useGame } from './game/gameProvider';
import { registerPlayerSetter } from './game/gameManager';
import { useEffect } from 'react';

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
      <body>
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

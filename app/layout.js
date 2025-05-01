// app/layout.js
'use client';

import './globals.css'; // if you have one
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
        <GameProvider>
          <RegisterGameManager />
          {children}
        </GameProvider>
      </body>
    </html>
  );
}

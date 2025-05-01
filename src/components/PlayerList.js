import React from 'react';
import { useGame } from '../game/gameProvider';

export default function PlayerList() {
  const { players } = useGame();

  if (!players || Object.keys(players).length === 0) {
    return <p className="text-gray-500 italic">No players connected yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4 text-white w-full items-center justify-center">
      {Object.values(players).map((player) => (
        <div key={player.id} className="flex flex-row border gap-4 p-2 rounded shadow w-full max-w-xl items-center">
          <h3 className="text-lg font-bold">{player.name}</h3>
          <p className="flex items-center gap-2">
            Color:
            <div
                className="w-4 h-4 rounded-sm border border-gray-300"
                style={{ backgroundColor: player.color }}
            />
          </p>
          <p>Status: {player.alive ? 'Alive' : 'Dead'}</p>
          <p>Role: {player.role}</p>
        </div>
      ))}
    </div>
  );
}

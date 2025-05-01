import React from 'react';
import { useGame } from '../game/gameProvider';

export default function PlayerList() {
  const { players } = useGame();

  if (!players || Object.keys(players).length === 0) {
    return <p className="text-gray-500 italic">No players connected yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.values(players).map((player) => (
        <div key={player.id} className="border p-2 rounded shadow">
          <h3 className="text-lg font-bold">{player.name}</h3>
          <p>Color: <span style={{ color: player.color }}>{player.color}</span></p>
          <p>Status: {player.alive ? 'Alive' : 'Dead'}</p>
          <p>Role: {player.role}</p>
        </div>
      ))}
    </div>
  );
}

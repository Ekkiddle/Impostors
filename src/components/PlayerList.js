import React from 'react';
import { useGame } from '../game/gameProvider';
import SpaceManIcon from './SpaceManIcon';
import LoadingSpinner from './LoadingIcon';

export default function PlayerList() {
  const { players } = useGame();

  if (!players || Object.keys(players).length === 0) {
    return (
        <div className='flex flex-col h-full w-full items-center'>
            <p className="text-gray-500 italic">No players connected yet.</p>
            <LoadingSpinner />
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full gap-4 mt-8 text-white w-full items-center">
      {Object.values(players).map((player) => (
        <div key={player.id} className="flex flex-row border gap-4 p-2 rounded shadow w-full max-w-xl items-center">
            <SpaceManIcon fill={player.color} size={40}/>
            <h3 className="text-lg font-bold">{player.name}</h3>
            <p>Status: {player.alive ? 'Alive' : 'Dead'}</p>
            <p>Role: {player.role}</p>
        </div>
      ))}
    </div>
  );
}

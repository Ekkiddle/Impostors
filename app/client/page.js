'use client';

import React, { useState } from 'react';
import { initPeer, verifyHost, sendToAll, clearConnections } from '../peer/peerManager';
import { handleClientMessages } from '../game/gameManager';

import SpaceBackground from '../components/SpaceBackground';
import PlayerList from '../components/PlayerList';

export default function Lobby() {
  const [joined, setJoined] = useState(false);
  const [hostId, setHostId] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');


  const handleJoinClick = async () => {
    clearConnections();
    await initPeer(null, handleClientMessages);
    console.log(`Attempting to connect to ${hostId}`);
    setHostId(hostId.toUpperCase())
    try {
      await verifyHost(hostId.toUpperCase(), handleClientMessages, null, null, setErrorMsg("Game not found."));
      console.log("Host verified. Joining...");
      sendToAll(`name|${name}`);
      setJoined(true);
    } catch (err) {
      console.error("Failed to verify host:", err);
      setErrorMsg("Game not found.");
    }
  };

  if (!joined) {
    return (
      <div className="w-screen h-screen overflow-hidden font-orbitron">
        <SpaceBackground />
        <div className='w-full h-full flex flex-col justify-center items-center gap-y-4 p-10'>
          <div className="flex flex-col items-end gap-y-2">
            <div className="flex flex-row items-center gap-x-2">
              <label className="text-white" htmlFor="hostId">Game Code:</label>
              <input
                type="text"
                id="hostId"
                name="hostId"
                value={hostId}
                onChange={(e) => setHostId(e.target.value)}
                required
                minLength="6"
                maxLength="6"
                size="10"
                className="border-2 rounded-md text-white bg-black px-2"
              />
            </div>
            <div className="flex flex-row items-center gap-x-2">
              <label className="text-white" htmlFor="name">Username:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength="15"
                size="10"
                className="border-2 rounded-md text-white bg-black px-2"
              />
            </div>
          </div>
          <button
            className="bg-black border-2 border-stone-400 text-white px-4 py-2 rounded-lg w-full max-w-64 hover:bg-stone-950 hover:border-white"
            onClick={handleJoinClick}
          >
            Join Game
          </button>
          {errorMsg && (
            <p className="text-red-500 mt-2 font-semibold">{errorMsg}</p>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-screen h-screen overflow-hidden font-orbitron">
        <SpaceBackground />
        <div className='w-full h-full flex flex-col items-center justify-between p-10'>
          <div className='w-full flex flex-col items-center'>
            <div className="w-full mt-4 items-center flex flex-col">
              <p className="text-green-600 text-xl">Players:</p>
            </div>
            <div className="w-full max-h-[60vh] overflow-y-scroll mt-4 scrollbar-hide">
              <PlayerList />
            </div>
          </div>
          <p className='text-white text-lg mb-10'>Waiting for host to start the game</p>
        </div>
      </div>
    );
  }
}

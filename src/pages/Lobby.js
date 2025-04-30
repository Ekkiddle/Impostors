import React, { useEffect, useState } from 'react';
import { initPeer, getPeerId, connectToPeer } from '../peer/peerManager';

export default function LobbySetup() {
  const [hosting, setHosting] = useState(false);
  const [myId, setMyId] = useState(null);
  const [hostId, sethostId] = useState('');

  useEffect(() => {
    initPeer();
  }, []);

  const handleHostClick = () => {
    setHosting(true);
    const id = getPeerId();
    setMyId(id);
  };

  const handleClientClick = () => {
    setHosting(false);
    console.log(`Attempting to connect to ${hostId}`);
    connectToPeer(hostId);
  };

  return (
    <div className="p-4">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleHostClick}
      >
        Host Game
      </button>
      <label>Game ID:</label>
      <input
        type="text"
        id="hostId"
        name="hostId"
        value={hostId}
        onChange={(e) => sethostId(e.target.value)}
        required
        minLength="6"
        maxLength="6"
        size="10" 
        className="border-1"/>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleClientClick}
      >
        Join Game
      </button>
      {myId && hosting && (
        <div className="mt-4">
          <p className="text-green-600">Hosting with Peer ID:</p>
          <code>{myId}</code>
        </div>
      )}
    </div>
  );
}

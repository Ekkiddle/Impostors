import React, { useState } from 'react';
import { initPeer, connectToPeer, sendToPeer } from '../peer/peerManager';
import { usePeer } from '../peer/peerProvider';

import { handleClientMessages, handleHostMessages } from '../game/gameManager';

export default function LobbySetup() {

  const {
    myId, setMyId,
    hostId, setHostId,
  } = usePeer();

  const [hosting, setHosting] = useState(false);
  const [name, setName] = useState('');

  const handleHostClick = async () => {
    await(initPeer(null, handleHostMessages, (peerId) => {
      setMyId(peerId);
    } ));
    setHosting(true);
  };

  const handleClientClick = async () => {
    setHosting(false);
    await(initPeer(null, handleClientMessages, (peerId) => {
      setMyId(peerId);
    } ));
    console.log(`Attempting to connect to ${hostId}`);
    // connect to the peer
    try {
      await connectToPeer(hostId, handleClientMessages);
      console.log("Connection successful!");
      
      // Now safe to send message
      sendToPeer(hostId, `name|${name}`);
      // Other initial game logic...
    } catch (err) {
      console.error("Failed to connect:", err);
      alert("Could not connect to host. Please check the code and try again.");
    }
  };
  

  return (
    <div className="p-4 flex flex-col">
      <div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleHostClick}
        >
          Host Game
        </button>
      </div>
      <div className='flex flex-col justify-center items-center'>
        <div className='gap-4'>
          <label>Game ID: </label>
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
            className="border-2 rounded-md"/>
        </div>
        <div>
          <label>Username: </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            size="10" 
            className="border-2 rounded-md"/>
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded w-64"
          onClick={handleClientClick}
        >
          Join Game
        </button>
      </div>
      {myId && hosting && (
        <div className="mt-4">
          <p className="text-green-600">Hosting with Peer ID:</p>
          <code>{myId}</code>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { initPeer, connectToPeer, sendToPeer } from '../peer/peerManager';
import { usePeer } from '../peer/peerProvider';
import { handleClientMessages, handleHostMessages } from '../game/gameManager';
import PlayerList from '../components/PlayerList';
import SpaceBackground from '../components/SpaceBackground';

export default function LobbySetup() {
  const {
    myId, setMyId,
    hostId, setHostId,
  } = usePeer();

  const [hosting, setHosting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [name, setName] = useState('');

  const handleHostClick = async () => {
    setHosting(true);
    setJoining(false);
    await(initPeer(myId, null, handleHostMessages, (peerId) => {
      setMyId(peerId);
    } ));
    setHostId(myId);
  };

  const handleJoinClick = () => {
    setHosting(false);
    setJoining(true);
    // pretty much just need to set join to true.
  }

  const handleGameStart = () => {
    // do something
    console.log("You clicked a button")
  }

  const handleClientClick = async () => {
    await(initPeer(myId, null, handleClientMessages, (peerId) => {
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

  // Local components
  function HostJoinButtons() {
    return (
      <div className="p-10 flex flex-col gap-4 w-full h-full justify-center items-center align-center">
        <h1
          className='text-white text-5xl'
        >
          Impostors
        </h1>
        <button
          className="bg-black border-2 border-stone-400 text-white px-4 py-2 rounded-lg w-full max-w-64 hover:bg-stone-950 hover:border-white"
          onClick={handleHostClick}
        >
          Host Game
        </button>
        <button
          className="bg-black border-2 border-stone-400 text-white px-4 py-2 rounded-lg w-full max-w-64 hover:bg-stone-950 hover:border-white"
          onClick={handleJoinClick}
        >
          Join Game
        </button>
      </div>
    );
  }

  function HostScreen() {
    // Function to show playerlist and whatnot...
    return (  
      <div>
        <div className="mt-4">
          <p className="text-green-600">Hosting with Peer ID:</p>
          <code>{myId}</code>
        </div>
        <PlayerList />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleGameStart}
        >
          Start Game
        </button>
      </div>
    )
  }
  

  return (
    <div className="w-screen h-screen overflow-hidden">
      <SpaceBackground />
      
      {!hosting && !joining && (
        <HostJoinButtons />
      )}
      {joining && (
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
      )}
      {myId && hosting && (
        <HostScreen />
      )}
    </div>
  );
}

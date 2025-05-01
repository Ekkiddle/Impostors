import React, { useState } from 'react';
import { initPeer, connectToPeer, sendToPeer } from '../peer/peerManager';
import { usePeer } from '../peer/peerProvider';
import { handleClientMessages, handleHostMessages } from '../game/gameManager';
import PlayerList from '../components/PlayerList';
import SpaceBackground from '../components/SpaceBackground';

export default function Home() {
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
      <div
        className='w-full h-full flex flex-col items-center justify-between p-10'
      >
        <div className='w-full flex flex-col items-center'>
          <div className="w-full mt-4 items-center flex flex-col">
            <p className="text-green-600 text-xl">GameCode:</p>
            <code className='text-white'>{myId}</code>
          </div>
          <PlayerList />
        </div>
        <button
          className="bg-black border-2 border-stone-400 text-white px-4 py-2 rounded-lg w-full max-w-64 hover:bg-stone-950 hover:border-white"
          onClick={handleGameStart}
        >
          Start Game
        </button>
      </div>
    )
  }
  

  return (
    <div className="w-screen h-screen overflow-hidden font-orbitron">
      <SpaceBackground />
      
      {!hosting && !joining && (
        <HostJoinButtons />
      )}
      {joining && (
        <div className='w-full h-full flex flex-col justify-center items-center gap-y-4 p-10'>
          <div className="flex flex-col items-end gap-y-2">
            {/* Game ID Field */}
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

            {/* Username Field */}
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

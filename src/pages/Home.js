import React from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceBackground from '../components/SpaceBackground';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className='w-screen h-screen overflow-hidden font-orbitron'>
      <SpaceBackground />
      <div className="p-10 flex flex-col gap-4 w-full h-full justify-center items-center align-center">
        <h1
          className='text-white text-5xl'
        >
          Impostors
        </h1>
        <button
          className="bg-black border-2 border-stone-400 text-white px-4 py-2 rounded-lg w-full max-w-64 hover:bg-stone-950 hover:border-white"
          onClick={() => {navigate('/host')}}
        >
          Host Game
        </button>
        <button
          className="bg-black border-2 border-stone-400 text-white px-4 py-2 rounded-lg w-full max-w-64 hover:bg-stone-950 hover:border-white"
          onClick={() => {navigate("/lobby")}}
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

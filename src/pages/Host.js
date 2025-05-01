import { useEffect, useState } from "react";
import { reconnect, getMyId } from "../peer/peerManager";
import { assignRoles, handleHostMessages } from "../game/gameManager";


import SpaceBackground from "../components/SpaceBackground"
import PlayerList from "../components/PlayerList";
import LoadingDots from "../components/LoadingIcon";


export default function HostScreen() {

      const [loading, setLoading] = useState(true);
      const [myId, setMyId] = useState('');

      useEffect(() => {
        const init = async () => {
            console.log("Reconnecting");
            await reconnect(handleHostMessages); 
            setLoading(false);
            setMyId(getMyId());
        };
    
        init();
    }, []);

    const handleGameStart = () => {
        // do something
        console.log("Assigning Roles")
        assignRoles();
    }

    // Function to show playerlist and whatnot...
    return ( 
        <div className="w-screen h-screen overflow-hidden font-orbitron">
            <SpaceBackground />
            <div className="w-full h-full flex flex-col items-center justify-between p-10">
                <div className="w-full flex flex-col items-center flex-grow">
                <div className="w-full mt-4 items-center flex flex-col">
                    <p className="text-green-600 text-xl">GameCode:</p>
                    {loading ? <LoadingDots /> : <code className="text-white">{myId}</code>}
                </div>

                <div className="w-full h-[60vh] overflow-y-scroll mt-4 flex flex-col items-start">
                    <PlayerList />
                </div>
                </div>

                <button
                className="bg-black border-2 border-stone-400 text-white px-4 py-2 rounded-lg w-full max-w-64 hover:bg-stone-950 hover:border-white"
                onClick={handleGameStart}
                >
                Start Game
                </button>
            </div>
            </div>

    )
  }
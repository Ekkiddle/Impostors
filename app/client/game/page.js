// Page that covers the game running of the client. If the user is not already connected to a game, ("No host, no connections...")
// Then, they will be redirected back to the client page.
"use client"


import { useEffect, useState } from "react"
import Button from '@mui/material/Button';

import { getConnIds, reconnect, sendToPeer, disconnectPeer } from "@/app/peer/peerManager";
import { handleClientMessages } from "@/app/game/gameManager";

export default function GamePage() {
    const [hostId, setHostId] = useState('');

    // first, reconnect.
    useEffect(() => {
        // Attempt reconnect. If I am connected to the host, then I should just set myself as joined.
        const init = async () => {
          console.log("Attempting reconnect.")
          await reconnect(handleClientMessages)
          const host = getConnIds()[0];
          console.log("Host: ", host)
    
          if (host){
            setHostId(host);
            // I should also double check to make sure that my player is in the list. If not, I shouldn't set "joined"
            sendToPeer(host, "players|request")
            // Wait a little bit of time before checking players list (500 ms should be fine...)
            setTimeout(()=>{
              console.log("Checking players")
              if (players && players.has(getMyId())){
                console.warn("Not joined.")
              } else {
                // disconnect from the host, go back to client page.
                disconnectPeer(host)
              }
              
            },500)
            
          }
          
        } 
        init();
      }, [])

    return(
        <div className="w-full h-full bg-sky-800 flex flex-col items-center p-2 pt-12 md:p-2">
            <div className="w-100 max-w-full h-full flex flex-col items-center gap-4">
                <div className="w-full h-10 flex flex-row justify-between">
                    <Button variant="contained" className="w-[30%]">Players</Button>
                    <Button variant="contained" className="w-[30%]">Tasks</Button>
                    <Button variant="contained" className="w-[30%]">Map</Button>
                </div>
                <div className="relative bg-gray-500 w-100 max-w-full aspect-square">
                    <div className="absolute right-0 w-0 h-0 border-t-[50px] border-l-[50px] border-t-sky-800 border-l-transparent">
                        
                    </div>
                    <button
                        className="absolute top-0 right-0 w-6 h-6 text-white rounded-full text-2xl flex items-center justify-center hover:text-gray-300"
                    >
                        &times;
                    </button>
                    {/** I am going to put tasks, QRScanning, and such, inside of this div. */}
                </div>
                <div className="relative w-full h-10 bg-gray-500">
                    {/**Future progress bar */}
                    <p className="absolute text-white text-lg top-1 left-2">Total Tasks Completed</p>
                </div>
                <Button variant="contained" className="w-full h-20 mt-auto">Report Body</Button>
            </div>
        </div>
    )
}
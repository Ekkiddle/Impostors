import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { PeerProvider } from "./peer/peerProvider";
import { GameProvider, useGame } from "./game/gameProvider";
import { registerPlayerSetter } from "./game/gameManager";

import Home from "./pages/Home";
import Lobby from "./pages/Lobby";

function App() {
  return (
    <GameProvider>
      <RegisterGameManager />
      <PeerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lobby" element={<Lobby />} />
          </Routes>
        </Router>
      </PeerProvider>
    </GameProvider>
  );
}

// 👇 This runs once when App mounts and registers setPlayers
function RegisterGameManager() {
  const { setPlayers } = useGame();

  useEffect(() => {
    registerPlayerSetter(setPlayers);
  }, [setPlayers]);

  return null; // It doesn't render anything
}

export default App;

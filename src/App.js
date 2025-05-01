// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { PeerProvider } from "./peer/peerProvider";

import Home from "./pages/Home";
import Lobby from "./pages/Lobby";

function App() {
  return (
    <PeerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lobby" element={<Lobby />} />
        </Routes>
      </Router>
    </PeerProvider>
  );
}

export default App;

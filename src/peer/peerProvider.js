// Storage for peer-to-peer architecture

import { createContext, useContext, useState } from 'react';

const PeerContext = createContext();

export const PeerProvider = ({ children }) => {
  const [myId, setMyId] = useState(null);
  const [hostId, setHostId] = useState('');

  return (
    <PeerContext.Provider value={{
      myId, setMyId,
      hostId, setHostId
    }}>
      {children}
    </PeerContext.Provider>
  );
};

export const usePeer = () => useContext(PeerContext);

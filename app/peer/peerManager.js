// Manages peer to peer connections
import Peer from 'peerjs';

let peer;
let connections = {};
let connIds = [];

const generateId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const initPeer = (onConnection, onRecieve, onReady, onClose, onError) => {
  return new Promise((resolve, reject) => {
    const tryInit = (attempts = 0) => {
        let storedId;
        if (attempts === 0) {
            // Have some variable for myId that I can set and use to reinitialize myself and reconnect with peers.
            storedId = sessionStorage.getItem('my-id') || generateId(); // generateId returns a 6-digit
        } else {
            storedId = generateId();
        }
        // comment out storage when testing on single device
        // This will allow for reconnections if the browser is refreshed.
        sessionStorage.setItem('my-id', storedId); 
        peer = new Peer(storedId);
  
        peer.on('open', (peerId) => {
            console.log('My peer ID is: ' + peerId);
            if (onReady) onReady(peerId);
            resolve(peer); // resolves the promise
        });
  
        peer.on('error', (err) => {
            if (err.type === 'unavailable-id' && attempts < 5) {
                console.warn(`ID ${storedId} already taken. Retrying...`);
                tryInit(attempts + 1);
            } else {
                console.error('PeerJS error:', err);
            if (onError) onError(err);
            reject(err); // rejects the promise
            }
        });
  
        peer.on('connection', (conn) => {
            connections[conn.peer] = conn;
            connIds.push(conn.peer);
            sessionStorage.setItem('connections', connIds); 
            console.log(`Connection recieved from ${conn.peer}`)
            if (onConnection) onConnection(conn.peer);

            conn.on('data', (data) => {
                console.log('Received', data);
                if (onRecieve) onRecieve(conn.peer, data);
            });
            conn.on('close', () => {
              console.log(`${conn.peer} disconnected`);
              delete connections[conn.peer];
              delete connIds[connIds.indexOf(conn.peer)];
              sessionStorage.setItem('connections', connIds); 
              if (onClose) onClose(conn.peer);
            });
        });
    };
    if (peer) {
      console.log("Peer already established");
    } else {
      tryInit();
    };
  });
};

export const connectToPeer = (peerId, onRecieve, onOpen, onClose, onError) => {
  return new Promise((resolve, reject) => {
    const conn = peer.connect(peerId);
    connections[peerId] = conn;
    connIds.push(peerId);
    sessionStorage.setItem('connections', connIds); 

    conn.on('open', () => {
      console.log(`Connected to ${peerId}`);
      if (onOpen) onOpen(peerId);
      resolve(conn); // resolves the promise
    });

    conn.on('data', (data) => {
      console.log('Data received:', data);
      if (onRecieve) onRecieve(peerId, data);
    });

    conn.on('close', () => {
      console.log(`${conn.peer} disconnected`);
      delete connections[conn.peer];
      delete connIds[connIds.indexOf(conn.peer)];
      sessionStorage.setItem('connections', connIds); 
      if (onClose) onClose(conn.peer);
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      if (onError) onError(err);
      reject(err); // rejects the promise
    });
  });
};

export const disconnectPeer = (peerId) => {
  let conn = connections[peerId];
  conn.close();
  delete connections[conn.peer];
  delete connIds[connIds.indexOf(conn.peer)];
  sessionStorage.setItem('connections', connIds);
}

export const reconnect = async (onRecieve, onReady, onOpen, onClose, onError) => {
  try {
    if (!peer) {
      await initPeer(null, onRecieve, onReady, onClose, onError);
    } else {
      console.log("Peer already exists. Skipping init.");
    }

    if (Object.keys(connections).length === 0){
      const conns = sessionStorage.getItem('connections') || [];
      console.log("Reconnecting to connections", conns)
      for (const connId in conns){
        await connectToPeer(connId, onRecieve, onOpen, onClose, onError);
        console.log(`Reconnected and connected to peer ${connId}`);
      }
    } else {
      console.log(connections);
      console.log("Connections already established")
    }
  } catch (err) {
    console.error("Reconnection failed:", err);
    if (onError) onError(err);
  }
};

export const clearConnections = () => {
  for (const ids in connIds){
    disconnectPeer(ids);
  }
  connIds = []
  sessionStorage.setItem('connections', connIds); 
  connections = {}
}


export const sendToAll = (data) => {
  reconnect();
  console.log("Broadcasting to:", connections);
  console.log("Broadcasting data: ", data);
  Object.values(connections).forEach((conn) => {
    conn.send(data);
  });
};


export const sendToPeer = (peerId, data) => {
  console.log(`Sending "${data}" to ${peerId}`);
    if (connections[peerId]) {
      connections[peerId].send(data);
    }
  };
  
export const getMyId = () => {
  return peer?.id;
};


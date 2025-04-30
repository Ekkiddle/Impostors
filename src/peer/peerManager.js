// Manages peer to peer connections
import Peer from 'peerjs';

let peer;
let connections = {};

const generateId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const initPeer = (onConnection, onRecieve, onReady, onError) => {
    const tryInit = (attempts = 0) => {
        let storedId;
        if (attempts === 0) {
            storedId = localStorage.getItem('peer-id') || generateId(); // generateId returns a 6-digit
        } else {
            storedId = generateId();
        }
        // comment out storage when testing on single device
        // This will allow for reconnections if the browser is refreshed.
        // localStorage.setItem('peer-id', storedId); 
        peer = new Peer(storedId);
  
        peer.on('open', (peerId) => {
            console.log('✅ My peer ID is: ' + peerId);
            if (onReady) onReady(peerId);
        });
  
        peer.on('error', (err) => {
            if (err.type === 'unavailable-id' && attempts < 5) {
                console.warn(`⚠️ ID ${storedId} already taken. Retrying...`);
                tryInit(attempts + 1);
            } else {
                console.error('❌ PeerJS error:', err);
            if (onError) onError(err);
            }
        });
  
        peer.on('connection', (conn) => {
            connections[conn.peer] = conn;
            console.log(`Connection recieved from ${conn.peer}`)
            if (onConnection) onConnection(conn.peer);
            conn.on('data', (data) => {
                console.log('📩 Received', data);
                if (onRecieve) onRecieve(conn.peer, data);
            });
        });
    };
  
    tryInit();
};

export const connectToPeer = (peerId, onOpen, onError) => {
    const conn = peer.connect(peerId);
    connections[peerId] = conn;
  
    conn.on('open', () => {
      console.log(`Connected to ${peerId}`);
      if (onOpen) onOpen(peerId);
    });
  
    conn.on('data', (data) => {
      console.log('Data received:', data);
    });

    conn.on('close', () => {
        console.log(`${conn.peer} disconnected`);
        delete connections[conn.peer];
      });
      
    conn.on('error', (err) => {
        console.error('Connection error:', err);
        if (onError) onError(err);
    });
  };
  

export const sendToAll = (data) => {
  Object.values(connections).forEach((conn) => {
    conn.send(data);
  });
};

export const getPeerId = () => peer?.id;

export const sendToPeer = (peerId, data) => {
    if (connections[peerId]) {
      connections[peerId].send(data);
    }
  };
  

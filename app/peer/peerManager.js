// Manages peer to peer connections
import Peer from 'peerjs';

let peer;
let connections = {};
let connIds = [];

const generateId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};


// For Initiallizing self as a peer
export const initPeer = (onConnection, onRecieve, onReady, onClose, onError) => {
  return new Promise((resolve, reject) => {
    const tryInit = (attempts = 0) => {
      let storedId;
      if (attempts === 0) {
        storedId = sessionStorage.getItem('my-id') || generateId();
      } else {
        storedId = generateId();
      }
      sessionStorage.setItem('my-id', storedId);

      peer = new Peer(storedId);

      peer.on('open', (peerId) => {
        console.log('My peer ID is: ' + peerId);
        if (onReady) onReady(peerId);
        resolve(peer);
      });

      peer.on('error', (err) => {
        if (err.type === 'unavailable-id' && attempts < 5) {
          console.warn(`ID ${storedId} already taken. Retrying...`);
          tryInit(attempts + 1);
        } else {
          console.error('PeerJS error:', err);
          if (onError) onError(err);
          reject(err);
        }
      });

      peer.on('connection', (conn) => {
        connections[conn.peer] = conn;
        connIds.push(conn.peer);
        sessionStorage.setItem('connections', JSON.stringify(connIds));
        console.log(`Connection received from ${conn.peer}`);

        conn.on('data', (data) => {
          if (typeof data === 'object') {
            if (data.type === 'verify') {
              console.log(`Received verify request from ${conn.peer}`);
              conn.send({ type: 'verify-response', host: true });
              return;
            } else if (data.type === 'ping') {
              conn.send({ type: 'pong', timestamp: data.timestamp });
              return;
            } else if (data.type === 'pong') {
              const rtt = Date.now() - data.timestamp;
              console.log(`RTT from ${conn.peer}: ${rtt}ms`);
              console.log("Connections:", connections)
            }
          }

          if (onRecieve) onRecieve(conn.peer, data);
        });

        conn.on('close', () => {
          console.log(`${conn.peer} disconnected`);
          delete connections[conn.peer];
          connIds = connIds.filter(id => id !== conn.peer);
          sessionStorage.setItem('connections', JSON.stringify(connIds));
          if (onClose) onClose(conn.peer);
        });

        startPingLoop(conn.peer, conn);
        if (onConnection) onConnection(conn.peer);
      });
    };

    if (peer) {
      console.log("Peer already established");
      resolve(peer);
    } else {
      tryInit();
    }
  });
};

// For clients primarily (since I shouldn't necessarily be getting connections, unless the host attempts reconnect)
export const connectToPeer = (peerId, onRecieve, onOpen, onClose, onError) => {
  return new Promise((resolve, reject) => {
    const conn = peer.connect(peerId);
    connections[peerId] = conn;
    connIds.push(peerId);
    sessionStorage.setItem('connections', JSON.stringify(connIds));

    conn.on('open', () => {
      console.log(`Connected to ${peerId}`);
      if (onOpen) onOpen(peerId);
      resolve(conn);
    });

    conn.on('data', (data) => {
      if (typeof data === 'object') {
        if (data.type === 'ping') {
          conn.send({ type: 'pong', timestamp: data.timestamp });
        } else if (data.type === 'pong') {
          const rtt = Date.now() - data.timestamp;
          console.log(`RTT from ${peerId}: ${rtt}ms`);
        }
      }
      if (onRecieve) onRecieve(peerId, data);
    });

    conn.on('close', () => {
      console.log(`${conn.peer} disconnected`);
      delete connections[conn.peer];
      connIds = connIds.filter(id => id !== conn.peer);
      sessionStorage.setItem('connections', JSON.stringify(connIds));
      if (onClose) onClose(conn.peer);
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      if (onError) onError(err);
      reject(err);
    });

    startPingLoop(peerId, conn);
  });
};

// Connect to host with verify.
export const verifyHost = async (peerId, onRecieve, onOpen, onClose, onError) => {
  return new Promise(async (resolve, reject) => {
    let resolved = false;
    let timeout;

    const connection = connections[peerId];

    const handleResponse = (data) => {
      if (typeof data === 'object' && data.type === 'verify-response') {
        clearTimeout(timeout);
        resolved = true;
        cleanup();
        resolve(true);
      }
      if (onRecieve) onRecieve(peerId, data)
    };

    const cleanup = () => {
      if (connection) connection.off('data', handleResponse);
    };

    try {
      if (connection?.open) {
        connection.on('data', handleResponse);
        connection.send({ type: 'verify' });
      } else {
        await connectToPeer(
          peerId,
          (_, data) => handleResponse(data),
          () => {
            connections[peerId].send({ type: 'verify' });
            if (onOpen) onOpen(peerId);
          },
          () => {
            if (!resolved) {
              cleanup();
              reject(new Error("Connection closed before verification"));
              if (onClose) onClose(conn.peer);
            }
          },
          (err) => {
            if (!resolved) {
              cleanup();
              reject(err);
              if (onError) onError(err);
            }
          }
        );
      }

      timeout = setTimeout(() => {
        if (!resolved) {
          disconnectPeer(peerId);
          cleanup();
          reject(new Error("Host did not respond in time"));
        }
      }, 3000);
    } catch (err) {
      reject(err);
    }
  });
};

// Disconnect
export const disconnectPeer = (peerId) => {
  let conn = connections[peerId];
  if (conn) {
    conn.close();
    delete connections[conn.peer];
    connIds = connIds.filter(id => id !== conn.peer);
    sessionStorage.setItem('connections', JSON.stringify(connIds));
  }
};

// For host/client
export const reconnect = async (onReceive, onReady, onOpen, onClose, onError) => {
  try {
    if (!peer) {
      await initPeer(null, onReceive, onReady, onClose, onError);
    } else {
      console.log("Peer already exists. Skipping init.");
    }

    if (Object.keys(connections).length === 0) {
      const conns = JSON.parse(sessionStorage.getItem('connections') || '[]');
      console.log("Reconnecting to connections:", conns);

      for (const connId of conns) {
        try {
          await connectToPeer(connId, onReceive, onOpen, onClose, onError);
          console.log(`Reconnected and connected to peer ${connId}`);
        } catch (connErr) {
          console.error(`Failed to reconnect to ${connId}:`, connErr);
          if (onError) onError(connErr);
        }
      }
    } else {
      console.log("Connections already established");
    }
  } catch (err) {
    console.error("Reconnection failed:", err);
    if (onError) onError(err);
  }
};

// This one works fine...
export const clearConnections = () => {
  for (const peerId of connIds) {
    disconnectPeer(peerId);
  }
  connIds = [];
  connections = {};
  sessionStorage.setItem('connections', JSON.stringify(connIds));
};

// Broadcast
export const sendToAll = (data) => {
  console.log("Broadcasting to:", connections);
  console.log("Broadcasting data:", data);
  Object.values(connections).forEach((conn) => {
    if (conn.open) conn.send(data);
  });
};

// Single message to specific peer
export const sendToPeer = (peerId, data) => {
  console.log(`Sending "${data}" to ${peerId}`);
  if (connections[peerId]?.open) {
    connections[peerId].send(data);
  }
};

// Getter...
export const getMyId = () => {
  return peer?.id;
};

export const getConnIds = () => {
  return connIds;
}

// -----------------------------------------------------------------------------------------------
// PING Methods
// -----------------------------------------------------------------------------------------------

const pingIntervals = {};

const startPingLoop = (peerId, conn) => {
  if (pingIntervals[peerId]) return;

  pingIntervals[peerId] = setInterval(() => {
    if (conn.open) {
      console.log("Sending ping to ", peerId)
      conn.send({ type: 'ping', timestamp: Date.now() });
    }
  }, 5000);

  conn.on('close', () => {
    clearInterval(pingIntervals[peerId]);
    delete pingIntervals[peerId];
  });
};



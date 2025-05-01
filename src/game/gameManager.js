// Game manager file to keep track of game components
import { sendToAll, sendToPeer } from "../peer/peerManager";


const players = new Map(); // key: playerId, value: { id, name, role, alive, tasks }

// -------------------------------------------------------------
// Link to playstate

let updatePlayersState = null;

export const registerPlayerSetter = (setter) => {
  updatePlayersState = setter;
};

// -------------------------------------------------------------

const splitData = (data) => {
  const delimiterIndex = data.indexOf("|");

  let command = data;
  let message = "";

  if (delimiterIndex !== -1) {
    command = data.substring(0, delimiterIndex);
    message = data.substring(delimiterIndex + 1);
  }
  return {command, message};
}

export const handleHostMessages = (clientId, data) => {
    // function to handle messages sent to the host
    let {command, message} = splitData(data);
    console.log(`Recieved "${message}" as a ${command} from ${clientId}`);

    if (command === 'name'){
      if (!players.has(clientId)) {
        addPlayer(clientId, message);
        console.log(`Added new player: ${message} (ID: ${clientId})`);
      } else {
        changeName(clientId, message);
        console.log(`Changed name for ${clientId} to ${message}`);
      }
    }
    if (command === 'color'){
      changeColor(clientId, message);
    }
    if (command === 'alive'){
      changeAlive(clientId, message);
      // Impostors win if the person they killed makes them win
      checkWinConditions();
    }
    if (command === 'quit'){
      let name = players.get(clientId).name;
      console.log(`${name} quit the game`);
      removePlayer(clientId);
      // also check win conditions in case the player quiting changed the win
      checkWinConditions();
    }
};

export const handleClientMessages = (hostId, data) => {
    // function to handle messages sent to the client from the host
};


// --------------------------------------------------------------------------------------
// Interact with players
// --------------------------------------------------------------------------------------

const broadcastPlayers = () => {
  const playersObj = Object.fromEntries(players);
  const send = `players|${JSON.stringify(playersObj)}`;
  sendToAll(send);
  if (updatePlayersState) updatePlayersState(playersObj);
};


const addPlayer = (id, name) => {
  // initial color of black
  players.set(id, { id, name, color:'0x000000', connection:'active', alive: true, role: 'pending', tasks: [] });
  broadcastPlayers();
};

const changeName = (id, name) => {
  const existingPlayer = players.get(id);
  existingPlayer.name = name; // update the name
  players.set(id, existingPlayer);
  broadcastPlayers();
}

const changeColor = (id, color) => {
  const existingPlayer = players.get(id);
  existingPlayer.color = color; // update the name
  players.set(id, existingPlayer);
  broadcastPlayers();
}

const changeAlive = (id, alive) => {
  const existingPlayer = players.get(id);
  existingPlayer.alive = alive; // update the name
  players.set(id, existingPlayer);
  broadcastPlayers();
}

export const activeStatus = (id, status) => {
  const existingPlayer = players.get(id);
  existingPlayer.connection = status; // update the name
  players.set(id, existingPlayer);
  broadcastPlayers();
}

export const removePlayer = (id) => {
  players.delete(id);
  broadcastPlayers();
};

export const assignRoles = () => {
  const ids = Array.from(players.keys());
  const shuffled = ids.sort(() => Math.random() - 0.5);
  const impostorCount = Math.max(1, Math.floor(shuffled.length / 6));
  
  shuffled.forEach((id, i) => {
    const player = players.get(id);
    player.role = i < impostorCount ? 'impostor' : 'crewmate';
    player.tasks = generateTasks();
    players.set(id, player);
  });
};

export const getGameState = () => {
  return Array.from(players.values());
};

const generateTasks = () => {
  const taskPool = ['task1', 'task2', 'task3', 'task4'];
  return taskPool.sort(() => Math.random() - 0.5).slice(0, 3);
};

const checkWinConditions = () => {
  // if there are more (or equal) number of impostors to players, impostors win.
  // if all of the tasks are done, or there are no more impostors, crewmates win.
};

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
    let {command, message} = splitData(data);

    if (command === 'players'){
      //set list of players
      const playersObj = JSON.parse(message);
      if (updatePlayersState) updatePlayersState(playersObj);
    }
};

// --------------------------------------------------------------------------------------
// Interact with players
// --------------------------------------------------------------------------------------

const broadcastPlayers = () => {
  reloadPlayers();
  const playersObj = Object.fromEntries(players);
  const playerString = JSON.stringify(playersObj);
  sessionStorage.setItem('players', playerString);
  const send = `players|${playerString}`;
  sendToAll(send);
  if (updatePlayersState) updatePlayersState(playersObj);
};

// Reload players if lost
const reloadPlayers = () => {
  if (players.size === 0) {  // Check if the players map is empty
    const playersObj = JSON.parse(sessionStorage.getItem('players'));
    
    if (playersObj) {  // Ensure playersObj is not null
      players.clear();  // Clear the current map to start fresh

      // Populate the map with the stored players
      Object.entries(playersObj).forEach(([id, playerData]) => {
        players.set(id, playerData);
      });

      
      
      const playersObj = Object.fromEntries(players);
      // Call the updatePlayersState function if defined
      if (updatePlayersState) updatePlayersState(playersObj);
    }
  }
};

const addPlayer = (id, name) => {
  const color = generateUniqueColor();
  players.set(id, {
    id,
    name,
    color,
    connected: true,
    alive: true,
    role: 'pending',
    tasks: []
  });
  broadcastPlayers();
};

const changeName = (id, name) => {
  if (players.has(id)) {
    const existingPlayer = players.get(id);
    existingPlayer.name = name; // update the name
    players.set(id, existingPlayer);
    broadcastPlayers();
  }
}

const changeColor = (id, color) => {
  if (!isColorTaken(color) && (players.has(id))){
    const existingPlayer = players.get(id);
    existingPlayer.color = color; // update the name
    players.set(id, existingPlayer);
    broadcastPlayers();
  }
}

const changeAlive = (id, alive) => {
  if (players.has(id)) {
    const existingPlayer = players.get(id);
    existingPlayer.alive = alive; // update the name
    players.set(id, existingPlayer);
    broadcastPlayers();
  }
}

export const changeConnection = (id, status) => {
  if (players.has(id)) {
    const existingPlayer = players.get(id);
    existingPlayer.connection = status; // update the name
    players.set(id, existingPlayer);
    broadcastPlayers();
  }
}

export const removePlayer = (id) => {
  players.delete(id);
  broadcastPlayers();
};

export const clearPlayers = () => {
  console.log("Clearing players")
  players.clear();
  console.log("Test cleared: ", players)
  const playersObj = Object.fromEntries(players);
  const playerString = JSON.stringify(playersObj);
  sessionStorage.setItem('players', playerString);
  if (updatePlayersState) {
    console.log("Updating state")
    updatePlayersState(playersObj);
  } 
}

export const assignRoles = () => {
  reloadPlayers();
  const ids = Array.from(players.keys());
  const shuffled = shuffleArray(ids);
  // default impostors:crewmates is 1:4 Second impostor at 10 players
  const impostorCount = Math.max(1, Math.floor(shuffled.length / 5));
  
  shuffled.forEach((id, i) => {
    const player = players.get(id);
    player.role = i < impostorCount ? 'impostor' : 'crewmate';
    player.tasks = generateTasks();
    players.set(id, player);
  });
  broadcastPlayers();
};

export const getGameState = () => {
  return Array.from(players.values());
};

const generateTasks = () => {
  const taskPool = ['task1', 'task2', 'task3', 'task4'];
  return shuffleArray(taskPool).slice(0, 3);
};

const checkWinConditions = () => {
  // if there are more (or equal) number of impostors to players, impostors win.
  // if all of the tasks are done, or there are no more impostors, crewmates win.
};


// ------------------------------------------------------------------------------------
// Miscelanious

const getRandomBrightColor = () => {
  // Keep brightness above 0x17 for each channel (to avoid dark colors)
  const min = 0x17;
  const max = 0xFF;

  const r = Math.floor(Math.random() * (max - min) + min);
  const g = Math.floor(Math.random() * (max - min) + min);
  const b = Math.floor(Math.random() * (max - min) + min);

  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
};

const isColorTaken = (color) => {
  for (const player of players.values()) {
    if (player.color === color) {
      return true;
    }
  }
  return false;
};

const generateUniqueColor = () => {
  let color;
  let attempts = 0;
  do {
    color = getRandomBrightColor();
    attempts++;
    if (attempts > 100) throw new Error("Unable to generate unique color");
  } while (isColorTaken(color));
  return color;
};

export const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index between 0 and i
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr;
};

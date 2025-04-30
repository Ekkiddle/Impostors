// Game manager file to keep track of game components
const players = new Map(); // key: playerId, value: { id, name, role, alive, tasks }

export const handleHostMessages = (data) => {
    // function to handle messages sent to the host
    console.log(data);
};

export const handleClientMessages = (data) => {
    // function to handle messages sent to the client from the host
};


export const addPlayer = (id, name) => {
  players.set(id, { id, name, alive: true, role: 'pending', tasks: [] });
};

export const removePlayer = (id) => {
  players.delete(id);
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

const users = [];

const addUser = data => {
  data.username = data.username.trim().toLowerCase();
  data.room = data.room.trim().toLowerCase();

  if (!data.username || !data.room) {
    return { error: 'Username and room are required!' };
  }

  const existingUsers = users.find(
    u => data.room === u.room && data.username === u.username
  );

  if (existingUsers) {
    return { error: 'Username is in use!' };
  }

  const user = {
    id: data.id,
    username: data.username,
    room: data.room
  };

  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => users.find(u => u.id === id);

const getUsersInRoom = room => users.filter(u => u.room === room.trim().toLowerCase());

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};

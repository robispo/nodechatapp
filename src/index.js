const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const filter = new Filter();

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

app.use(express.json());
app.use((err, req, res, next) => {
  console.error(err);
  err.stacktrace = err.stack;
  res.status(400).json(err);
});

app.all('*', (req, res) => {
  res.status(404).json({ error: 'Resource not found!' });
});

io.on('connection', socket => {
  console.log('New socket connection!');

  socket.on('join', (data, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username: data.username,
      room: data.room
    });

    if (error) {
      callback(error);
      return;
    }

    socket.join(user.room);
    socket.emit(
      'receiveMessage',
      generateMessage(`${user.username} Welcome!`, 'Admin')
    );
    socket.broadcast
      .to(user.room)
      .emit(
        'receiveMessage',
        generateMessage(`${user.username} has joined!`, 'Admin')
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    if (filter.isProfane(message)) {
      callback('Profanity is not allowed!');
      return;
    }
    const user = getUser(socket.id);

    if (!user) {
      callback('User not found!');
      return;
    }

    io.to(user.room).emit(
      'receiveMessage',
      generateMessage(message, user.username)
    );
    callback();
  });

  socket.on('shareLocation', (data, callback) => {
    const user = getUser(socket.id);

    if (!user) {
      callback('User not found!');
      return;
    }

    io.to(user.room).emit(
      'receiveLocation',
      generateLocation(data.latitude, data.longitude, user.username)
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'receiveMessage',
        generateMessage(`${user.username} has left!`, 'Admin')
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

module.exports = server;

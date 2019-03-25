const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/messages');

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
  let userName = '';
  console.log('New socket connection!');

  socket.on('join', data => {
    userName = data.username;

    socket.join(data.room);
    socket.emit(
      'receiveMessage',
      generateMessage(`${userName} Welcome!`, userName)
    );
    socket.broadcast
      .to(data.room)
      .emit(
        'receiveMessage',
        generateMessage(`${userName} has joined!`, userName)
      );
  });

  socket.on('sendMessage', (message, callback) => {
    if (filter.isProfane(message)) {
      callback('Profanity is not allowed!');
      return;
    }
    io.emit('receiveMessage', generateMessage(message));
    callback();
  });

  socket.on('shareLocation', (data, callback) => {
    io.emit('receiveLocation', generateLocation(data.latitude, data.longitude));
    callback();
  });

  socket.on('disconnect', () => {
    io.emit(
      'receiveMessage',
      generateMessage(`${userName} has left!`, userName)
    );
  });

  //   socket.on('countPlus', plus => {
  //     count = count + plus;
  //     // socket.emit('countUpdated', count);
  //     io.emit('countUpdated', count);
  //   });
});

module.exports = server;

const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

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
  socket.emit('Welcome', 'Welcome!');

  socket.broadcast.emit('Welcome', 'A new user has joined!');

  socket.on('sendMessage', (data, callback) => {
    if (filter.isProfane(data.message)) {
      callback('Profanity is not allowed!');
      return;
    }
    io.emit('receiveMessage', data);
    callback();
  });

  socket.on('shareLocation', (data, callback) => {
    io.emit(
      'Welcome',
      `https://google.com/maps?q=${data.latitude},${data.longitude}`
    );
    callback();
  });

  socket.on('disconnect', () => {
    io.emit('Welcome', 'An user has left!');
  });

  //   socket.on('countPlus', plus => {
  //     count = count + plus;
  //     // socket.emit('countUpdated', count);
  //     io.emit('countUpdated', count);
  //   });
});

module.exports = server;

const path = require('path');

const express = require('express');

const app = express();

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

module.exports = app;
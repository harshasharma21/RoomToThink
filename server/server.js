const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.get('/create-room', (req, res) => {
  const roomId = uuidv4();
  res.json({ roomId });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('joinRoom', ({ roomId, username }) => {
    socket.join(roomId);
    socket.username = username;
    io.to(roomId).emit('userJoined', { username });
  });

  // Handle drawing events
  socket.on('draw', (data) => {
    socket.to(data.roomId).emit('draw', data);
  });

  // Handle chat messages
  socket.on('message', (data) => {
    io.to(data.roomId).emit('message', { text: data.text, username: socket.username });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});

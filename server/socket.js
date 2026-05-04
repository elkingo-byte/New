const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
const httpServer = createServer(app);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const parties = new Map(); // roomId -> { host, members, state: { time, isPlaying, lastUpdated } }
const activeViewers = new Map(); // movieId -> Set of socket IDs

io.on('connection', (socket) => {
  console.log(`[NovaMovies] Client connected: ${socket.id}`);

  // Watch Party
  socket.on('party:create', ({ roomId, movieId, userName }) => {
    socket.join(roomId);
    parties.set(roomId, {
      host: socket.id,
      movieId,
      members: [{ id: socket.id, name: userName || 'Host' }],
      state: { time: 0, isPlaying: false, lastUpdated: Date.now() },
    });
    socket.emit('party:created', { roomId });
    console.log(`[Party] Room created: ${roomId} by ${userName}`);
  });

  socket.on('party:join', ({ roomId, userName }) => {
    const party = parties.get(roomId);
    if (!party) { socket.emit('party:error', { message: 'Room not found' }); return; }
    socket.join(roomId);
    party.members.push({ id: socket.id, name: userName || 'Guest' });
    socket.emit('party:joined', { state: party.state, movieId: party.movieId, members: party.members });
    io.to(roomId).emit('party:memberUpdate', { members: party.members });
    io.to(party.host).emit('party:sync_request', { to: socket.id });
  });

  socket.on('party:sync', ({ roomId, time, isPlaying }) => {
    const party = parties.get(roomId);
    if (!party) return;
    party.state = { time, isPlaying, lastUpdated: Date.now() };
    socket.to(roomId).emit('party:state', { time, isPlaying });
  });

  socket.on('party:play', ({ roomId, time }) => {
    const party = parties.get(roomId);
    if (!party || party.host !== socket.id) return;
    party.state = { time, isPlaying: true, lastUpdated: Date.now() };
    socket.to(roomId).emit('party:play', { time });
  });

  socket.on('party:pause', ({ roomId, time }) => {
    const party = parties.get(roomId);
    if (!party || party.host !== socket.id) return;
    party.state = { time, isPlaying: false, lastUpdated: Date.now() };
    socket.to(roomId).emit('party:pause', { time });
  });

  socket.on('party:seek', ({ roomId, time }) => {
    const party = parties.get(roomId);
    if (!party || party.host !== socket.id) return;
    party.state.time = time;
    socket.to(roomId).emit('party:seek', { time });
  });

  socket.on('party:message', ({ roomId, userName, message }) => {
    io.to(roomId).emit('party:message', { userName, message, time: Date.now() });
  });

  // Live comments broadcast
  socket.on('comment:new', ({ movieId, comment }) => {
    socket.to(`movie:${movieId}`).emit('comment:new', comment);
  });

  socket.on('viewer:join', ({ movieId }) => {
    socket.join(`movie:${movieId}`);
    if (!activeViewers.has(movieId)) activeViewers.set(movieId, new Set());
    activeViewers.get(movieId).add(socket.id);
    io.to(`movie:${movieId}`).emit('viewer:count', { count: activeViewers.get(movieId).size });
  });

  socket.on('viewer:leave', ({ movieId }) => {
    if (activeViewers.has(movieId)) {
      activeViewers.get(movieId).delete(socket.id);
      io.to(`movie:${movieId}`).emit('viewer:count', { count: activeViewers.get(movieId).size });
    }
  });

  // Global announcements
  socket.on('admin:announce', ({ message, type }) => {
    io.emit('announcement', { message, type, time: Date.now() });
  });

  socket.on('disconnect', () => {
    // Clean up parties
    for (const [roomId, party] of parties.entries()) {
      party.members = party.members.filter(m => m.id !== socket.id);
      if (party.members.length === 0) {
        parties.delete(roomId);
      } else {
        if (party.host === socket.id) party.host = party.members[0].id;
        io.to(roomId).emit('party:memberUpdate', { members: party.members });
      }
    }
    // Clean up viewers
    for (const [movieId, viewers] of activeViewers.entries()) {
      if (viewers.has(socket.id)) {
        viewers.delete(socket.id);
        io.to(`movie:${movieId}`).emit('viewer:count', { count: viewers.size });
      }
    }
    console.log(`[NovaMovies] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[NovaMovies] Socket.io server running on port ${PORT}`);
});

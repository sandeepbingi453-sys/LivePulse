const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// 1. Configuration & Setup
const { PORT } = require('./config/env');
const connectDB = require('./config/db');

// 2. Database Connection
connectDB();

const app = express();
const server = http.createServer(app);

// 3. Middleware
const { logger, errorHandler } = require('./middleware/globalMiddleware');
app.use(cors());
app.use(express.json());
app.use(logger);

// 4. Models (Imported in routes/sockets)

// 5. API Routes
const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

// 6. Stream State (Imported in sockets)

// 7. Socket.io Handlers
const io = new Server(server, { 
  cors: { origin: "*" },
  transports: ['websocket', 'polling'] 
});
require('./sockets/streamSocket')(io);

// 7.5 Native WebSocket Server for Binary Stream
const { WebSocketServer } = require('ws');
const url = require('url');
const streamSessions = require('./state/streamState');

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const { pathname, query } = url.parse(request.url, true);
  if (pathname === '/stream') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', (ws, req) => {
  const { query } = url.parse(req.url, true);
  const { type, streamId } = query;

  if (!streamId) return ws.close();

  if (type === 'broadcaster') {
    console.log(`🎥 [WS] Broadcaster connected: ${streamId}`);
    if (!streamSessions[streamId]) {
      streamSessions[streamId] = { 
        viewers: new Set(), 
        initSegment: null,
        comments: [],
        interactions: { likes: 0, dislikes: 0, users: {} }
      };
    }
    
    ws.on('message', (data) => {
      const session = streamSessions[streamId];
      if (!session.initSegment) {
        console.log(`📦 [WS] Header Captured for ${streamId}`);
        session.initSegment = data;
      }
      // Broadcast to all viewers
      session.viewers.forEach(viewer => {
        if (viewer.readyState === 1) viewer.send(data);
      });
    });

    ws.on('close', () => {
      console.log(`🛑 [WS] Broadcaster disconnected: ${streamId}`);
      const session = streamSessions[streamId];
      if (session) {
        session.viewers.forEach(v => v.close());
        delete streamSessions[streamId];
      }
    });
  } else if (type === 'viewer') {
    console.log(`👤 [WS] Viewer connected: ${streamId}`);
    if (!streamSessions[streamId]) {
      streamSessions[streamId] = { 
        viewers: new Set(), 
        initSegment: null,
        comments: [],
        interactions: { likes: 0, dislikes: 0, users: {} }
      };
    }
    const session = streamSessions[streamId];
    session.viewers.add(ws);

    // Send header immediately if available
    if (session.initSegment) {
      ws.send(session.initSegment);
    }

    ws.on('close', () => {
      session.viewers.delete(ws);
    });
  }
});

// Error handling should be last
app.use(errorHandler);

// 8. Server Start
server.listen(PORT, () => {
  console.log(`
  🚀 MODULAR SERVER RUNNING
  ----------------------------
  Port:    ${PORT}
  Mode:    Distributed Files
  ----------------------------
  `);
});

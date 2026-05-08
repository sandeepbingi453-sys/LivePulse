const streamSessions = require('../state/streamState');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`📡 [Socket] New Connection: ${socket.id}`);

    socket.on('start-stream', async (streamId) => {
      console.log(`🚀 [Streamer] Starting: ${streamId}`);
      socket.join(streamId);
      socket.activeStreamId = streamId;
      socket.isStreamer = true;

      if (!streamSessions[streamId]) {
        streamSessions[streamId] = { 
          viewers: new Set(), 
          initSegment: null,
          comments: [],
          interactions: { likes: 0, dislikes: 0, users: {} }
        };
      }
      streamSessions[streamId].streamerId = socket.id;
      
      io.to(streamId).emit('stream-started', streamId);
    });

    // Binary streaming is now handled via native WebSockets in server.js

    const updateViewerCount = (streamId) => {
      const room = io.sockets.adapter.rooms.get(streamId);
      if (!room) return;
      
      const session = streamSessions[streamId];
      let count = room.size;
      if (session && room.has(session.streamerId)) count--;
      
      console.log(`📊 [Room] ${streamId} Viewers: ${count}`);
      io.to(streamId).emit('viewer-count', count > 0 ? count : 0);
    };

    socket.on('join-stream', async (streamId) => {
      console.log(`👤 [Viewer] Joined Room: ${streamId}`);
      socket.join(streamId);
      socket.watchingStreamId = streamId;
      
      const session = streamSessions[streamId];
      if (session) {
        socket.emit('all-comments', session.comments);
        socket.emit('update-interactions', {
          likes: session.interactions.likes,
          dislikes: session.interactions.dislikes,
          userInteractions: session.interactions.users
        });
        
        if (session.initSegment) {
          console.log(`📤 [Server] Sending Header to Viewer: ${socket.id}`);
          socket.emit('stream-data', session.initSegment);
        }
      }
      updateViewerCount(streamId);
    });

    socket.on('request-init', (streamId) => {
      const session = streamSessions[streamId];
      if (session && session.initSegment) {
        console.log(`📤 [Server] Manual Header Resend to: ${socket.id}`);
        socket.emit('stream-data', session.initSegment);
      }
    });

    socket.on('leave-stream', (streamId) => {
      socket.leave(streamId);
      socket.watchingStreamId = null;
      updateViewerCount(streamId);
    });

    socket.on('send-comment', ({ streamId, username, text }) => {
      const session = streamSessions[streamId];
      if (session) {
        const comment = { username, text, timestamp: new Date() };
        session.comments.push(comment);
        io.to(streamId).emit('new-comment', comment);
      }
    });

    socket.on('toggle-interaction', ({ streamId, username, type }) => {
      const session = streamSessions[streamId];
      if (session) {
        const users = session.interactions.users;
        users[username] = (users[username] === type) ? null : type;
        const vals = Object.values(users);
        session.interactions.likes = vals.filter(v => v === 'like').length;
        session.interactions.dislikes = vals.filter(v => v === 'dislike').length;
        io.to(streamId).emit('update-interactions', {
          likes: session.interactions.likes,
          dislikes: session.interactions.dislikes,
          userInteractions: users
        });
      }
    });

    socket.on('stop-stream', () => {
      if (socket.activeStreamId && socket.isStreamer) {
        console.log(`🛑 [Streamer] Stopped: ${socket.activeStreamId}`);
        io.to(socket.activeStreamId).emit('stream-ended');
        delete streamSessions[socket.activeStreamId];
        socket.activeStreamId = null;
        socket.isStreamer = false;
      }
    });

    socket.on('disconnect', () => {
      if (socket.watchingStreamId) {
        const sId = socket.watchingStreamId;
        setTimeout(() => updateViewerCount(sId), 100);
      }

      if (socket.activeStreamId && socket.isStreamer) {
        setTimeout(() => {
          if (streamSessions[socket.activeStreamId]?.streamerId === socket.id) {
            io.to(socket.activeStreamId).emit('stream-ended');
            delete streamSessions[socket.activeStreamId];
          }
        }, 5000);
      }
    });
  });
};

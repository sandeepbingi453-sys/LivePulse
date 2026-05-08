import React, { useState, useEffect } from 'react';
import { useSocket } from '../../SocketContext';

const StreamInteractions = ({ streamId, username }) => {
  const socket = useSocket();
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userInteraction, setUserInteraction] = useState(null);

  useEffect(() => {
    socket.emit('join-stream', streamId);

    const handleUpdate = (data) => {
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setUserInteraction(data.userInteractions[username] || null);
    };

    socket.on('update-interactions', handleUpdate);

    return () => {
      socket.off('update-interactions', handleUpdate);
    };
  }, [streamId, username, socket]);

  const handleInteraction = (type) => {
    socket.emit('toggle-interaction', { streamId, username, type });
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
      <button 
        className="btn-interaction" 
        onClick={() => handleInteraction('like')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.6rem 1.2rem',
          borderRadius: '20px',
          border: '2px solid',
          background: userInteraction === 'like' ? 'var(--primary-color)' : 'transparent',
          color: userInteraction === 'like' ? 'white' : 'var(--primary-color)',
          borderColor: 'var(--primary-color)',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
      >
        👍 {likes}
      </button>
      <button 
        className="btn-interaction" 
        onClick={() => handleInteraction('dislike')}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.6rem 1.2rem',
          borderRadius: '20px',
          border: '2px solid',
          background: userInteraction === 'dislike' ? 'var(--error-color)' : 'transparent',
          color: userInteraction === 'dislike' ? 'white' : 'var(--error-color)',
          borderColor: 'var(--error-color)',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
      >
        👎 {dislikes}
      </button>
    </div>
  );
};

export default StreamInteractions;

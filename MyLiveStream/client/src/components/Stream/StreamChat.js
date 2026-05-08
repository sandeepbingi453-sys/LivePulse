import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../SocketContext';

const StreamChat = ({ streamId, username }) => {
  const socket = useSocket();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.emit('join-stream', streamId);

    const handleAllComments = (allComments) => setComments(allComments);
    const handleNewComment = (comment) => setComments(prev => [...prev, comment]);

    socket.on('all-comments', handleAllComments);
    socket.on('new-comment', handleNewComment);

    return () => {
      socket.off('all-comments', handleAllComments);
      socket.off('new-comment', handleNewComment);
    };
  }, [streamId, socket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    socket.emit('send-comment', { streamId, username, text: newComment });
    setNewComment('');
  };

  return (
    <div className="comment-box" style={{ background: '#f9f9f9', borderRadius: '12px', padding: '1rem', border: '1px solid #eee' }}>
      <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        💬 Live Chat
      </h4>
      
      <div className="comments-list" style={{ height: '300px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', padding: '0.5rem' }}>
        {comments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem', marginTop: '2rem' }}>No comments yet. Be the first!</p>
        ) : (
          comments.map((c, i) => {
            const isMe = c.username === username;
            return (
              <div 
                key={i} 
                style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                {!isMe && <span style={{ fontWeight: 'bold', color: '#666', fontSize: '0.75rem', marginBottom: '0.2rem', marginLeft: '0.4rem' }}>{c.username}</span>}
                <div style={{ 
                  background: isMe ? 'var(--primary-color)' : 'white', 
                  color: isMe ? 'white' : '#333',
                  padding: '0.6rem 1rem', 
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {c.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          placeholder="Say something..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)} 
          style={{ marginBottom: 0, padding: '0.6rem 1rem', borderRadius: '20px' }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.2rem', borderRadius: '20px' }}>Send</button>
      </form>
    </div>
  );
};

export default StreamChat;

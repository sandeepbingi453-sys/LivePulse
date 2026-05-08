import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import StreamSocial from './StreamSocial';

const WatchStream = ({ username, onBack }) => {
  const [viewStreamKey, setViewStreamKey] = useState('');
  const [activeStream, setActiveStream] = useState('');

  const handleWatch = (e) => {
    e.preventDefault();
    setActiveStream(viewStreamKey);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Watch a Stream</h2>
        <button className="btn-secondary" onClick={onBack}>Back to Menu</button>
      </div>

      <form onSubmit={handleWatch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          placeholder="Enter Stream Key to Watch" 
          value={viewStreamKey}
          onChange={(e) => setViewStreamKey(e.target.value)} 
          style={{ marginBottom: 0 }}
        />
        <button type="submit" className="btn-primary">Watch Now</button>
      </form>

      {activeStream ? (
        <>
          <VideoPlayer streamId={activeStream} />
          <StreamSocial streamId={activeStream} username={username} />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '2px dashed #eee', borderRadius: '12px' }}>
          <p>Enter a stream key above to start watching</p>
        </div>
      )}
    </div>
  );
};

export default WatchStream;

import React from 'react';

const Dashboard = ({ username, onNavigate, onLogout }) => {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Hello, {username}!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>What would you like to do today?</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div 
          className="card" 
          style={{ cursor: 'pointer', border: '2px solid transparent', transition: 'var(--transition)' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          onClick={() => onNavigate('stream')}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
          <h3>Go Live</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Start broadcasting your camera to the world</p>
        </div>

        <div 
          className="card" 
          style={{ cursor: 'pointer', border: '2px solid transparent', transition: 'var(--transition)' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          onClick={() => onNavigate('watch')}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📺</div>
          <h3>Watch Streams</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Join other people's live broadcasts</p>
        </div>
      </div>

      <button 
        className="btn-secondary" 
        style={{ marginTop: '2rem' }} 
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;

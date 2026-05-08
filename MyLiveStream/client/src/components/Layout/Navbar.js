import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav style={{ 
      background: 'white', 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      boxShadow: 'var(--shadow)',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>⚡</span>
        <h1 style={{ margin: 0, fontSize: '1.2rem', background: 'linear-gradient(45deg, var(--primary-color), #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          MyLiveStream
        </h1>
      </div>
      
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Logged in as <strong>{user.username}</strong></span>
          <button className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={onLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

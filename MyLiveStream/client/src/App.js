import React, { useState } from 'react';
import './styles/App.css';
import AuthForm from './components/Auth/AuthForm';
import Dashboard from './components/Dashboard/Dashboard';
import Streamer from './components/Stream/Streamer';
import WatchStream from './components/Stream/WatchStream';
import Navbar from './components/Layout/Navbar';

const App = () => {
  const [user, setUser] = useState(null); // { token, streamKey, username }
  const [view, setView] = useState('menu'); // menu, stream, watch

  const handleLoginSuccess = (token, streamKey, username) => {
    setUser({ token, streamKey, username });
    setView('menu');
  };

  const logout = () => {
    setUser(null);
    setView('menu');
  };

  return (
    <div className="app-container">
      <Navbar user={user} onLogout={logout} />
      
      <main className="container">
        {!user ? (
          <AuthForm onLoginSuccess={handleLoginSuccess} />
        ) : view === 'menu' ? (
          <Dashboard 
            username={user.username} 
            onNavigate={setView} 
            onLogout={logout} 
          />
        ) : view === 'stream' ? (
          <Streamer 
            username={user.username}
            onBack={() => setView('menu')} 
          />
        ) : view === 'watch' ? (
          <WatchStream 
            username={user.username}
            onBack={() => setView('menu')} 
          />
        ) : null}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        &copy; 2026 MyLiveStream. Built with ❤️ for streamers.
      </footer>
    </div>
  );
};

export default App;

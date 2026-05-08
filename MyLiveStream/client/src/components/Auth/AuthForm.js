import React, { useState } from 'react';
import axios from 'axios';

const AuthForm = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const res = await axios.post(`http://localhost:5001${endpoint}`, { username, password });
      if (isLogin) {
        onLoginSuccess(res.data.token, res.data.streamKey, username);
      } else {
        alert('Registered successfully! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
      {error && <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <span 
          style={{ color: 'var(--primary-color)', cursor: 'pointer', marginLeft: '0.5rem', fontWeight: 'bold' }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Register' : 'Login'}
        </span>
      </p>
    </div>
  );
};

export default AuthForm;

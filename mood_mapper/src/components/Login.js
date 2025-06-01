import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleError } from '../utils/errorHandling';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, error: authError, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    createStars();
    createPlanets();
  }, []);

  const createStars = () => {
    const container = document.querySelector('.login-container');
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Random size
      const size = Math.random() * 2;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Random animation delay
      star.style.animationDelay = `${Math.random() * 4}s`;
      
      container.appendChild(star);
    }
  };

  const createPlanets = () => {
    const planetsContainer = document.querySelector('.planets-container');
    const planetPositions = [
      { top: '10%', left: '10%', delay: 0 },
      { top: '20%', right: '15%', delay: 1 },
      { bottom: '15%', left: '20%', delay: 2 },
      { top: '30%', right: '25%', delay: 3 },
      { bottom: '25%', right: '20%', delay: 4 },
      { top: '15%', left: '30%', delay: 5 },
      { bottom: '20%', right: '30%', delay: 6 },
      { top: '25%', left: '25%', delay: 7 }
    ];

    planetPositions.forEach((pos, index) => {
      const planet = document.createElement('div');
      planet.className = `floating-planet planet-${index + 1}`;
      planet.style.animationDelay = `${pos.delay}s`;
      Object.entries(pos).forEach(([key, value]) => {
        if (key !== 'delay') {
          planet.style[key] = value;
        }
      });
      planetsContainer.appendChild(planet);
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      if (isRegistering) {
        if (!username.trim()) {
          throw new Error('Please enter a username');
        }
        await register(email, password, username);
      } else {
        await login(email, password);
      }
    } catch (error) {
      handleError(error, setError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="planets-container"></div>
      <div className="login-content">
        <h1 className="app-title">Mood Mapper</h1>
        <div className="login-box">
          <h2>{isRegistering ? 'Create Account' : 'Login'}</h2>
          {(error || authError) && (
            <div className="error-message">
              {error || authError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your username"
                />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isRegistering ? 'Register' : 'Login')}
            </button>
          </form>
          <button 
            className="toggle-btn"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            disabled={loading}
          >
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
} 
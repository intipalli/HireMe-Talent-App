import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = ({ setLoggedIn }) => {
    const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 
    try {
      const response = await axios.post('http://localhost:8080/login', { username, password });
      const user = await response.data;
      if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        setLoggedIn(true);

        if (user.type === 'admin') {
          navigate('/admin-dashboard');
        } else if (user.type === 'manager') {
          navigate('/manager-dashboard');
        } else if (user.type === 'candidate') {
          navigate('/candidate-dashboard');
        }
      } else {
        setError('Invalid login credentials');
      }
    } catch (error) {
      setError('Error during login');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleLogin}>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="form-group mb-3">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary btn-block">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

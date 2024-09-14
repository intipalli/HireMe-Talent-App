import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserCreateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    type: 'candidate', // default type
    
  });

  useEffect(() => {
    if (id) {
      // Fetch user data for editing
      axios.get(`http://localhost:8080/users/${id}`)
        .then(response => setUser(response.data))
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id) {
      // Update existing user
      axios.put(`http://localhost:8080/users/${id}`, user)
        .then(response => {
          alert('User updated successfully!');
          navigate('/admin-dashboard');
        })
        .catch(error => console.error('Error updating user:', error));
    } else {
      // Create new user
      axios.post('/users', user)
        .then(response => {
          alert('User created successfully!');
          navigate('/admin-dashboard');
        })
        .catch(error => console.error('Error creating user:', error));
    }
  };

  return (
    <div className="container mt-5">
      <h2>{id ? 'Edit User' : 'Create User'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            className="form-control"
            name="username"
            value={user.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select
            className="form-control"
            name="type"
            value={user.type}
            onChange={handleChange}
            required
          >
            <option value="candidate">Candidate</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">{id ? 'Update User' : 'Create User'}</button>
      </form>
    </div>
  );
}

export default UserCreateEdit;

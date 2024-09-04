import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CandidateProfile() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleProfileSubmission = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const user = JSON.parse(localStorage.getItem('loggedInUser'));

    //FormData object to handle file upload
    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('phone', phone);
    if (resume) {
      formData.append('resume', resume);
    }

    try {
      await axios.post('http://localhost:8080/candidates/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Profile created successfully!');
      setTimeout(() => {
        navigate('/candidate-dashboard');
      }, 2000);
    } catch (error) {
      setError('Error creating profile.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-sm" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="card-title text-center mb-4">Complete Your Profile</h2>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="alert">{success}</div>}
        <form onSubmit={handleProfileSubmission}>
          <div className="mb-3">
            <label className="form-label">Full Name:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Resume:</label>
            <input
              type="file"
              onChange={(e) => setResume(e.target.files[0])}
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Save Profile</button>
        </form>
      </div>
    </div>
  );
}

export default CandidateProfile;

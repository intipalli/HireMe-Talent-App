import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [candidate, setCandidate] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (loggedInUser) {
        try {
          const candidateResponse = await axios.get(`http://localhost:8080/candidates/${loggedInUser.id}`);
          setCandidate(candidateResponse.data);

          setFullName(candidateResponse.data.fullName);
          setEmail(candidateResponse.data.email);
          setAddress(candidateResponse.data.address);
          setPhone(candidateResponse.data.phone);

          //resume URL download endpoint
          if (candidateResponse.data.resume) {
            const resumeResponse = await axios.get(`http://localhost:8080/candidates/${loggedInUser.id}/resume`, { responseType: 'blob' });
            const resumeBlobUrl = URL.createObjectURL(resumeResponse.data);
            setResumeUrl(resumeBlobUrl);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('phone', phone);
    if (resume) {
      formData.append('resume', resume);
    }

    try {
      const response = await axios.put(`http://localhost:8080/candidates/${loggedInUser.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setSuccess('Profile updated successfully!');
      } else {
        setError('Profile update failed. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        setError(`Error updating profile: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        setError('No response from server. Please try again.');
      } else {
        setError(`Error: ${error.message}`);
      }
      console.error('Error updating profile:', error);
    }
  };

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]);
  };

  return (
    <div className="container mt-5">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}
      <h2 className='text-primary'>Profile</h2>

      <div className="card p-4 shadow-lg">
      <form onSubmit={handleUpdateProfile}>
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
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Resume:</label>
          {resumeUrl && (
            <div>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">Download Current Resume</a>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeChange}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">Update Profile</button>
      </form>
      </div>
    </div>
  );
};

export default Profile;

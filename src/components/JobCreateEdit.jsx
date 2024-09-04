import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function JobCreateEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState({
    jobDescription: '',
    department: '',
    managerId: '', 
    jobTitle: '',
    additionalInformation: '',
    listingStatus: 'OPEN',
    dateListed: new Date().toISOString(),
    dateClosed: null,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    const storedManagerId = user?.id; 

    if (storedManagerId) {
      setJob(prevJob => ({
        ...prevJob,
        managerId: storedManagerId
      }));
    }

    if (id) {
      // Fetch job data for editing
      axios.get(`http://localhost:8080/jobs/${id}`)
        .then(response => setJob(response.data))
        .catch(error => console.error('Error fetching job data:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (id) {
      // Update existing job
      axios.put(`http://localhost:8080/jobs/${id}`, job)
        .then(() => {
          setMessage('Job updated successfully!');
          setTimeout(() => navigate('/manager-dashboard'), 2000);
        })
        .catch(error => {
          setError('Error updating job.');
          console.error('Error updating job:', error);
        });
    } else {
      // Create new job
      axios.post('http://localhost:8080/jobs', job)
        .then(() => {
          setMessage('Job created successfully!');
          setJob({
            jobDescription: '',
            department: '',
            managerId: job.managerId, 
            jobTitle: '',
            additionalInformation: '',
            listingStatus: 'OPEN',
            dateListed: new Date().toISOString(),
            dateClosed: null,
          }); // Clearing the form
          setTimeout(() => navigate('/manager-dashboard'), 2000); 
        })
        .catch(error => {
          setError('Error creating job.');
          console.error('Error creating job:', error);
        });
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4 text-primary">{id ? 'Edit Job' : 'Create Job'}</h2>
          <form onSubmit={handleSubmit}>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label htmlFor="jobTitle">Job Title</label>
              <input
                type="text"
                className="form-control"
                id="jobTitle"
                name="jobTitle"
                value={job.jobTitle}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">
                Please provide a job title.
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="jobDescription">Job Description</label>
              <textarea
                className="form-control"
                id="jobDescription"
                name="jobDescription"
                value={job.jobDescription}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">
                Please provide a job description.
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                className="form-control"
                id="department"
                name="department"
                value={job.department}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">
                Please provide a department.
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="additionalInformation">Additional Information</label>
              <textarea
                className="form-control"
                id="additionalInformation"
                name="additionalInformation"
                value={job.additionalInformation}
                onChange={handleChange}
              />
            </div>
            <br />
            <button type="submit" className="btn btn-primary">{id ? 'Update Job' : 'Create Job'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JobCreateEdit;

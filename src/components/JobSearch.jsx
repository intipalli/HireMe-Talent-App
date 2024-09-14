import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JobSearch = ({ onApplyClick, userId }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [departments, setDepartments] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch jobs
    axios.get('http://localhost:8080/jobs')
      .then(response => {

        const openJobs = response.data.filter(job => job.listingStatus === 'OPEN');
        console.log(openJobs);
        setJobs(openJobs);
        setFilteredJobs(openJobs);
        const uniqueDepartments = [...new Set(openJobs.map(job => job.department))];
        setDepartments(['ALL', ...uniqueDepartments]);
      })
      .catch(error => console.error('Error fetching jobs:', error));
    
    // Fetch user applications
    const fetchUserApplications = async () => {
      if (userId) {
        try {
          const response = await axios.get(`http://localhost:8080/applications/candidate/${userId}`);
          if(response)
            setUserApplications(response.data.map(app => app.jobId)); 
          else
            return;
        } catch (error) {
          console.error('Error fetching applications:', error);
        }
      }
    };

    fetchUserApplications();
  }, [userId]);

  useEffect(() => {
    let filtered = jobs.filter(job =>
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedDepartment !== 'ALL') {
      filtered = filtered.filter(job => job.department === selectedDepartment);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedDepartment, jobs]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleApplyClick = (jobId) => {
    if (!userId) {
      navigate('/login');
    } else {
      onApplyClick(jobId); 
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4 text-primary">Search Jobs</h2>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <input
          type="text"
          className="form-control"
          placeholder="Search by title or description"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select className="form-select" value={selectedDepartment} onChange={handleDepartmentChange}>
          <option value="ALL">All Departments</option>
          {departments.map(department => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
      </div>

      <div className="job-listings">
        {filteredJobs.length > 0 ? (
          <ul className="list-group">
            {filteredJobs.map(job => (
              <li
                key={job.id}
                className="list-group-item"
                onClick={() => setSelectedJob(job.id === selectedJob ? null : job.id)}
                style={{ cursor: 'pointer' }}
              >
                <h5 className={`mb-1 ${job.listingStatus === 'CLOSED' ? 'text-danger' : 'text-success'}`}>
                  {job.jobTitle}
                </h5>
                <h6 className="mb-2">Department: {job.department}</h6>
                {selectedJob === job.id && (
                  <div>
                    <p className="mb-1">Description: {job.jobDescription}</p>
                    {job.additionalInformation && <p className="mb-1">Additional Information: {job.additionalInformation}</p>}
                    <button
                      className={`btn mt-2 ${userApplications.includes(job.id) ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => userApplications.includes(job.id) ? null : handleApplyClick(job.id)}
                      disabled={userApplications.includes(job.id)}
                    >
                      {userApplications.includes(job.id) ? 'Already Applied' : 'Apply'}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default JobSearch;

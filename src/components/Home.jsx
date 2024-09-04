import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Home() {

    const navigate = useNavigate();

    const handleSearchJobsClick = (jobId) => {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!user) {
          navigate('/login');
        } else {
            navigate('/candidate-dashboard');
        }
      };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h2 className="display-4 mb-4">Welcome to the Talent Recruitment Portal</h2>
          <p className="lead">Please login or register to apply for job.</p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Register</Link>
            <button onClick={handleSearchJobsClick} className="btn btn-info">Search Jobs</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

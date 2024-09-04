import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobSearch from './JobSearch';

const CandidateDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [user, setUser] = useState(null);
    const [resume, setResume] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Fetch user profile
        const fetchUserProfile = async () => {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (loggedInUser) {
                try {
                    const response = await axios.get(`http://localhost:8080/candidates/${loggedInUser.id}`);
                    setUser(response.data);
                    setResume(response.data.resume);
                } catch (error) {
                    console.error('Error fetching profile:', error);
                }
            }
        };

        // Fetch candidate applications
        const fetchApplications = async () => {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (loggedInUser) {
                try {
                    const response = await axios.get(`http://localhost:8080/applications/candidate/${loggedInUser.id}`);
                    setApplications(response.data);
                } catch (error) {
                    console.error('Error fetching applications:', error);
                }
            }
        };

        fetchUserProfile();
        fetchApplications();
    }, []);

    const handleApplyForJob = async (jobId) => {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (!loggedInUser) {
            // User is not logged in
            alert('You must be logged in to apply for a job.');
            window.location.href = '/login'; // Redirect to login page
            return;
        }

        if (!user || !resume) {
            setError('Your profile is not complete. Please ensure your profile is updated with resume.');
            return;
        }

        try {
            const application = {
                userId: loggedInUser.id,
                jobId,
                dateApplied: new Date().toISOString(),
                coverLetter: '',
                customResume: resume,
                applicationStatus: 'APPLIED'
            };

            await axios.post('http://localhost:8080/applications', application);
            setSuccess('Application submitted successfully!');
            const response = await axios.get(`http://localhost:8080/applications/candidate/${loggedInUser.id}`);
            setApplications(response.data);
        } catch (error) {
            setError('Error applying for job.');
            console.error('Error applying for job:', error);
        }
    };

    const handleWithdrawApplication = async (applicationId) => {
        if (!applicationId) {
            setError('Invalid application ID.');
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/applications/${applicationId}`);
            setSuccess('Application withdrawn successfully!');

            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

            try {
                const response = await axios.get(`http://localhost:8080/applications/candidate/${loggedInUser.id}`);

                if (response.status === 200) {
                    setApplications(response.data);
                } else {
                    setError('Unexpected response status while fetching applications.');
                }
            } catch (fetchError) {
                if (fetchError.response?.status === 404) {
                    setError('No applications found for this user.');
                    setApplications([])
                } else {
                    setError('Error fetching applications.');
                }
                console.error('Error fetching applications:', fetchError);
            }
        } catch (error) {
            setError('Error withdrawing application.');
            console.error('Error withdrawing application:', error);
        }
    };


    return (
        <div className="container mt-5">
            {/* <h4 className='mb-4 text-primary'>Candidate Dashboard</h4> */}
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {success && <div className="alert alert-success" role="alert">{success}</div>}
            <div className="card p-4 shadow-lg">
                <JobSearch onApplyClick={handleApplyForJob} userId={user?.id} />
            </div>

            <div className="mt-4 card p-4 shadow-lg">
                <h3 className='text-primary'>Your Applications</h3>
                <br />
                {applications.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr className=''>
                                    <th>Job Title</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(({ application, job }) => (
                                    <tr key={application.id}>
                                        <td>{job?.jobTitle || 'N/A'}</td>
                                        <td>{job?.department || 'N/A'}</td>
                                        <td>
                                            {application.applicationStatus === 'APPLIED' ? (
                                                <strong className="text-success">{application.applicationStatus}</strong>
                                            ) : (
                                                application.applicationStatus
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleWithdrawApplication(application.id)}
                                            >
                                                Withdraw Application
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center">No applications found.</p>
                )}
            </div>
        </div>
    );
};

export default CandidateDashboard;

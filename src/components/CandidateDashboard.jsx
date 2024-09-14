import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobSearch from './JobSearch';
import { Modal, Button } from 'react-bootstrap';

const CandidateDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [user, setUser] = useState(null);
    const [resume, setResume] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [applicationToDelete, setApplicationToDelete] = useState(null);

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    useEffect(() => {
        // Fetch user profile
        const fetchUserProfile = async () => {
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

        console.log(user);
        

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

        // Check if the user has already applied for this job
        const alreadyApplied = applications.some(application => application.job?.id === jobId);

        if (alreadyApplied) {
            setError('You have already applied for this job.');
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

    const handleWithdrawApplication = async () => {
        if (!applicationToDelete) {
            setError('Invalid application ID.');
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/applications/${applicationToDelete}`);
            setSuccess('Application withdrawn successfully!');
            setShowConfirmModal(false);

            const response = await axios.get(`http://localhost:8080/applications/candidate/${loggedInUser.id}`);
            setApplications(response.data);
        } catch (error) {
            setError('Error withdrawing application.');
            console.error('Error withdrawing application:', error);
        }
    };

    const confirmWithdrawApplication = (applicationId) => {
        setApplicationToDelete(applicationId);
        setShowConfirmModal(true);
    };

    const handleCloseModal = () => {
        setShowConfirmModal(false);
        setApplicationToDelete(null);
    };

    return (
        <div className="container mt-5">
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {success && <div className="alert alert-success" role="alert">{success}</div>}
            <div className="card p-4 shadow-lg">
                <JobSearch onApplyClick={handleApplyForJob} userId={loggedInUser.id} />
            </div>

            <div className="mt-4 card p-4 shadow-lg">
                <h3 className='text-primary'>Your Applications</h3>
                <br />
                {applications.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
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
                                            {application.applicationStatus === 'APPLIED' || application.applicationStatus === 'Accepted' ? (
                                                <strong className="text-success">{application.applicationStatus}</strong>
                                            ) : (
                                                <strong className="text-danger">{application.applicationStatus}</strong>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => confirmWithdrawApplication(application.id)}
                                                disabled={application.applicationStatus === 'Accepted' || application.applicationStatus === 'Rejected'}
                                            >
                                                {application.applicationStatus === 'Accepted' || application.applicationStatus === 'Rejected' ? 'Withdraw/Delete' : 'Withdraw Application'}
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

            {/* Bootstrap Modal for Confirming Withdraw/Delete */}
            <Modal show={showConfirmModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Action</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to withdraw/delete this application?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleWithdrawApplication}>
                        Confirm Withdraw/Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CandidateDashboard;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ApplicationsView() {
    const { jobId } = useParams();
    const [applications, setApplications] = useState([]);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8080/applications/job/${jobId}`)
            .then(response => setApplications(response.data))
            .catch(error => {
                setNotification({ type: 'danger', message: 'Error fetching applications.' });
                console.error('Error fetching applications:', error);
            });
    }, [jobId]);

    const handleUpdateStatus = (applicationId, status) => {
        axios.patch(`http://localhost:8080/applications/${applicationId}`, { applicationStatus: status })
            .then(() => {
                setApplications(applications.map(app =>
                    app.id === applicationId ? { ...app, applicationStatus: status } : app
                ));
                setNotification({ type: 'success', message: 'Application status updated!' });
            })
            .catch(error => {
                setNotification({ type: 'danger', message: 'Error updating application status.' });
                console.error('Error updating application status:', error);
            });
    };

    const handleResumeClick = async (id) => {
        try {
            const resumeResponse = await axios.get(`http://localhost:8080/candidates/${id}/resume`, { responseType: 'blob' });
            const resumeBlobUrl = URL.createObjectURL(resumeResponse.data);
            const a = document.createElement('a');
            a.href = resumeBlobUrl;
            a.download = 'resume.pdf'; // You can set a dynamic name if needed
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error fetching resume:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className='text-primary'>Applications for Job ID: {jobId}</h2>
            {notification && (
                <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
                    {notification.message}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}
            <div className="card p-4 shadow-lg">
                {applications.length > 0 ? (
                    <ul className="list-group">
                        {applications.map(app => (
                            <li className="list-group-item" key={app.id}>
                                <h5 className="mb-1">User Id: {app.userId}</h5>
                                <p className="mb-1">Date applied: {app.dateApplied}</p>
                                <button 
                                    className="btn btn-link" 
                                    onClick={() => handleResumeClick(app.userId)}
                                >
                                    Download Resume
                                </button>
                                <p className="mb-1">Status: {app.applicationStatus}</p>

                                <div className="btn-group">
                                    <button 
                                        className="btn btn-success btn-sm rounded" 
                                        onClick={() => handleUpdateStatus(app.id, 'Accepted')}
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm rounded" 
                                        onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No applications found.</p>
                )}
            </div>
        </div>
    );
}

export default ApplicationsView;

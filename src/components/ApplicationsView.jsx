import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ApplicationsView() {
    const { jobId } = useParams();
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [notification, setNotification] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8080/applications/job/${jobId}`)
            .then(response => {
                setApplications(response.data);
                setFilteredApplications(response.data);
            })
            .catch(error => {
                setNotification({ type: 'danger', message: 'Error fetching applications.' });
                console.error('Error fetching applications:', error);
            });
    }, [jobId]);

    useEffect(() => {
        let filtered = applications;

        if (selectedStatus !== 'ALL') {
            filtered = filtered.filter(app => app.applicationStatus === selectedStatus);
        }

        setFilteredApplications(filtered);
    }, [selectedStatus, applications]);

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const handleUpdateStatus = (applicationId, status) => {
        axios.patch(`http://localhost:8080/applications/${applicationId}`, { applicationStatus: status })
            .then(() => {
                setApplications(applications.map(app =>
                    app.id === applicationId ? { ...app, applicationStatus: status } : app
                ));
                setFilteredApplications(filteredApplications.map(app =>
                    app.id === applicationId ? { ...app, applicationStatus: status } : app
                ));
                setNotification({ type: 'success', message: 'Application status updated!' });
                setShowConfirmModal(false);
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
            window.open(resumeBlobUrl, '_blank');
        } catch (error) {
            console.error('Error fetching resume:', error);
        }
    };

    const handleConfirmAction = () => {
        if (modalAction === 'accept') {
            handleUpdateStatus(selectedApplicationId, 'Accepted');
        } else if (modalAction === 'reject') {
            handleUpdateStatus(selectedApplicationId, 'Rejected');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted':
                return 'text-success';
            case 'Rejected':
                return 'text-danger';
            case 'APPLIED':
                return 'text-warning';
            default:
                return 'text-secondary';
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-primary">Applications for Job ID: {jobId}</h2>

            {notification && (
                <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
                    {notification.message}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}

            <div className="card p-4 shadow-lg">
                <div className="mb-4">
                    <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
                    <select
                        id="statusFilter"
                        className="form-select"
                        value={selectedStatus}
                        onChange={handleStatusChange}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="APPLIED">APPLIED</option>
                    </select>
                </div>

                <div className="table-responsive" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <table className="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>User Id</th>
                                <th>Date Applied</th>
                                <th>Status</th>
                                <th>Resume</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.length > 0 ? (
                                filteredApplications.map(app => (
                                    <tr key={app.id}>
                                        <td>{app.userId}</td>
                                        <td>{new Date(app.dateApplied).toLocaleDateString()}</td>
                                        <td className={getStatusColor(app.applicationStatus)}>
                                            <strong>{app.applicationStatus}</strong>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-link"
                                                onClick={() => handleResumeClick(app.userId)}
                                            >
                                                View Resume
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-success btn-sm rounded"
                                                onClick={() => {
                                                    setSelectedApplicationId(app.id);
                                                    setModalAction('accept');
                                                    setShowConfirmModal(true);
                                                }}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm rounded ms-2"
                                                onClick={() => {
                                                    setSelectedApplicationId(app.id);
                                                    setModalAction('reject');
                                                    setShowConfirmModal(true);
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">No applications found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-labelledby="confirmModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="confirmModalLabel">Confirm Action</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    {modalAction === 'accept' && 'Are you sure you want to accept this application?'}
                                    {modalAction === 'reject' && 'Are you sure you want to reject this application?'}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                                    <button type="button" className="btn btn-primary" onClick={handleConfirmAction}>Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ApplicationsView;

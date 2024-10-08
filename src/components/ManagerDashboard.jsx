import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

function ManagerDashboard() {
    const [jobListings, setJobListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedDepartment, setSelectedDepartment] = useState('ALL');
    const [departments, setDepartments] = useState([]);
    const [notification, setNotification] = useState(null);
    const [expandedJobIds, setExpandedJobIds] = useState(new Set());

    // State for managing modal visibility and job ID for actions
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        const managerId = user?.id;

        if (managerId) {
            axios.get(`http://localhost:8080/jobs/manager/${managerId}`)
                .then(response => {
                    setJobListings(response.data);
                    setFilteredListings(response.data);
                    const uniqueDepartments = [...new Set(response.data.map(job => job.department))];
                    setDepartments(['ALL', ...uniqueDepartments]);
                })
                .catch(error => console.error('Error fetching job listings:', error));
        }
    }, []);

    useEffect(() => {
        let filtered = jobListings.filter(job =>
            job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.jobDescription.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (selectedStatus !== 'ALL') {
            filtered = filtered.filter(job => job.listingStatus === selectedStatus);
        }

        if (selectedDepartment !== 'ALL') {
            filtered = filtered.filter(job => job.department === selectedDepartment);
        }

        setFilteredListings(filtered);
    }, [searchTerm, selectedStatus, selectedDepartment, jobListings]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
    };

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
    };

    const handleCloseJob = (jobId) => {
        axios.put(`http://localhost:8080/jobs/${jobId}`, { listingStatus: 'CLOSED', dateClosed: new Date().toISOString() })
            .then(() => {
                setJobListings(jobListings.map(job =>
                    job.id === jobId ? { ...job, listingStatus: 'CLOSED', dateClosed: new Date().toISOString() } : job
                ));
                setFilteredListings(filteredListings.map(job =>
                    job.id === jobId ? { ...job, listingStatus: 'CLOSED', dateClosed: new Date().toISOString() } : job
                ));
                setNotification({ type: 'success', message: 'Job closed successfully!' });
                setShowModal(false);
            })
            .catch(error => {
                setNotification({ type: 'danger', message: 'Error closing job.' });
                console.error('Error closing job:', error);
            });
    };

    const handleReopenJob = (jobId) => {
        axios.put(`http://localhost:8080/jobs/${jobId}`, { listingStatus: 'OPEN', dateClosed: null })
            .then(() => {
                setJobListings(jobListings.map(job =>
                    job.id === jobId ? { ...job, listingStatus: 'OPEN', dateClosed: null } : job
                ));
                setFilteredListings(filteredListings.map(job =>
                    job.id === jobId ? { ...job, listingStatus: 'OPEN', dateClosed: null } : job
                ));
                setNotification({ type: 'success', message: 'Job reopened successfully!' });
            })
            .catch(error => {
                setNotification({ type: 'danger', message: 'Error reopening job.' });
                console.error('Error reopening job:', error);
            });
    };

    const handleDeleteJob = (jobId) => {
        axios.delete(`http://localhost:8080/jobs/${jobId}`)
            .then(() => {
                setJobListings(jobListings.filter(job => job.id !== jobId));
                setFilteredListings(filteredListings.filter(job => job.id !== jobId));
                setNotification({ type: 'success', message: 'Job deleted successfully!' });
                setShowModal(false);
            })
            .catch(error => {
                setNotification({ type: 'danger', message: 'Error deleting job.' });
                console.error('Error deleting job:', error);
            });
    };

    const handleShowModal = (action, jobId) => {
        setModalAction(action);
        setSelectedJobId(jobId);
        setShowModal(true);
    };

    const handleConfirmAction = () => {
        if (modalAction === 'close') {
            handleCloseJob(selectedJobId);
        } else if (modalAction === 'delete') {
            handleDeleteJob(selectedJobId);
        }
    };

    const toggleJobDetails = (jobId) => {
        setExpandedJobIds(prev => {
            const newExpandedJobIds = new Set(prev);
            if (newExpandedJobIds.has(jobId)) {
                newExpandedJobIds.delete(jobId);
            } else {
                newExpandedJobIds.add(jobId);
            }
            return newExpandedJobIds;
        });
    };

    return (
        <div className="container mt-5">
            <h2 className='text-primary'>Manager Dashboard</h2>
            <br />
            <div className="card p-4 shadow-lg">
                <div>
                    <Link to="/job-create" className="btn btn-primary mb-3">Create New Job</Link>
                </div>

                <div className="mb-4 d-flex justify-content-between align-items-center">
                    <input
                        type="text"
                        className="form-control mr-2"
                        placeholder="Search by title or description"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <div className="btn-group">
                        <select className="btn btn-white dropdown-toggle" value={selectedStatus} onChange={handleStatusChange}>
                            <option value="ALL">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                        <select className="btn btn-white dropdown-toggle" value={selectedDepartment} onChange={handleDepartmentChange}>
                            <option value="ALL">All Departments</option>
                            {departments.map(department => (
                                <option key={department} value={department}>{department}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {notification && (
                    <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
                        {notification.message}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                )}

                <div className="job-listings" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    {filteredListings.length > 0 ? (
                        <ul className="list-group">
                            {filteredListings.map(job => (
                                <li className={`list-group-item ${job.listingStatus === 'CLOSED' ? 'bg-light' : ''}`} key={job.id}>
                                    <h5 className={`mb-1 ${job.listingStatus === 'CLOSED' ? 'text-danger' : 'text-success'}`}>
                                        {job.jobTitle}
                                    </h5>
                                    <h6 className="mb-2">Department: {job.department}</h6>
                                    <p className="mb-1">Description: {expandedJobIds.has(job.id) ? job.jobDescription : `${job.jobDescription.substring(0, 100)}...`}</p>
                                    {expandedJobIds.has(job.id) && job.additionalInformation && (
                                        <p className="mb-1">Additional Information: {job.additionalInformation}</p>
                                    )}
                                    {expandedJobIds.has(job.id) && (
                                        <>
                                            <p className="mb-1"><small className="text-muted">Date Listed: {new Date(job.dateListed).toLocaleDateString()}</small></p>
                                            {job.dateClosed && <p className="mb-1"><small className="text-muted">Date Closed: {new Date(job.dateClosed).toLocaleDateString()}</small></p>}
                                        </>
                                    )}
                                    
                                    <div className="mb-2">
                                        <button className="btn btn-warning btn-sm rounded" onClick={() => toggleJobDetails(job.id)}>
                                            {expandedJobIds.has(job.id) ? 'Show Less' : 'More Details/Actions'}
                                        </button>
                                    </div>

                                    {expandedJobIds.has(job.id) && (
                                        <div className="btn-group">
                                            {job.listingStatus === 'OPEN' ? (
                                                <>
                                                    <Link to={`/applications/${job.id}`} className="btn btn-success btn-sm rounded">See Applications</Link>
                                                    <button className="btn btn-secondary btn-sm rounded" onClick={() => handleShowModal('close', job.id)}>Close</button>
                                                    <button className="btn btn-danger btn-sm rounded" onClick={() => handleShowModal('delete', job.id)}>Delete</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn btn-success btn-sm rounded" onClick={() => handleReopenJob(job.id)}>Reopen</button>
                                                    <button className="btn btn-danger btn-sm rounded" onClick={() => handleShowModal('delete', job.id)}>Delete</button>
                                                </>
                                            )}
                                            <Link to={`/job-edit/${job.id}`} className="btn btn-primary btn-sm ml-2">Edit</Link>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No job listings found.</p>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Action</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalAction === 'close' && 'Are you sure you want to close this job?'}
                    {modalAction === 'delete' && 'Are you sure you want to delete this job?'}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirmAction}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default ManagerDashboard;

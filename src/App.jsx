import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Registration from './components/Registration';
import CandidateProfile from './components/CandidateProfile';
import CandidateDashboard from './components/CandidateDashboard';
import ManagerDashboard from './components/ManagerDashboard';
// import AdminDashboard from './components/AdminDashboard';
import JobCreateEdit from './components/JobCreateEdit';
import UserCreateEdit from './components/UserCreateEdit';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile'; 
import getLoggedInUser from './services/authService';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import JobSearch from './components/JobSearch';
import ApplicationsView from './components/ApplicationsView';


function App() {
  const user = getLoggedInUser(); // Get the current user details (role included)
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    setLoggedIn(!!user);
  }, []);
  
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
        <main className="flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home setLoggedIn={setLoggedIn} />} />
            <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
            <Route path="/register" element={<Registration />} />

            {/* Candidate Routes */}
            <Route
              path="/candidate-dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={['candidate']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user} allowedRoles={['candidate', 'manager', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/manager-dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={['manager']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-create"
              element={
                <ProtectedRoute user={user} allowedRoles={['manager']}>
                  <JobCreateEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-edit/:id"
              element={
                <ProtectedRoute user={user} allowedRoles={['manager']}>
                  <JobCreateEdit />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            {/* <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute user={user} allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-create"
              element={
                <ProtectedRoute user={user} allowedRoles={['admin']}>
                  <UserCreateEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-edit/:id"
              element={
                <ProtectedRoute user={user} allowedRoles={['admin']}>
                  <UserCreateEdit />
                </ProtectedRoute>
              }
            /> */}

        <Route path="/complete-profile" element={<CandidateProfile />} />
        <Route path="/jobs" element={<JobSearch />} />
        <Route path="/applications/:jobId" element={<ApplicationsView />} />



          </Routes>
        </main>
        <Footer /> 
      </div>
    </Router>
  );
}

export default App;

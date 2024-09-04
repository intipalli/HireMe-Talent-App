import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/hireMe.png';
import { CiUser } from 'react-icons/ci'; // For Font Awesome's user icon


const Header = ({ loggedIn, setLoggedIn }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = () => {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (loggedInUser) {
        setUser(loggedInUser);
      } else {
        setUser(null); 
      }
    };
    fetchUser();
  }, [loggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setLoggedIn(false); 
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/"><img className="rounded" src={logo} width={130} height={40}/></Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          </ul>
          <div className="d-flex ms-auto">
            {loggedIn && user && (
              <div className="dropdown">
                <button 
                  className="btn btn-light dropdown-toggle" 
                  type="button" 
                  id="dropdownMenuButton" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false">
                <CiUser /> &nbsp;
                  {user.username}
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                  <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;

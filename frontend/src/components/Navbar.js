import React from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.png';
import api from '../api';

function Navbar({ user, onLogout }) {
  const handleLogout = async () => {
    try { await api.post('/api/auth/logout'); onLogout(); }
    catch { alert('Could not end the server session. Please retry.'); }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow sticky-top py-2 text-start">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/">
          <img src={logo} alt="Logo" width="60" height="60" className="me-2" style={{ objectFit: 'contain' }} />
          <span className="fs-3">AMS Helpers</span>
        </Link>

        <div className="ms-auto d-flex align-items-center">
          <Link to="/about" className="text-white text-decoration-none me-4 fw-bold">About Us</Link>
          <Link to="/browse-items" className="text-white text-decoration-none me-4 fw-bold">🔍 Browse Items</Link>

          {user ? (
            <>
              {user.role === 'Requester' && (
                <Link to="/my-requests" className="text-white text-decoration-none me-4 fw-bold">📋 My Requests</Link>
              )}

              {user.role === 'Donor' && (
                <Link to="/donor-requests" className="text-white text-decoration-none me-4 fw-bold">📥 Received Requests</Link>
              )}

              {user.role === 'Donor' && <Link to="/donate" className="text-white text-decoration-none me-4 fw-bold">🎁 Donate</Link>}
              <Link to="/profile" className="text-white text-decoration-none me-4 fw-bold">Profile</Link>

              <button onClick={handleLogout} className="btn btn-warning btn-sm rounded-pill px-4 fw-bold shadow-sm">Logout</button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-light btn-sm rounded-pill px-4 fw-bold">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

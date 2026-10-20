import React from 'react';
import { Link } from 'react-router-dom';

function Home({ user }) {
  // User ka role check karna (Default 'Donor' rakha hai agar role na mile)
  const userRole = user?.role || 'Donor'; 

  return (
    <div className="home-container text-center mt-5 p-4 animate__animated animate__fadeIn">
      {/* Animation Section */}
      <div className="animation-wrapper mb-4 d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <svg width="200" height="200" viewBox="0 0 24 24" fill="#198754" className="pulsating-heart">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>

      <h1 className="display-3 fw-bold text-success mb-3">
        Welcome, {user?.fullName || 'Shahbaz'}!
      </h1>
      <p className="lead text-muted mb-5 fs-4">
        You are logged in as a <strong>{userRole}</strong>.
      </p>

      <div className="d-flex justify-content-center gap-3">
        {/* Agar user 'Donor' hai toh sirf Donate Now dikhao */}
        {userRole === 'Donor' && (
          <Link to="/donate" className="btn btn-success btn-lg px-5 py-3 rounded-pill shadow-lg fw-bold border-0">
            🎁 Donate Now
          </Link>
        )}

        {/* Agar user 'Requester' hai toh sirf Request Now dikhao */}
        {userRole === 'Requester' && (
          <Link to="/browse-items" className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-lg fw-bold border-0">
            🤝 Request Now
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home;
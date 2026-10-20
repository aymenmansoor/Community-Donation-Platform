import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import DonationForm from './components/DonationForm';
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import About from './components/About';
import BrowseItems from './pages/BrowseItems'; 
import MyRequests from './pages/MyRequests'; 
import DonorRequests from './pages/DonorRequests'; // <-- Naya Import

import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [donations, setDonations] = useState([]);
  const [authMode, setAuthMode] = useState('signup'); 
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDonations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/donations');
      setDonations(res.data);
    } catch (err) { 
      console.error("Data fetch error:", err); 
    }
  };

  useEffect(() => { 
    fetchDonations(); 
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <div className="container mt-4">
        <Routes>
          {/* Auth Route */}
          <Route path="/auth" element={!user ? (
            <div className="auth-container d-flex flex-column align-items-center justify-content-center" style={{minHeight: '80vh'}}>
              <div className="card shadow-lg p-4" style={{width: '100%', maxWidth: '400px', borderRadius: '15px'}}>
                {authMode === 'signup' ? (
                  <>
                    <Signup setAuthMode={setAuthMode} /> 
                    <p className="text-center mt-3">Already have an account? <button className="btn btn-link text-success p-0 fw-bold text-decoration-none" onClick={() => setAuthMode('login')}>Login Here</button></p>
                  </>
                ) : (
                  <>
                    <Login />
                    <p className="text-center mt-3">Don't have an account? <button className="btn btn-link text-success p-0 fw-bold text-decoration-none" onClick={() => setAuthMode('signup')}>Sign Up Now</button></p>
                  </>
                )}
              </div>
            </div>
          ) : <Navigate to="/" />} />

          {/* Main Routes */}
          <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/auth" />} />
          <Route path="/about" element={<About />} />
          
          {/* Role Based Routes */}
          <Route path="/browse-items" element={user ? <BrowseItems /> : <Navigate to="/auth" />} />
          <Route path="/my-requests" element={user ? <MyRequests /> : <Navigate to="/auth" />} />
          <Route path="/donor-requests" element={user && user.role === 'Donor' ? <DonorRequests /> : <Navigate to="/auth" />} /> 

          <Route path="/profile" element={user ? <Profile donations={donations} user={user} fetchDonations={fetchDonations} /> : <Navigate to="/auth" />} />
          <Route path="/donate" element={user ? <DonationForm onPostSuccess={fetchDonations} /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
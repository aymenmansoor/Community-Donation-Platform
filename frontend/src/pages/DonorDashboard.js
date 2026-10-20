import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DonorDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // LocalStorage se login donor ka data nikalna
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Backend API se sirf is donor ke liye aayi requests mangwana
        const res = await axios.get(`http://localhost:5000/api/requests/donor/${user.email}`);
        setRequests(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setLoading(false);
      }
    };
    if (user && user.email) fetchRequests();
  }, [user.email]);

  // Status (Approve/Reject) update karne ka function
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/requests/${id}`, { status: newStatus });
      alert(`Request has been ${newStatus}!`);
      // List ko refresh karne ke liye
      setRequests(requests.map(req => req._id === id ? { ...req, status: newStatus } : req));
    } catch (err) {
      alert("Error updating status.");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading requests...</div>;

  return (
    <div className="container mt-5 text-start">
      <h2 className="text-success fw-bold mb-4 border-bottom pb-3">Donor Dashboard - Received Requests</h2>
      {requests.length === 0 ? (
        <div className="alert alert-info">Aapke kisi bhi item par abhi tak koi request nahi aayi.</div>
      ) : (
        <div className="row">
          {requests.map((req) => (
            <div className="col-md-6 mb-4" key={req._id}>
              <div className="card shadow-sm border-0 rounded-4 p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold text-primary">{req.itemId?.itemName}</h5>
                  <span className={`badge rounded-pill ${
                    req.status === 'Pending' ? 'bg-warning text-dark' : 
                    req.status === 'Approved' ? 'bg-success' : 'bg-danger'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <p className="mt-2 mb-1"><strong>Requested By:</strong> {req.requesterName}</p>
                <p className="text-muted small"><strong>Reason:</strong> {req.reason}</p>
                <hr />
                {req.status === 'Pending' && (
                  <div className="d-flex gap-2">
                    <button onClick={() => updateStatus(req._id, 'Approved')} className="btn btn-success btn-sm rounded-pill px-4">Approve</button>
                    <button onClick={() => updateStatus(req._id, 'Rejected')} className="btn btn-danger btn-sm rounded-pill px-4">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DonorDashboard;  
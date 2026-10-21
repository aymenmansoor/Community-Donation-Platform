import React, { useState, useEffect } from 'react';
import axios from './api';

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        // Backend se sirf is user ki requests lane ke liye API call
        const res = await axios.get(`/api/requests/user/${user._id}`);
        setRequests(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setLoading(false);
      }
    };
    fetchMyRequests();
  }, [user._id]);

  // Status ke mutabiq badge ka color change karne ke liye function
  const getStatusBadge = (status) => {
    if (status === 'Approved') return 'bg-success';
    if (status === 'Rejected') return 'bg-danger';
    return 'bg-warning text-dark'; // Default: Pending
  };

  if (loading) return <div className="text-center mt-5">Loading your requests...</div>;

  return (
    <div className="container mt-5 animate__animated animate__fadeIn">
      <h2 className="text-primary fw-bold mb-4 border-bottom pb-3">My Help Requests</h2>

      {requests.length > 0 ? (
        <div className="table-responsive shadow-sm rounded-4">
          <table className="table table-hover align-middle bg-white mb-0">
            <thead className="table-primary text-white">
              <tr>
                <th className="py-3">Item Name</th>
                <th className="py-3">Reason Provided</th>
                <th className="py-3">Date Requested</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td className="fw-bold">{req.itemId?.itemName || "Item Details Hidden"}</td>
                  <td className="text-muted small">{req.reason}</td>
                  <td>{new Date(req.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-5 bg-light rounded-4">
          <h4 className="text-muted">You haven't made any requests yet.</h4>
          <a href="/browse-items" className="btn btn-primary mt-3 rounded-pill px-4">Browse Items Now</a>
        </div>
      )}
    </div>
  );
}

export default MyRequests;

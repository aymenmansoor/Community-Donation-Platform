import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MyRequests() {
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchMyRequests = async () => {
            try {
                // Backend se user ki specific requests mangwana
                const res = await axios.get(`http://localhost:5000/api/requests/user/${user.id || user._id}`);
                setMyRequests(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching requests", err);
                setLoading(false);
            }
        };
        if (user) fetchMyRequests();
    }, [user]);

    if (loading) return <div className="text-center mt-5">Loading your requests...</div>;

    return (
        <div className="container mt-5 text-start">
            <h2 className="text-primary fw-bold mb-4 border-bottom pb-3">My Help Requests</h2>
            {myRequests.length === 0 ? (
                <div className="alert alert-info border-0 shadow-sm">Empty.</div>
            ) : (
                <div className="table-responsive shadow rounded-4 overflow-hidden">
                    <table className="table table-hover align-middle mb-0 bg-white">
                        <thead className="table-primary">
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>My Reason</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myRequests.map((req) => (
                                <tr key={req._id}>
                                    <td className="fw-bold">{req.itemId?.itemName || "Item Not Found"}</td>
                                    <td><span className="badge bg-light text-dark border">{req.itemId?.category || "N/A"}</span></td>
                                    <td className="text-muted small" style={{maxWidth: '200px'}}>{req.reason}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 ${
                                            req.status === 'Pending' ? 'bg-warning text-dark' : 
                                            req.status === 'Approved' ? 'bg-success' : 'bg-danger'
                                        }`}>
                                            {req.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="text-muted">{new Date(req.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default MyRequests;
import React, { useState, useEffect } from 'react';
import axios from '../api';

function DonorRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // Backend se sari requests mangwana
                const res = await axios.get('/api/requests');
                // Filter: Sirf wahi requests dikhao jo is donor ke items par hain
                const donorSpecific = res.data.filter(req => req.itemId?.donorEmail === user.email);
                setRequests(donorSpecific);
                setLoading(false);
            } catch (err) {
                console.error("Error", err);
                setLoading(false);
            }
        };
        fetchRequests();
    }, [user.email]);

    const updateStatus = async (id, status) => {
        try {
            const { data } = await axios.put(`/api/requests/${id}`, { status });
            setRequests(current => current.map(request => request._id === id ? data : request));
        } catch (error) { alert(error.response?.data?.message || 'Could not update request.'); }
    };

    if (loading) return <div className="text-center mt-5">Loading Requests...</div>;

    return (
        <div className="container mt-5 text-start">
            <h2 className="text-success fw-bold mb-4 border-bottom pb-3">Requests Received</h2>
            {requests.length === 0 ? (
                <div className="alert alert-light border shadow-sm">Koi request abhi tak nahi aayi.</div>
            ) : (
                <div className="row">
                    {requests.map((req) => (
                        <div className="col-md-6 mb-3" key={req._id}>
                            <div className="card shadow-sm border-0 rounded-4 p-3">
                                <div className="d-flex justify-content-between">
                                    <h5 className="fw-bold text-primary">{req.itemId?.itemName}</h5>
                                    <span className={`badge ${req.status === 'Approved' ? 'bg-success' : req.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>{req.status}</span>
                                </div>
                                <p className="mb-1"><b>Requester:</b> {req.requesterName}</p>
                                <p className="text-muted small"><b>Reason:</b> {req.reason}</p>
                                <div className="mt-2 d-flex gap-2">
                                    <button onClick={() => updateStatus(req._id, 'Approved')} disabled={req.status === 'Approved'} className="btn btn-success btn-sm rounded-pill px-3">Approve</button>
                                    <button onClick={() => updateStatus(req._id, 'Rejected')} disabled={req.status === 'Rejected'} className="btn btn-danger btn-sm rounded-pill px-3">Reject</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DonorRequests;

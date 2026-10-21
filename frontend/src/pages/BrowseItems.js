import { imageUrl } from '../api';
import React, { useState, useEffect } from 'react';
import axios from '../api';

function BrowseItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reason, setReason] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/api/donations');
        setItems(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching items", err);
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // --- FIXED SUBMIT FUNCTION ---
  const submitRequest = async (e) => {
    e.preventDefault();

    if (!reason) return alert("Please enter a reason!");
    if (!selectedItem) return alert("No item selected!");

    try {
      const requestData = {
        itemId: selectedItem._id,
        requesterId: user.id || user._id,
        requesterName: user.fullName,
        reason: reason,
        // FIX: Donor email bhej rahe hain taake donor dashboard pe nazar aaye
        donorEmail: selectedItem.donorEmail
      };

      const res = await axios.post('/api/requests', requestData);

      if (res.status === 200 || res.status === 201) {
        alert("Success! Your request has been sent.");

        // Modal ko close karne ka tarika
        const modalElement = document.getElementById('requestModal');
        if (window.bootstrap) {
          const modal = window.bootstrap.Modal.getInstance(modalElement) || new window.bootstrap.Modal(modalElement);
          modal.hide();
        }

        setSelectedItem(null);
        setReason('');
        // Page reload taake 'My Requests' update ho jaye
        window.location.reload();
      }
    } catch (err) {
      console.error("Submission Error:", err.response?.data || err.message);
      alert("Error: " + (err.response?.data?.message || "Check your backend connection!"));
    }
  };

  if (loading) return <div className="text-center mt-5">Loading available items...</div>;

  return (
    <div className="container mt-5 text-start">
      <h2 className="text-primary fw-bold mb-4 border-bottom pb-3">Available for Request</h2>
      <div className="row">
        {items.map(item => (
          <div className="col-md-4 mb-4" key={item._id}>
            <div className="card h-100 shadow border-0 rounded-4 overflow-hidden">
              <div style={{ height: '250px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                <img
                  src={imageUrl(item.image)} loading="lazy" width="600" height="400"
                  className="card-img-top"
                  alt={item.itemName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/donation-fallback.svg";
                  }}
                />
              </div>

              <div className="card-body d-flex flex-column">
                <h5 className="card-title fw-bold text-success text-capitalize">{item.itemName}</h5>
                <p className="card-text text-muted small flex-grow-1">{item.description}</p>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="badge bg-light text-success border border-success">{item.category}</span>
                    <button
                      className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                      onClick={() => setSelectedItem(item)}
                      disabled={user?.role !== 'Requester'}
                      data-bs-toggle="modal"
                      data-bs-target="#requestModal"
                    >
                      🤝 Request Now
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- REQUEST MODAL --- */}
      <div className="modal fade" id="requestModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow rounded-4">
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title fw-bold">Requesting: {selectedItem?.itemName}</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form onSubmit={submitRequest}>
              <div className="modal-body p-4 text-start">
                <label className="form-label fw-bold">Why do you need this item?</label>
                <textarea
                  className="form-control border-primary shadow-sm"
                  rows="4"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell the donor why you need this item..."
                  required
                ></textarea>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Close</button>
                <button type="submit" className="btn btn-primary rounded-pill px-4 shadow">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowseItems;

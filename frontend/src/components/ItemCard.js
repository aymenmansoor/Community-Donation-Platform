import { imageUrl } from '../api';
import React, { useState } from 'react'; // useState add kiya modal control ke liye
import axios from '../api';

function ItemCard({ title, category, description, contact, image, id, onDeleteSuccess }) {
  // Modal ki state (Khula hai ya band)
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        await axios.delete(`/api/donations/${id}`);
        onDeleteSuccess();
      } catch (err) { alert("Failed to delete."); }
    }
  };

  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 shadow-sm border-0 transition-hover" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: '220px' }}>
          <img
            src={imageUrl(image)}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: image ? 'cover' : 'contain', padding: image ? '0' : '30px' }}
          />
        </div>

        <div className="card-body d-flex flex-column p-4">
          <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-bold mb-2 w-fit">{category}</span>
          <h5 className="card-title fw-bold text-dark mb-2">{title}</h5>
          <p className="card-text text-muted text-truncate">{description}</p>

          <div className="mt-3 pt-3 border-top text-center">
            <p className="text-muted small">Contact: {contact || 'Not shared'}</p>

            <div className="d-flex justify-content-between align-items-center">
              {/* Details Button - Modal trigger karega */}
              <button className="btn btn-sm btn-outline-secondary border-0 fw-bold" onClick={() => setShowModal(true)}>
                Details
              </button>
              <button onClick={handleDelete} className="btn btn-sm text-danger text-decoration-none fw-bold">Delete</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- DETAILS MODAL (POP-UP) --- */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-success">{title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                   <img
                    src={imageUrl(image)}
                    alt={title}
                    className="rounded-4 shadow-sm"
                    style={{ maxHeight: '250px', width: '100%', objectFit: 'cover' }}
                   />
                </div>
                <p className="fw-bold mb-1">Category: <span className="text-success">{category}</span></p>
                <p className="fw-bold mb-1">Contact: <span className="text-muted">{contact}</span></p>
                <hr />
                <p className="text-dark"><strong>Description:</strong><br/>{description}</p>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-success w-100 rounded-pill fw-bold" onClick={() => setShowModal(false)}>Close Details</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemCard;

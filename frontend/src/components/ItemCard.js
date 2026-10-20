import React, { useState } from 'react'; // useState add kiya modal control ke liye
import axios from 'axios';

function ItemCard({ title, category, description, contact, image, id, onDeleteSuccess }) {
  // Modal ki state (Khula hai ya band)
  const [showModal, setShowModal] = useState(false);

  const getImageUrl = (cat) => {
    switch (cat) {
      case 'Books': return 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png';
      case 'Clothes': return 'https://cdn-icons-png.flaticon.com/512/3531/3531844.png';
      case 'Toys': return 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png';
      case 'Food': return 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png';
      case 'Electronics': return 'https://cdn-icons-png.flaticon.com/512/3659/3659899.png';
      default: return 'https://cdn-icons-png.flaticon.com/512/1161/1161388.png';
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this donation?")) {
      try {
        await axios.delete(`http://localhost:5000/api/donations/${id}`);
        onDeleteSuccess();
      } catch (err) { alert("Failed to delete."); }
    }
  };

  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100 shadow-sm border-0 transition-hover" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <div className="d-flex justify-content-center align-items-center bg-light" style={{ height: '220px' }}>
          <img 
            src={image ? `http://localhost:5000/uploads/${image}` : getImageUrl(category)} 
            alt={title} 
            style={{ width: '100%', height: '100%', objectFit: image ? 'cover' : 'contain', padding: image ? '0' : '30px' }} 
          />
        </div>
        
        <div className="card-body d-flex flex-column p-4">
          <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-bold mb-2 w-fit">{category}</span>
          <h5 className="card-title fw-bold text-dark mb-2">{title}</h5>
          <p className="card-text text-muted text-truncate">{description}</p>
          
          <div className="mt-3 pt-3 border-top text-center">
            <a href={`https://wa.me/${contact ? contact.replace(/\s/g, '') : ''}`} target="_blank" rel="noreferrer" className="btn btn-success w-100 rounded-pill fw-bold mb-3">
              Contact Donor
            </a>

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
                    src={image ? `http://localhost:5000/uploads/${image}` : getImageUrl(category)} 
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
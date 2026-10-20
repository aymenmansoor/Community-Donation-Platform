import React, { useState } from 'react';
import axios from 'axios';

function DonationForm({ onPostSuccess }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Clothes');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneRegex = /^03\d{9}$/;

    if (!phoneRegex.test(contact)) {
      return alert("invaalid number kindly use correct number (e.g., 03001234567).");
    }

    
    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('contact', contact);
    formData.append('donorEmail', user.email);
    if (image) formData.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/donate', formData);
      alert("DONEE.");
      
      setItemName('');
      setContact('');
      setDescription('');
      onPostSuccess(); 
    } catch (err) {
      alert("Error.");
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-4 text-start">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">Item Name</label>
          <input 
            type="text" className="form-control" placeholder="e.g. Science textbooks"
            value={itemName} onChange={(e) => setItemName(e.target.value)}
            required 
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Category</label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Clothes">Clothes</option>
            <option value="Books">Books</option>
            <option value="Toys">Toys</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Contact Number (Pakistani Format)</label>
          <input 
            type="text" className="form-control" placeholder="e.g. 03001234567"
            value={contact} onChange={(e) => setContact(e.target.value)}
            required // HTML5 Validation
          />
          <small className="text-muted">Format: 03xxxxxxxxx (11 digits)</small>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Item Image</label>
          <input type="file" className="form-control" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Description</label>
          <textarea 
            className="form-control" rows="3" placeholder="Condition, size, or quantity..."
            value={description} onChange={(e) => setDescription(e.target.value)}
            required // HTML5 Validation
          ></textarea>
        </div>

        <button type="submit" className="btn btn-success w-100 fw-bold py-2 rounded-pill shadow-sm">
          Post Donation
        </button>
      </form>
    </div>
  );
}

export default DonationForm;
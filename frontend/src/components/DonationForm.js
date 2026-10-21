import React, { useState } from 'react';
import axios from '../api';

function DonationForm({ onPostSuccess }) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Clothes');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('contact', contact || 'Not shared');
    formData.append('donorEmail', user.email);
    if (image) formData.append('image', image);

    try {
      await axios.post('/api/donate', formData);
      alert("Your donation has been posted.");

      setItemName('');
      setContact('');
      setDescription('');
      onPostSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Could not post donation.");
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-4 text-start">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="donationform-0" className="form-label fw-bold">Item Name</label>
          <input id="donationform-0"
            type="text" className="form-control" placeholder="e.g. Science textbooks"
            value={itemName} onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="donationform-1" className="form-label fw-bold">Category</label>
          <select id="donationform-1" className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Clothes">Clothes</option>
            <option value="Books">Books</option>
            <option value="Toys">Toys</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="donationform-2" className="form-label fw-bold">Contact details (optional)</label>
          <input id="donationform-2"
            type="text" className="form-control" placeholder="Leave blank to keep contact private"
            value={contact} onChange={(e) => setContact(e.target.value)}
            maxLength="80"
          />
          <small className="text-muted">Only share details you want other signed-in users to see.</small>
        </div>

        <div className="mb-3">
          <label htmlFor="donationform-3" className="form-label fw-bold">Item Image</label>
          <input id="donationform-3" type="file" accept="image/png,image/jpeg,image/webp" className="form-control" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <div className="mb-3">
          <label htmlFor="donationform-4" className="form-label fw-bold">Description</label>
          <textarea id="donationform-4"
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

import React, { useState } from 'react';

function DonationForm() {
  // State variables data ko save karne ke liye
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Clothes');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Item Name: ${itemName}, Category: ${category} - Post ho gaya!`);
    // Baad mein yahan hum backend (Node.js) ko data bheinjein ge [cite: 11, 21]
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-sm p-4">
        <h3 className="text-success mb-3">Donate an Item [cite: 5]</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Item Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)} 
              placeholder="e.g. Purani Kitabein"
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Category </label>
            <select 
              className="form-select" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Clothes">Clothes [cite: 5]</option>
              <option value="Toys">Toys [cite: 5]</option>
              <option value="Books">Books [cite: 5]</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success w-100">Post Donation [cite: 5]</button>
        </form>
      </div>
    </div>
  );
}

export default DonationForm;    
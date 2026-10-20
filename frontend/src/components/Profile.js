import React from 'react';
import ItemCard from './ItemCard';

function Profile({ user, donations, fetchDonations }) {
  // Filtering only the items donated by the logged-in user
  const myDonations = donations.filter(item => item.donorEmail === user.email);

  return (
    <div className="container mt-5">
      {/* Profile Header Section */}
      <div className="profile-header text-center mb-5 p-5 bg-success text-white rounded-4 shadow-lg">
        <div className="mb-3">
            <i className="bi bi-person-circle" style={{ fontSize: '4rem' }}></i>
        </div>
        <h1 className="fw-bold">My Donation Profile</h1>
        <p className="lead opacity-75">Logged in as: <strong>{user.email}</strong></p>
        <div className="mt-3">
            <span className="badge bg-white text-success px-4 py-2 rounded-pill fw-bold fs-6 shadow-sm">
               Total Impact: {myDonations.length} Items Donated
            </span>
        </div>
      </div>

      {/* User's Donations Grid */}
      <div className="row">
        <h3 className="mb-4 fw-bold text-dark">My Contribution History</h3>
        {myDonations.length > 0 ? (
          myDonations.map(item => (
            <ItemCard 
              key={item._id} 
              id={item._id} 
              title={item.itemName} 
              category={item.category} 
              description={item.description} 
              contact={item.contact} 
              image={item.image}
              onDeleteSuccess={fetchDonations} 
            />
          ))
        ) : (
          <div className="text-center mt-4 py-5 border border-dashed rounded-4 bg-light">
            <h4 className="text-muted">You haven't posted any donations yet.</h4>
            <p className="text-secondary">Start your journey of kindness by donating an item today!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
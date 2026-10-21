import React, { useState } from 'react';
import axios from '../api';

function Signup({ setAuthMode }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'Donor'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post('/api/auth/signup', formData);
            alert("If registration is available, your account is ready. Please sign in.");

            setFormData({ fullName: '', email: '', password: '', role: 'Donor' });

            if(setAuthMode) {
                setAuthMode('login');
            }

        } catch (err) {
            console.error("Signup Error:", err);
            const errorMsg = err.response && err.response.data ? err.response.data.message : "Signup failed";
            alert(errorMsg);
        }
    };

    return (
        <div className="card shadow p-4 mx-auto mt-5" style={{maxWidth: '400px', border: '2px solid green', borderRadius: '15px'}}>
            <h3 className="text-center mb-4 text-success fw-bold">Create an Account</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="signup-0" className="form-label fw-bold">Full Name</label>
                    <input id="signup-0"
                        type="text"
                        className="form-control"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="signup-1" className="form-label fw-bold">Email Address</label>
                    <input id="signup-1"
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="signup-2" className="form-label fw-bold">Password</label>
                    <input id="signup-2"
                        type="password" minLength={12} maxLength={72} autoComplete="new-password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="signup-3" className="form-label fw-bold">Register As:</label>
                    <select id="signup-3"
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                        <option value="Donor">Donor</option>
                        <option value="Requester">Requester</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-success w-100 fw-bold py-2 shadow-sm">
                    Sign Up Now
                </button>
            </form>
        </div>
    );
}

export default Signup;

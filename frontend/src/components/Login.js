import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user)); 
            
            alert("Welcome: " + res.data.user.fullName);
            navigate('/'); 
            window.location.reload(); 

        } catch (err) {
            const errorMsg = err.response && err.response.data 
                ? err.response.data.message 
                : "Login failed!";
            alert(errorMsg);
        }
    };

    return (
        <div className="card shadow p-4 mx-auto mt-5" style={{maxWidth: '400px', borderRadius: '15px'}}>
            <h3 className="text-center text-success mb-4 fw-bold">Login</h3>
            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label className="form-label fw-bold">Email Address</label>
                    <input 
                        type="email" 
                        className="form-control" 
                        placeholder="example@mail.com"
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label fw-bold">Password</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="btn btn-success w-100 fw-bold py-2 mt-2 shadow-sm">
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;
import React, { useState } from 'react';
import axios from '../api';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/login', { email, password });

            onLogin(res.data);
            navigate('/');

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
                    <label htmlFor="login-0" className="form-label fw-bold">Email Address</label>
                    <input id="login-0"
                        type="email"
                        className="form-control"
                        placeholder="example@mail.com"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="login-1" className="form-label fw-bold">Password</label>
                    <input id="login-1"
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

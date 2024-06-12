// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const apiDomain = process.env.REACT_APP_API_DOMAIN;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");

    const formdata = new FormData();
    formdata.append("email", email);
    formdata.append("password", password);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow"
    };

    try {
      const response = await fetch(`${apiDomain}/login`, requestOptions);
      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('auth', JSON.stringify({ token:`Bearer ${result.data.token}`,
           role: result.data.role[0],
           userId: result.data.user.id
          }));
        navigate('/dashboard');
        window.location.reload();
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-indigo-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password:</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-indigo-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700">
            Login
          </button>
        </form>
      </div>
    </div>
  );

};

export default Login;

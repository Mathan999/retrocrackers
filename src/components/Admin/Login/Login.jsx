import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../firebase'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email and password
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      // Sign in with Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      // Set authentication state
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/admin');
    } catch (error) {
      setError("Invalid Email and Password");
    }
  };

  return (
    <div className="h-screen bg-black flex justify-center">
      <div className="max-w-md w-full p-4 pt-6 md:p-6 lg:p-12">
        <h2 className="text-3xl font-bold mb-4 text-gray-400">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="email" className="block mb-2 text-sm">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              placeholder="Enter the Email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 pl-10 text-sm text-white border border-gray-300 rounded"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="block mb-2 text-sm">
              Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                placeholder="Enter the Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 pl-10 text-sm text-white border border-gray-300 rounded"
              />
              <button
                type="button"
                className="absolute right-0 top-0 mt-2 mr-2 text-sm text-white hover:text-gray-900"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
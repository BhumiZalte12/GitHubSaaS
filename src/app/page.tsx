// src/components/AuthButtons.tsx
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthButtons = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (type: string) => {
    setLoading(true);
    setMessage(`${type} in progress...`);

    try {
      const response = await fetch(`http://your-api-url.com/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ /* data for sign-in/sign-up */ }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} successful!`);
      } else {
        setMessage(`Error during ${type}`);
      }
    } catch (error) {
      setMessage('Error connecting to the server');
    }

    setLoading(false);
  };

  const handleSignUpRedirect = () => {
    router.push('/sign-up'); // Redirect to the dynamic SignUp page
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Our Platform</h1>
        <p className="text-lg text-gray-600 mb-6">Choose an option to proceed:</p>

        <div className="space-x-4">
          <button
            onClick={() => handleAuth('sign-in')}
            disabled={loading}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <button
            onClick={handleSignUpRedirect} // Redirect to the SignUp page
            disabled={loading}
            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>

        {message && <p className="mt-4 text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default AuthButtons;

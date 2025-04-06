import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in cookies
    const token = Cookies.get('authToken');
    
    // If no token exists, redirect to home page
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // If token exists, render the children components
  return children;
};

export default ProtectedRoute;


import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      // Auto-redirect to login
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <Home /> : null;
};

export default Index;

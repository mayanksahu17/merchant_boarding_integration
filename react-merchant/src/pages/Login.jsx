import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthOverlay from '../components/AuthOverlay';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('authExpiry');
    
    if (token && expiry && new Date().getTime() < Number(expiry)) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <AuthOverlay onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default Login;
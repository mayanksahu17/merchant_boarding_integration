import { useState, useEffect } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('authExpiry');
    const isValid = token && expiry && new Date().getTime() < Number(expiry);
    setIsAuthenticated(!!isValid);
  }, []);

  const login = (email: string, password: string) => {
    // Replace with your actual auth logic
    const validEmail = "Kenneth@lodgezify.com";
    const validPassword = "GreenJack@$^E^%123456";

    if (email === validEmail && password === validPassword) {
      const token = Math.random().toString(36).substr(2);
      const expiryTime = new Date().getTime() + 30 * 60 * 1000; // 30 minutes
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('authExpiry', expiryTime.toString());
      setIsAuthenticated(true);
      return true;
    }
    
    throw new Error('Invalid email or password');
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authExpiry');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
};

export default useAuth;
import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('authExpiry');
    
    if (token && expiry && new Date().getTime() < Number(expiry)) {
      setAuthToken(token);
    }
    setIsLoading(false);
  }, []);

  const login = (token, expiry) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authExpiry', expiry);
    setAuthToken(token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authExpiry');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
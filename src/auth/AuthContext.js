// AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const authData = JSON.parse(localStorage.getItem("auth"));
  const [authToken, setAuthToken] = useState(authData && authData.token ? authData.token : '');
  const [userRole, setUserRole] = useState(authData ? authData.role : null);

  const setToken = (token, role) => {
    setAuthToken(token);
    setUserRole(role);
    localStorage.setItem('auth', JSON.stringify({ token, role }));
  };

  return (
    <AuthContext.Provider value={{ authToken, userRole, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

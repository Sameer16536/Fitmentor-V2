import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email,
        password
      });
      setUser(response.data);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const signup = async (email, password, name) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        email,
        password,
        name
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
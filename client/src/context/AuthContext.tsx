import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      console.log('Checking auth status with token:', token.substring(0, 20) + '...');
      const response = await apiService.getCurrentUser();
      console.log('Auth check successful:', response.user.email);
      
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        createdAt: new Date(response.user.createdAt)
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', email);
      
      const response = await apiService.login(email, password);
      console.log('Login successful:', response.user.email);
      
      localStorage.setItem('token', response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        createdAt: new Date(response.user.createdAt)
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting signup for:', email);
      
      const response = await apiService.register(name, email, password);
      console.log('Signup successful:', response.user.email);
      
      localStorage.setItem('token', response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        createdAt: new Date(response.user.createdAt)
      });
      
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.email);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
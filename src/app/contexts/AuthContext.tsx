import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar?: string;
  class?: string;
  subject?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'student' | 'teacher') => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  class?: string;
  subject?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('safeschool_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'student' | 'teacher') => {
    setIsLoading(true);
    try {
      const response = await api.post('/login', { email, password, role });
      
      // Handle both { data: { user, token } } and { user, token } structures
      const responseData = response.data.data || response.data;
      const { user, token } = responseData;
      
      if (!user) {
        throw new Error('Invalid response from server: User data missing');
      }

      setUser(user);
      localStorage.setItem('safeschool_user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('safeschool_token', token);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login gagal. Silakan periksa email dan kata sandi Anda.';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/register', data);
      
      const responseData = response.data.data || response.data;
      const { user, token } = responseData;
      
      if (!user) {
        throw new Error('Invalid response from server: User data missing');
      }

      setUser(user);
      localStorage.setItem('safeschool_user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('safeschool_token', token);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Optional: Call logout endpoint to invalidate token on server
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('safeschool_user');
      localStorage.removeItem('safeschool_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
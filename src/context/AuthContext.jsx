// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configurar Axios para debug
axios.interceptors.request.use(request => {
  console.log('Requisição:', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Resposta:', response);
    return response;
  },
  error => {
    console.error('Erro na requisição:', error.response || error);
    return Promise.reject(error);
  }
);

// URL base da API
const API_URL = '/api';

// Criar o contexto
export const AuthContext = createContext();

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar a validade do token ao iniciar
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }
      
      try {
        // Configurar o token nos headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Carregar dados do usuário diretamente com o /me
        const response = await axios.get(`${API_URL}/auth/me`);
        
        if (response.data.success) {
          console.log('Usuário carregado:', response.data.data);
          setUser(response.data.data);
          setToken(storedToken);
        } else {
          console.log('Erro ao carregar usuário:', response.data);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Erro ao verificar token:', err);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, []);

  // Configurar o axios para usar o token em todas as requisições
  useEffect(() => {
    if (token) {
      // Garantir que o formato do token está correto
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token configurado:', `Bearer ${token}`);
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);


  // Função para login
  const login = async (email, senha) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        senha
      });
      
      const { token: authToken, user: userData } = response.data;
      
      // Salvar token no localStorage
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      setLoading(false);
      
      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      setError(
        error.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais.'
      );
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  // Função para logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Verificar se o usuário é gerente
  const isGerente = () => {
    return user && user.role === 'gerente';
  };

  // Valor do contexto
  const contextValue = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isGerente
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// URL base da API
const API_URL = '/api';

// Criar o contexto
export const ClientesContext = createContext();

// Provedor do contexto
export const ClientesProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar clientes sempre que o usuário mudar ou o token for atualizado
  useEffect(() => {
    if (user && token) {
      carregarClientes();
    } else {
      setClientes([]);
      setLoading(false);
    }
  }, [user, token]);

  // Função para carregar todos os clientes disponíveis
  const carregarClientes = async () => {
    try {
      setLoading(true);
      // Simulação de clientes para fins de desenvolvimento
      // Em produção, substituir por chamada à API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados
      const dadosSimulados = [
        {
          id: 1,
          _id: 1,
          nome: 'João Silva',
          email: 'joao@email.com',
          telefone: '(11) 98765-4321',
          cor: '#4CAF50',
          dataNascimento: '1985-05-15'
        },
        {
          id: 2,
          _id: 2,
          nome: 'Maria Oliveira',
          email: 'maria@email.com',
          telefone: '(11) 91234-5678',
          cor: '#2196F3',
          dataNascimento: '1990-08-20'
        },
        {
          id: 3,
          _id: 3,
          nome: 'Pedro Santos',
          email: 'pedro@email.com',
          telefone: '(11) 99876-5432',
          cor: '#FFC107',
          dataNascimento: '1978-11-10'
        }
      ];
      
      setClientes(dadosSimulados);
      setLoading(false);
      setError(null);
      
      /* Implementação futura com API real:
      const response = await axios.get(`${API_URL}/clientes`);
      setClientes(response.data.data || []);
      setLoading(false);
      setError(null);
      */
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Falha ao carregar clientes. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  // Função para adicionar um novo cliente
  const adicionarCliente = async (novoCliente) => {
    try {
      setLoading(true);
      
      // Simulação de adição para fins de desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Gerar ID único para o novo cliente (em produção, o backend faria isso)
      const id = Date.now();
      const clienteCompleto = {
        ...novoCliente,
        id,
        _id: id
      };
      
      setClientes(prev => [...prev, clienteCompleto]);
      setLoading(false);
      
      /* Implementação futura com API real:
      const response = await axios.post(`${API_URL}/clientes`, novoCliente);
      const clienteAdicionado = response.data.data;
      setClientes(prev => [...prev, clienteAdicionado]);
      setLoading(false);
      return clienteAdicionado;
      */
      
      return clienteCompleto;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      setError('Falha ao adicionar cliente. Tente novamente mais tarde.');
      setLoading(false);
      return null;
    }
  };

  // Função para atualizar um cliente existente
  const atualizarCliente = async (id, dadosAtualizados) => {
    try {
      setLoading(true);
      
      // Simulação de atualização para fins de desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClientes(prev => 
        prev.map(cliente => 
          (cliente.id === id || cliente._id === id) ? { ...cliente, ...dadosAtualizados } : cliente
        )
      );
      setLoading(false);
      
      /* Implementação futura com API real:
      const response = await axios.put(`${API_URL}/clientes/${id}`, dadosAtualizados);
      const clienteAtualizado = response.data.data;
      setClientes(prev => 
        prev.map(cliente => 
          (cliente.id === id || cliente._id === id) ? clienteAtualizado : cliente
        )
      );
      setLoading(false);
      return clienteAtualizado;
      */
      
      const clienteAtualizado = { id, _id: id, ...dadosAtualizados };
      return clienteAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      setError('Falha ao atualizar cliente. Tente novamente mais tarde.');
      setLoading(false);
      return null;
    }
  };

  // Função para remover um cliente
  const removerCliente = async (id) => {
    try {
      setLoading(true);
      
      // Simulação de remoção para fins de desenvolvimento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClientes(prev => prev.filter(cliente => cliente.id !== id && cliente._id !== id));
      setLoading(false);
      
      /* Implementação futura com API real:
      await axios.delete(`${API_URL}/clientes/${id}`);
      setClientes(prev => prev.filter(cliente => cliente.id !== id && cliente._id !== id));
      setLoading(false);
      */
      
      return true;
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      setError('Falha ao remover cliente. Tente novamente mais tarde.');
      setLoading(false);
      return false;
    }
  };

  // Valor do contexto
  const contextValue = {
    clientes,
    loading,
    error,
    carregarClientes,
    adicionarCliente,
    atualizarCliente,
    removerCliente
  };

  return (
    <ClientesContext.Provider value={contextValue}>
      {children}
    </ClientesContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useClientes = () => {
  const context = useContext(ClientesContext);
  if (!context) {
    throw new Error('useClientes deve ser usado dentro de um ClientesProvider');
  }
  return context;
}; 
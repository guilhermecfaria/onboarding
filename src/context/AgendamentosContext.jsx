import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// URL base da API
const API_URL = '/api';

// Criar o contexto
export const AgendamentosContext = createContext();

// Provedor do contexto
export const AgendamentosProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Configurar cabeçalhos da requisição com o token
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  };

  // Carregar agendamentos sempre que o usuário mudar ou o token for atualizado
  useEffect(() => {
    if (user && token) {
      carregarAgendamentos();
    } else {
      setAgendamentos([]);
      setLoading(false);
    }
  }, [user, token]);

  // Função para carregar todos os agendamentos disponíveis
  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      
      // Buscar agendamentos da API
      const response = await axios.get(`${API_URL}/agendamentos`, config);
      
      // Verificar se a resposta contém dados
      if (response.data && response.data.success) {
        setAgendamentos(response.data.data || []);
      } else {
        setAgendamentos([]);
      }
      
      setLoading(false);
      setErro(null);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      
      const mensagemErro = error.response && error.response.data 
        ? error.response.data.error 
        : 'Falha ao carregar agendamentos. Tente novamente mais tarde.';
      
      setErro(mensagemErro);
      setLoading(false);
    }
  };

  // Função para adicionar um novo agendamento
  const adicionarAgendamento = async (novoAgendamento) => {
    try {
      setLoading(true);
      
      // Enviar novo agendamento para a API
      const response = await axios.post(
        `${API_URL}/agendamentos`, 
        novoAgendamento, 
        config
      );
      
      // Verificar se a operação foi bem-sucedida
      if (response.data && response.data.success) {
        const agendamentoAdicionado = response.data.data;
        
        // Adicionar o novo agendamento à lista local
        setAgendamentos(prev => [...prev, agendamentoAdicionado]);
        setLoading(false);
        return agendamentoAdicionado;
      } else {
        throw new Error(response.data.error || 'Falha ao adicionar agendamento');
      }
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      
      const mensagemErro = error.response && error.response.data 
        ? error.response.data.error 
        : 'Falha ao adicionar agendamento. Tente novamente mais tarde.';
      
      setErro(mensagemErro);
      setLoading(false);
      return null;
    }
  };

  // Função para atualizar um agendamento existente
  const atualizarAgendamento = async (id, dadosAtualizados) => {
    try {
      setLoading(true);
      
      // Enviar dados atualizados para a API
      const response = await axios.put(
        `${API_URL}/agendamentos/${id}`, 
        dadosAtualizados, 
        config
      );
      
      // Verificar se a operação foi bem-sucedida
      if (response.data && response.data.success) {
        const agendamentoAtualizado = response.data.data;
        
        // Atualizar o agendamento na lista local
        setAgendamentos(prev => 
          prev.map(agendamento => 
            agendamento._id === id ? agendamentoAtualizado : agendamento
          )
        );
        setLoading(false);
        return agendamentoAtualizado;
      } else {
        throw new Error(response.data.error || 'Falha ao atualizar agendamento');
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      
      const mensagemErro = error.response && error.response.data 
        ? error.response.data.error 
        : 'Falha ao atualizar agendamento. Tente novamente mais tarde.';
      
      setErro(mensagemErro);
      setLoading(false);
      return null;
    }
  };

  // Função para remover um agendamento
  const removerAgendamento = async (id) => {
    try {
      setLoading(true);
      
      // Enviar solicitação de exclusão para a API
      const response = await axios.delete(
        `${API_URL}/agendamentos/${id}`, 
        config
      );
      
      // Verificar se a operação foi bem-sucedida
      if (response.data && response.data.success) {
        // Remover o agendamento da lista local
        setAgendamentos(prev => prev.filter(agendamento => agendamento._id !== id));
        setLoading(false);
        return true;
      } else {
        throw new Error(response.data.error || 'Falha ao remover agendamento');
      }
    } catch (error) {
      console.error('Erro ao remover agendamento:', error);
      
      const mensagemErro = error.response && error.response.data 
        ? error.response.data.error 
        : 'Falha ao remover agendamento. Tente novamente mais tarde.';
      
      setErro(mensagemErro);
      setLoading(false);
      return false;
    }
  };

  // Valor do contexto
  const contextValue = {
    agendamentos,
    loading,
    erro,
    carregarAgendamentos,
    adicionarAgendamento,
    atualizarAgendamento,
    removerAgendamento
  };

  return (
    <AgendamentosContext.Provider value={contextValue}>
      {children}
    </AgendamentosContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAgendamentos = () => {
  const context = useContext(AgendamentosContext);
  if (!context) {
    throw new Error('useAgendamentos deve ser usado dentro de um AgendamentosProvider');
  }
  return context;
}; 
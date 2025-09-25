// Arquivo de configuração de API

// URL base da API
const API_BASE_URL = '/api';

// URLs específicas simplificadas
const API_URLS = {
  // URLs básicas que já sabemos que funcionam
  CLIENTES: `${API_BASE_URL}/clientes`,
  CLIENTES_PENDENTES: `${API_BASE_URL}/gerente/clientes-pendentes`,
  
  // Autenticação
  LOGIN: `${API_BASE_URL}/auth/login`,
  ME: `${API_BASE_URL}/auth/me`,
  
  // Clientes
  CLIENTE_BY_ID: (id) => `${API_BASE_URL}/clientes/${id}`,
  QUESTIONARIO_CLIENTE: (clienteId) => `${API_BASE_URL}/clientes/${clienteId}/questionario`,
  CLIENTES_BY_GERENTE: (gerenteId) => `${API_BASE_URL}/gerente/${gerenteId}/clientes`,
  
  // Gerentes
  GERENTE_ROTAS: {
    CLIENTES_PENDENTES: `${API_BASE_URL}/gerente/clientes-pendentes`,
    ATRIBUIR_CLIENTE: (clienteId) => `${API_BASE_URL}/gerente/atribuir-cliente/${clienteId}`,
    CLIENTES: `${API_BASE_URL}/gerente/clientes`
  },
  
  // Usuários
  USUARIOS: {
    PROFISSIONAIS: `${API_BASE_URL}/auth/profissionais`,
    GERENTES: `${API_BASE_URL}/auth/gerentes`
  }
};

export default API_URLS; 
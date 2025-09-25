import axios from 'axios';

const API_URL = 'https://onboarding-op6r.onrender.com/api';

const createSimpleAdmin = async () => {
  try {
    console.log('🔄 Fazendo login com admin existente...');
    
    // Primeiro faz login com o admin existente
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@exemplo.com',
      senha: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    
    // Agora cria um novo usuário através da API protegida
    console.log('🔄 Criando novo gerente...');
    
    const createResponse = await axios.post(`${API_URL}/auth/register`, {
      nome: 'Gerente Seguro',
      email: 'gerente.seguro@questionario.com',
      senha: 'MinhaSenh@Forte123!',
      role: 'gerente'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Novo gerente criado com sucesso!');
    console.log('');
    console.log('=== DADOS PARA SEU PAI ===');
    console.log('📧 Email: gerente.seguro@questionario.com');
    console.log('🔑 Senha: MinhaSenh@Forte123!');
    console.log('🌐 Site: https://onboarding-op6r.onrender.com');
    console.log('==========================');
    
  } catch (error) {
    if (error.response?.data?.message?.includes('já existe')) {
      console.log('✅ Usuário já existe! Dados para login:');
      console.log('📧 Email: gerente.seguro@questionario.com');
      console.log('🔑 Senha: MinhaSenh@Forte123!');
    } else {
      console.error('❌ Erro:', error.response?.data || error.message);
    }
  }
};

createSimpleAdmin();

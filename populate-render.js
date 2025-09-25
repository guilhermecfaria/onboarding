import axios from 'axios';

const API_URL = 'https://onboarding-op6r.onrender.com/api';

// Dados do questionário (estrutura simplificada para testar)
const questionarioData = {
  titulo: 'QUESTIONÁRIO PARA IDENTIFICAÇÃO DAS APTIDÕES DOMINANTES',
  descricao: 'Este questionário ajuda a identificar suas aptidões predominantes através de perguntas sobre preferências pessoais.',
  versao: '1.0',
  ativo: true,
  categorias: [
    {
      numero: 1,
      titulo: 'Atividades de minha preferência na infância',
      descricao: 'Assinale quatro',
      tipo: 'multipla',
      qtdEscolhas: 4,
      opcoes: [
        { numero: '1.1', texto: 'Aeromodelismo', tipo: 'NO' },
        { numero: '1.2', texto: 'Amarelinha', tipo: 'SO' },
        { numero: '1.3', texto: 'Jogos de tabuleiro', tipo: 'NO' },
        { numero: '1.4', texto: 'Bonecas/bonecos', tipo: 'SE' }
      ]
    },
    {
      numero: 2,
      titulo: 'Situações que mais me agradam',
      descricao: 'Assinale quatro',
      tipo: 'multipla',
      qtdEscolhas: 4,
      opcoes: [
        { numero: '2.1', texto: 'Estar em ambiente silencioso', tipo: 'NE' },
        { numero: '2.2', texto: 'Conversar com pessoas', tipo: 'SE' },
        { numero: '2.3', texto: 'Trabalhar com as mãos', tipo: 'SO' },
        { numero: '2.4', texto: 'Resolver problemas', tipo: 'NO' }
      ]
    }
  ]
};

const populate = async () => {
  try {
    console.log('🔄 Testando API...');
    
    // Primeiro, testa se a API está funcionando
    const healthCheck = await axios.get('https://onboarding-op6r.onrender.com/');
    console.log('✅ API respondendo:', healthCheck.data);
    
    // Testa se já existe estrutura
    try {
      const existing = await axios.get(`${API_URL}/questionarios/estrutura`);
      console.log('ℹ️ Estrutura já existe:', existing.data);
      return;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('📝 Estrutura não encontrada, criando...');
      } else {
        throw error;
      }
    }
    
    // Login como admin
    console.log('🔐 Fazendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@exemplo.com',
      senha: 'senha123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    // Criar estrutura via endpoint direto
    console.log('📋 Criando estrutura do questionário...');
    const response = await axios.post(`${API_URL}/questionarios/estrutura`, questionarioData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Estrutura criada com sucesso!');
    console.log('🎉 Agora o questionário deve funcionar!');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
};

populate();

import axios from 'axios';

const BASE_URL = 'https://onboarding-op6r.onrender.com';

const createAdmin = async () => {
  try {
    console.log('🔄 Criando usuário admin...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/register-master`, {
      nome: 'Admin Gerente',
      email: 'admin@exemplo.com',
      senha: 'senha123'
    });
    
    console.log('✅ Admin criado:', response.data);
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('já existe')) {
      console.log('ℹ️ Admin já existe');
    } else {
      console.error('❌ Erro ao criar admin:', error.response?.data || error.message);
    }
  }
};

const createQuestionario = async () => {
  try {
    console.log('🔄 Criando estrutura do questionário...');
    
    // Login primeiro
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@exemplo.com',
      senha: 'senha123'
    });
    
    const token = loginResponse.data.token;
    
    const questionarioData = {
      titulo: 'QUESTIONÁRIO PARA IDENTIFICAÇÃO DAS APTIDÕES DOMINANTES',
      descricao: 'Este questionário ajuda a identificar suas aptidões predominantes através de perguntas sobre preferências pessoais.',
      versao: '1.0',
      ativo: true,
      categorias: [
        {
          numero: 1,
          titulo: "Preferências Gerais",
          opcoes: [
            { letra: "A", texto: "Gosto de trabalhar com números e dados" },
            { letra: "B", texto: "Prefiro atividades criativas e artísticas" },
            { letra: "C", texto: "Gosto de trabalhar com pessoas" },
            { letra: "D", texto: "Prefiro atividades práticas e manuais" }
          ]
        }
        // Adicione mais categorias aqui se necessário
      ]
    };
    
    const response = await axios.post(`${BASE_URL}/api/questionarios/estrutura`, questionarioData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Questionário criado:', response.data);
  } catch (error) {
    console.error('❌ Erro ao criar questionário:', error.response?.data || error.message);
  }
};

const run = async () => {
  console.log('🚀 Iniciando população do banco online...');
  await createAdmin();
  await createQuestionario();
  console.log('✅ População concluída!');
};

run().catch(console.error);

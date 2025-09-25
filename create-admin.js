import axios from 'axios';

const API_URL = 'https://onboarding-op6r.onrender.com/api';

const createNewAdmin = async () => {
  try {
    console.log('🔄 Criando novo gerente...');
    
    const response = await axios.post(`${API_URL}/auth/register-master`, {
      nome: 'Admin Principal',
      email: 'admin.principal@questionario.com',
      senha: 'AdminSeguro2024!',
      role: 'gerente',
      masterPassword: 'master123'
    });
    
    console.log('✅ Novo gerente criado com sucesso!');
    console.log('📧 Email: admin.principal@questionario.com');
    console.log('🔑 Senha: AdminSeguro2024!');
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('já existe')) {
      console.log('ℹ️ Email já existe, tentando outro...');
      
      // Tenta com outro email
      try {
        const response2 = await axios.post(`${API_URL}/auth/register-master`, {
          nome: 'Gerente Principal',
          email: 'gerente@questionario.com',
          senha: 'GerenteSeguro2024!',
          role: 'gerente',
          masterPassword: 'master123'
        });
        
        console.log('✅ Gerente criado com sucesso!');
        console.log('📧 Email: gerente@questionario.com');
        console.log('🔑 Senha: GerenteSeguro2024!');
        
      } catch (error2) {
        console.error('❌ Erro:', error2.response?.data || error2.message);
      }
    } else {
      console.error('❌ Erro:', error.response?.data || error.message);
    }
  }
};

createNewAdmin();

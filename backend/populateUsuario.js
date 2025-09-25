import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Dados do usuário gerente inicial
const usuarioGerenteData = {
  nome: 'Dr Jou Teste',
  email: 'admin@exemplo.com',
  senha: 'dRj0U52@',
  role: 'gerente',
  ativo: true,
  primeiroLogin: false
};

// Função para criar o usuário gerente inicial
const createUsuarioGerente = async () => {
  try {
    // Verificar se já existe algum usuário gerente
    const gerenteExistente = await User.findOne({ role: 'gerente' });
    
    if (gerenteExistente) {
      console.log('Um usuário gerente já existe no sistema:', gerenteExistente.email);
      return gerenteExistente;
    }
    
    // Criar o gerente
    const gerente = await User.create(usuarioGerenteData);
    
    console.log('Usuário gerente criado com sucesso:');
    console.log(`Email: ${gerente.email}`);
    console.log(`Senha: senha123`);
    
    return gerente;
  } catch (error) {
    console.error('Erro ao criar usuário gerente:', error);
    throw error;
  }
};


// Executar
const run = async () => {
  try {
    // Conectar ao banco de dados
    await connectDB();
    
    // Criar apenas o usuário gerente
    await createUsuarioGerente();
    
    console.log('Script executado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar script:', error);
    process.exit(1);
  }
};

run(); 
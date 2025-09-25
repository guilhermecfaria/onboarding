import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

// @desc    Registrar um novo usuário (primeiro registro ou por gerente)
// @route   POST /api/auth/register
// @access  Público para primeiro registro, privado para subsequentes
export const register = asyncHandler(async (req, res) => {
  // Verificar se é o primeiro usuário
  const usuariosExistentes = await User.countDocuments();
  
  if (usuariosExistentes === 0) {
    // Permitir o primeiro registro sem verificação de gerente
    const user = await User.create({
      ...req.body,
      role: 'gerente' // Forçar o primeiro usuário como gerente
    });
    
    // Remover a senha do resultado
    user.senha = undefined;
    
    return res.status(201).json({
      success: true,
      data: user
    });
  }
  
  // Para registros subsequentes, verificar se é um gerente
  if (req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Apenas gerentes podem registrar novos usuários'
    });
  }
  
  // Se for um profissional sendo registrado, adicionar o ID do gerente
  if (req.body.role === 'profissional') {
    req.body.gerente = req.user.id;
  }
  
  // Criar o usuário
  const user = await User.create(req.body);
  
  // Remover a senha do resultado
  user.senha = undefined;
  
  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Registrar um novo usuário com senha master
// @route   POST /api/auth/register-master
// @access  Público
export const registerWithMasterPassword = asyncHandler(async (req, res) => {
  const { nome, email, senha, role, masterPassword } = req.body;
  
  // Validar campos obrigatórios
  if (!nome || !email || !senha || !role || !masterPassword) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, preencha todos os campos'
    });
  }
  
  // Verificar se o e-mail já está em uso
  const usuarioExistente = await User.findOne({ email });
  if (usuarioExistente) {
    return res.status(400).json({
      success: false,
      message: 'Este e-mail já está em uso'
    });
  }
  
  // Verificar a senha master com base no papel selecionado
  let senhaCorreta = false;
  
  switch (role) {
    case 'gerente':
      senhaCorreta = masterPassword === process.env.MASTER_PASSWORD_GERENTE;
      break;
    case 'profissional':
      senhaCorreta = masterPassword === process.env.MASTER_PASSWORD_PROFISSIONAL;
      break;
    case 'secretaria':
      senhaCorreta = masterPassword === process.env.MASTER_PASSWORD_SECRETARIA;
      break;
    default:
      senhaCorreta = false;
  }
  
  if (!senhaCorreta) {
    return res.status(401).json({
      success: false,
      message: 'Senha master inválida para este tipo de usuário'
    });
  }
  
  // Se for profissional, precisamos associar a um gerente
  if (role === 'profissional') {
    const gerente = await User.findOne({ role: 'gerente' });
    if (!gerente) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum gerente encontrado para associar ao profissional'
      });
    }
    
    // Criar o usuário com a referência ao gerente
    const user = await User.create({
      nome,
      email,
      senha,
      role,
      gerente: gerente._id,
      ativo: true
    });
    
    // Remover a senha do resultado
    user.senha = undefined;
    
    return res.status(201).json({
      success: true,
      data: user
    });
  }
  
  // Para outros papéis (gerente, secretaria)
  const user = await User.create({
    nome,
    email,
    senha,
    role,
    ativo: true
  });
  
  // Remover a senha do resultado
  user.senha = undefined;
  
  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Público
export const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;
  
  // Validar email e senha
  if (!email || !senha) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, informe email e senha'
    });
  }
  
  // Verificar se o usuário existe
  const user = await User.findOne({ email }).select('+senha');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas'
    });
  }
  
  // Verificar se o usuário está ativo
  if (!user.ativo) {
    return res.status(401).json({
      success: false,
      message: 'Sua conta está desativada. Entre em contato com um gerente.'
    });
  }
  
  // Verificar se a senha corresponde
  const isMatch = await user.matchPassword(senha);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Credenciais inválidas'
    });
  }
  
  // Gerar token JWT
  const token = user.getSignedJwtToken();
  
  // Remover a senha do resultado
  user.senha = undefined;
  
  res.status(200).json({
    success: true,
    token,
    user
  });
});

// @desc    Obter usuário logado
// @route   GET /api/auth/me
// @access  Privado
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Obter todos os profissionais (para gerentes)
// @route   GET /api/auth/profissionais
// @access  Privado (somente gerentes)
export const getProfissionais = asyncHandler(async (req, res) => {
    // Verificar se o usuário é um gerente ou secretária
    if (req.user.role !== 'gerente' && req.user.role !== 'secretaria') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas gerentes e secretárias podem ver a lista de profissionais.'
      });
    }
    
    // Definir o filtro de consulta
    let query = { role: 'profissional' };
    
    // Se for gerente, filtrar apenas os profissionais vinculados a ele
    if (req.user.role === 'gerente') {
      query.gerente = req.user.id;
    }
    
    // Buscar os profissionais conforme o filtro
    const profissionais = await User.find(query);
    
    res.status(200).json({
      success: true,
      count: profissionais.length,
      data: profissionais
    });
  });

// @desc    Obter todos os gerentes
// @route   GET /api/auth/gerentes
// @access  Privado (somente gerentes e secretárias)
export const getGerentes = asyncHandler(async (req, res) => {
  // Verificar se o usuário é um gerente ou secretária
  if (req.user.role !== 'gerente' && req.user.role !== 'secretaria') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas gerentes e secretárias podem ver a lista de gerentes.'
    });
  }
  
  // Buscar todos os gerentes
  const gerentes = await User.find({ role: 'gerente' });
  
  res.status(200).json({
    success: true,
    count: gerentes.length,
    data: gerentes
  });
});

// @desc    Atualizar status de um usuário (ativar/desativar)
// @route   PUT /api/auth/usuarios/:id/status
// @access  Privado (somente gerentes)
export const atualizarStatusUsuario = asyncHandler(async (req, res) => {
  // Verificar se o usuário é um gerente
  if (req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas gerentes podem atualizar o status de usuários.'
    });
  }
  
  // Verificar se o status foi fornecido
  if (req.body.ativo === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, forneça o status do usuário (ativo)'
    });
  }
  
  // Buscar o usuário a ser atualizado
  const usuario = await User.findById(req.params.id);
  
  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: `Usuário não encontrado com o ID ${req.params.id}`
    });
  }
  
  // Garantir que o gerente só atualize usuários vinculados a ele
  if (usuario.role === 'profissional' && usuario.gerente.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Não autorizado a atualizar este usuário'
    });
  }
  
  // Atualizar o status
  usuario.ativo = req.body.ativo;
  await usuario.save();
  
  res.status(200).json({
    success: true,
    data: usuario
  });
});

// @desc    Verificar status da autenticação
// @route   GET /api/auth/check
// @access  Público
export const checkAuth = asyncHandler(async (req, res) => {
  try {
    // Extrair o token do header
    let token;
    if (
      req.headers.authorization && 
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(200).json({
        success: false,
        authenticated: false,
        message: 'Token não fornecido'
      });
    }

    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o usuário existe
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(200).json({
        success: false,
        authenticated: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Verificar se o usuário está ativo
    if (!user.ativo) {
      return res.status(200).json({
        success: false,
        authenticated: false,
        message: 'Conta desativada'
      });
    }
    
    // Usuário autenticado com sucesso
    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    return res.status(200).json({
      success: false,
      authenticated: false,
      message: 'Token inválido ou expirado',
      error: error.message
    });
  }
});
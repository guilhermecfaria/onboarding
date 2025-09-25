import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Middleware para proteger rotas
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Headers de autorização:', req.headers.authorization);

  // Verificar se o token está no header Authorization
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Formato: Bearer TOKEN
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extraído:', token ? token.substring(0, 10) + '...' : 'indefinido');
  }

  // Verificar se o token existe
  if (!token) {
    console.log('Acesso negado: Token não fornecido');
    return res.status(401).json({ 
      success: false, 
      message: 'Não autorizado a acessar esta rota. Token não fornecido.' 
    });
  }

  try {
    // Verificar o token
    console.log('Verificando token JWT...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    // Adicionar o usuário ao request
    req.user = await User.findById(decoded.id);
    console.log('Usuário encontrado:', req.user ? `ID: ${req.user._id}, Role: ${req.user.role}` : 'Não encontrado');

    // Verificar se o usuário existe
    if (!req.user) {
      console.log('Acesso negado: Usuário não encontrado');
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Verificar se o usuário está ativo
    if (!req.user.ativo) {
      console.log('Acesso negado: Usuário inativo');
      return res.status(401).json({ 
        success: false, 
        message: 'Sua conta está desativada. Entre em contato com um gerente.' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado. Faça login novamente.' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Não autorizado a acessar esta rota', 
      error: error.message
    });
  }
});

// Middleware para restringir acesso por role
export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`Verificando autorização: Role do usuário: ${req.user.role}, Roles permitidos: ${roles.join(', ')}`);
    
    if (!roles.includes(req.user.role)) {
      console.log(`Acesso negado: Role ${req.user.role} não tem permissão`);
      return res.status(403).json({ 
        success: false, 
        message: `Role ${req.user.role} não tem permissão para acessar esta rota` 
      });
    }
    
    console.log('Autorização concedida');
    next();
  };
};
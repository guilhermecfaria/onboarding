import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  getProfissionais, 
  getGerentes,
  atualizarStatusUsuario,
  registerWithMasterPassword,
  checkAuth
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/login', login);
router.post('/register-initial', register);  // Rota para o primeiro registro (sem auth)
router.post('/register-master', registerWithMasterPassword); // Nova rota para registro com senha master
router.get('/check', checkAuth); // Nova rota para verificar o status da autenticação

// Proteger todas as rotas abaixo
router.use(protect);

// Rotas protegidas
router.get('/me', getMe);
router.post('/register', authorize('gerente'), register);  // Para gerentes registrarem profissionais
router.get('/profissionais', authorize('gerente', 'secretaria'), getProfissionais);
router.get('/gerentes', authorize('gerente', 'secretaria'), getGerentes);
router.put('/usuarios/:id/status', authorize('gerente'), atualizarStatusUsuario);

export default router;
// routes/gerenteRoutes.js
import express from 'express';
import { 
  listarClientesPendentes,
  atribuirClienteProfissional,
  marcarClienteInelegivel,
  transferirClienteProfissional 
} from '../controllers/gerenteController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Middleware de proteção e autorização para todas as rotas
router.use(protect);
router.use(authorize('gerente'));

// Rota para listar clientes pendentes
router.get('/clientes-pendentes', listarClientesPendentes);

// Rota para atribuir cliente a um profissional
router.put('/atribuir-cliente/:clienteId', atribuirClienteProfissional);

// Rota para marcar cliente como inelegível
router.put('/inelegivel-cliente/:clienteId', marcarClienteInelegivel);

// Rota para transferir cliente de profissional
router.put('/transferir-cliente/:clienteId', transferirClienteProfissional);

export default router;
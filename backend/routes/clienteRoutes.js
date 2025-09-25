import express from 'express';
import { 
  criarCliente, 
  getClientes, 
  getCliente, 
  atualizarCliente, 
  excluirCliente,
  registrarAtendimento,
  removerUltimoAtendimento,
  atualizarValorAtendimento,
  agendarProximoAtendimento,
  atualizarObservacoesGerais
} from '../controllers/clienteController.js';
import { protect, authorize } from '../middleware/auth.js';
import questionarioRouter from './questionarioRoutes.js';

const router = express.Router();

// Rota pública para registro de clientes
router.post('/registro', criarCliente);

// Re-rotear para questionarioRoutes
router.use('/:clienteId/questionario', questionarioRouter);

router
  .route('/')
  .get(getClientes)
  .post(authorize('profissional', 'gerente'), criarCliente);

router
  .route('/:id')
  .get(authorize('profissional', 'gerente', 'secretaria'), getCliente)
  .put(authorize('profissional', 'gerente'), atualizarCliente)
  .delete(authorize('profissional', 'gerente'), excluirCliente);

// Novas rotas para atendimentos
router
  .route('/:id/atendimentos')
  .post(authorize('profissional', 'gerente', 'secretaria'), registrarAtendimento);

router
  .route('/:id/atendimentos/ultimo')
  .delete(authorize('profissional', 'gerente'), removerUltimoAtendimento);

router
  .route('/:id/valor-atendimento')
  .put(authorize('profissional', 'gerente'), atualizarValorAtendimento);

router
  .route('/:id/proximo-atendimento')
  .put(authorize('profissional', 'gerente', 'secretaria'), agendarProximoAtendimento);

router
  .route('/:id/observacoes-gerais')
  .put(authorize('profissional', 'gerente'), atualizarObservacoesGerais);

export default router;
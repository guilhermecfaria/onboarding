import express from 'express';
import { 
  getAgendamentos, 
  getAgendamento, 
  criarAgendamento, 
  atualizarAgendamento, 
  excluirAgendamento 
} from '../controllers/agendamentoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas necessitam de autenticação
router.use(protect);

// Rota para obter todos os agendamentos ou criar um novo
router.route('/')
  .get(getAgendamentos)
  .post(criarAgendamento);

// Rotas para operações com um agendamento específico
router.route('/:id')
  .get(getAgendamento)
  .put(atualizarAgendamento)
  .delete(excluirAgendamento);

export default router; 
import express from 'express';
import { 
  submeterQuestionario, 
  getQuestionario, 
  getEstatisticas,
  getEstrutura,
  criarEstruturaQuestionario,
  editarQuestionario
} from '../controllers/questionarioController.js';
import { protect, authorize } from '../middleware/auth.js';

// Usar mergeParams para acessar params de roteador pai
const router = express.Router({ mergeParams: true });

// Rota para editar questionário (SEM AUTENTICAÇÃO por enquanto)
router.put('/:id/editar', editarQuestionario);

// Rota para obter a estrutura do questionário (pública)
router.get('/estrutura', getEstrutura);

// Rota para criar/atualizar a estrutura do questionário (apenas gerentes)
router.post('/estrutura', protect, authorize('gerente'), criarEstruturaQuestionario);

// Rota para obter estatísticas (protegida)
router.get('/estatisticas', protect, authorize('profissional', 'gerente'), getEstatisticas);

// Rotas para submeter/obter questionário
router.route('/')
  .post(submeterQuestionario) // Pública para clientes responderem
  .get(protect, authorize('profissional', 'gerente'), getQuestionario); // Protegida

  export default router;
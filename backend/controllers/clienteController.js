import Cliente from '../models/Cliente.js';
import asyncHandler from 'express-async-handler';

// @desc    Criar um novo cliente
// @route   POST /api/clientes/registro ou /api/clientes
// @access  Público ou Privado (Gerente)
export const criarCliente = asyncHandler(async (req, res) => {
    // Se for uma rota protegida (profissional/gerente), exigir role de gerente
    if (req.user && req.user.role !== 'gerente') {
      return res.status(403).json({
        success: false,
        message: 'Apenas gerentes podem criar clientes diretamente'
      });
    }
  
    // Para rotas públicas, definir status inicial
    if (!req.user) {
      req.body.status = 'pendente';
      req.body.profissional = null; // Sem profissional inicial
      req.body.questionarioConcluido = false;
    } else {
      // Se for gerente criando, adicionar o ID do gerente
      req.body.profissional = req.user.id;
    }
  
    // Converter data de nascimento de dd/mm/yyyy para Date
    if (req.body.dataNascimento) {
        let dataConvertida;
       // Verificar se a data já está no formato ISO (yyyy-mm-dd)
    if (req.body.dataNascimento.includes('-')) {
        // Data já está no formato correto, apenas converter para objeto Date
        dataConvertida = new Date(req.body.dataNascimento);
    } else {
        // Formato dd/mm/yyyy
        const partesData = req.body.dataNascimento.split('/');
        dataConvertida = new Date(
        parseInt(partesData[2]),   // ano
        parseInt(partesData[1]) - 1, // mês (0-indexed)
        parseInt(partesData[0])    // dia
        );
    }
      // Validar data
      if (isNaN(dataConvertida.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento inválida'
        });
      }
  
      // Substituir a data no corpo da requisição
      req.body.dataNascimento = dataConvertida;
    }
  
    const cliente = await Cliente.create(req.body);
    
    res.status(201).json({
      success: true,
      data: cliente
    });
  });
  
// @desc    Obter todos os clientes do profissional logado
// @route   GET /api/clientes
// @access  Privado (Profissional)
export const getClientes = asyncHandler(async (req, res) => {
  let query;
  
  // Se for gerente e quiser ver todos os clientes
  if (req.query.todos === 'true') {
    query = Cliente.find();
  } 
  // Se for gerente e quiser ver apenas seus clientes atribuídos
  else {
    // Padrão - todos os clientes
    query = Cliente.find();
  }
  
  // Aplicar filtros por período se fornecidos
  if (req.query.periodo) {
    const hoje = new Date();
    let dataInicio = new Date();
    
    if (req.query.periodo === '7') {
      dataInicio.setDate(hoje.getDate() - 7);
    } else if (req.query.periodo === '30') {
      dataInicio.setDate(hoje.getDate() - 30);
    } else if (req.query.periodo === '90') {
      dataInicio.setDate(hoje.getDate() - 90);
    }
    
    query = query.find({
      createdAt: { $gte: dataInicio }
    });
  }
  
  const clientes = await query;
  
  res.status(200).json({
    success: true,
    count: clientes.length,
    data: clientes
  });
});

// @desc    Obter um cliente específico
// @route   GET /api/clientes/:id
// @access  Privado (Profissional/Gerente)
export const getCliente = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: `Cliente não encontrado com o ID ${req.params.id}`
    });
  }
  
  // Garantir que o profissional só acesse seus próprios clientes
  // Gerentes podem ver todos os clientes
  if (cliente.profissional && cliente.profissional.toString() !== req.user.id && req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Não autorizado a acessar este cliente'
    });
  }
  
  res.status(200).json({
    success: true,
    data: cliente
  });
});

// @desc    Atualizar um cliente
// @route   PUT /api/clientes/:id
// @access  Privado (Profissional/Gerente)
export const atualizarCliente = asyncHandler(async (req, res) => {
  let cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: `Cliente não encontrado com o ID ${req.params.id}`
    });
  }
  
  // Garantir que o profissional só atualize seus próprios clientes
  // Gerentes podem atualizar todos os clientes
  if (cliente.profissional && cliente.profissional.toString() !== req.user.id && req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Não autorizado a atualizar este cliente'
    });
  }
  
  cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: cliente
  });
});

// @desc    Excluir um cliente
// @route   DELETE /api/clientes/:id
// @access  Privado (Profissional/Gerente)
export const excluirCliente = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: `Cliente não encontrado com o ID ${req.params.id}`
    });
  }
  
  // Garantir que o profissional só exclua seus próprios clientes
  // Gerentes podem excluir todos os clientes
  if (cliente.profissional && cliente.profissional.toString() !== req.user.id && req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Não autorizado a excluir este cliente'
    });
  }
  
  await cliente.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// NOVAS FUNÇÕES

// @desc    Registrar novo atendimento para um cliente
// @route   POST /api/clientes/:id/atendimentos
// @access  Privado (Profissional/Gerente)
export const registrarAtendimento = asyncHandler(async (req, res) => {
  // Encontrar o cliente pelo ID
  let cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: `Cliente não encontrado com o ID ${req.params.id}`
    });
  }
  
  // Verificar permissão (apenas o profissional atribuído ou um gerente)
  if (cliente.profissional && cliente.profissional.toString() !== req.user.id && req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Não autorizado a registrar atendimento para este cliente'
    });
  }
  
  // Extrair dados do corpo da requisição
  const { observacoes, valor } = req.body;
  
  // Criar novo atendimento
  const novoAtendimento = {
    data: new Date(),
    profissional: req.user.id,
    observacoes: observacoes || 'Atendimento registrado',
    valor: valor || cliente.valorAtendimento || 150
  };
  
  // Adicionar ao array de atendimentos
  if (!cliente.atendimentos) {
    cliente.atendimentos = [];
  }
  
  cliente.atendimentos.push(novoAtendimento);
  
  // Salvar cliente
  await cliente.save();
  
  res.status(200).json({
    success: true,
    data: cliente,
    message: 'Atendimento registrado com sucesso'
  });
});

// @desc    Remover último atendimento de um cliente
// @route   DELETE /api/clientes/:id/atendimentos/ultimo
// @access  Privado (Profissional/Gerente)
export const removerUltimoAtendimento = asyncHandler(async (req, res) => {
  // Encontrar o cliente pelo ID
  let cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: `Cliente não encontrado com o ID ${req.params.id}`
    });
  }
  
  // Verificar permissão
  if (cliente.profissional && cliente.profissional.toString() !== req.user.id && req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Não autorizado a remover atendimento deste cliente'
    });
  }
  
  // Verificar se há atendimentos
  if (!cliente.atendimentos || cliente.atendimentos.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Este cliente não possui atendimentos registrados'
    });
  }
  
  // Remover o último atendimento
  cliente.atendimentos.pop();
  
  // Salvar cliente
  await cliente.save();
  
  res.status(200).json({
    success: true,
    data: cliente,
    message: 'Último atendimento removido com sucesso'
  });
});

// @desc    Atualizar valor padrão de atendimento
// @route   PUT /api/clientes/:id/valor-atendimento
// @access  Privado (Profissional/Gerente)
export const atualizarValorAtendimento = asyncHandler(async (req, res) => {
  // Encontrar o cliente pelo ID
  let cliente = await Cliente.findById(req.params.id);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: `Cliente não encontrado com o ID ${req.params.id}`
    });
  }
  
  // Verificar permissão
  if (cliente.profissional && cliente.profissional.toString() !== req.user.id && req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Não autorizado a atualizar este cliente'
    });
  }
  
  // Verificar se o valor foi fornecido
  if (req.body.valorAtendimento === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Valor do atendimento não fornecido'
    });
  }
  
  // Atualizar o valor padrão
  cliente.valorAtendimento = req.body.valorAtendimento;
  
  // Salvar cliente
  await cliente.save();
  
  res.status(200).json({
    success: true,
    data: cliente,
    message: 'Valor do atendimento atualizado com sucesso'
  });
});

// @desc    Agendar próximo atendimento
// @route   PUT /api/clientes/:id/proximo-atendimento
// @access  Privado (Profissional/Gerente/Secretaria)
export const agendarProximoAtendimento = asyncHandler(async (req, res) => {
  try {
    console.log(`Recebido pedido para agendar próximo atendimento para cliente ${req.params.id}`);
    console.log(`Dados recebidos:`, req.body);
    
    // Encontrar o cliente pelo ID
    let cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: `Cliente não encontrado com o ID ${req.params.id}`
      });
    }
    
    // Verificar permissão (exceto para secretárias que podem agendar para qualquer profissional)
    if (req.user.role !== 'secretaria' && cliente.profissional && cliente.profissional.toString() !== req.user.id && req.user.role !== 'gerente') {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a agendar atendimento para este cliente'
      });
    }
    
    // Verificar se a data foi fornecida
    if (!req.body.data) {
      return res.status(400).json({
        success: false,
        message: 'Data do próximo atendimento não fornecida'
      });
    }
    
    // Atualizar a data do próximo atendimento
    cliente.proximoAtendimento = new Date(req.body.data);
    
    // Salvar cliente
    const clienteAtualizado = await cliente.save();
    console.log(`Cliente ${cliente._id} atualizado com próximo atendimento em ${cliente.proximoAtendimento}`);
    
    res.status(200).json({
      success: true,
      data: clienteAtualizado,
      message: 'Próximo atendimento agendado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao agendar próximo atendimento:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao agendar atendimento: ${error.message}`
    });
  }
});

// controllers/clienteController.js
export const atualizarObservacoesGerais = asyncHandler(async (req, res) => {
    // Encontrar o cliente pelo ID
    let cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: `Cliente não encontrado com o ID ${req.params.id}`
      });
    }
    
    // Verificar permissão
    if (cliente.profissional && cliente.profissional.toString() !== req.user.id && req.user.role !== 'gerente') {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a atualizar este cliente'
      });
    }
    
    // Atualizar as observações gerais
    cliente.observacoesGerais = req.body.observacoesGerais || '';
    
    // Salvar cliente
    await cliente.save();
    
    res.status(200).json({
      success: true,
      data: cliente,
      message: 'Observações gerais atualizadas com sucesso'
    });
  });
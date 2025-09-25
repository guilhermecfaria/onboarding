// controllers/gerenteController.js
import Cliente from '../models/Cliente.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Listar clientes pendentes com questionário respondido
// @route   GET /api/gerente/clientes-pendentes
// @access  Privado (somente gerentes)
export const listarClientesPendentes = asyncHandler(async (req, res) => {
  // Buscar clientes com status pendente e questionário respondido
  const clientesPendentes = await Cliente.find({ 
    status: 'pendente',
    questionarioConcluido: true 
  });
  
  res.status(200).json({
    success: true,
    count: clientesPendentes.length,
    data: clientesPendentes
  });
});

// @desc    Atribuir cliente a um profissional
// @route   PUT /api/gerente/atribuir-cliente/:clienteId
// @access  Privado (somente gerentes)
export const atribuirClienteProfissional = asyncHandler(async (req, res) => {
  const { clienteId } = req.params;
  const { profissionalId, gerenteId, observacoesAptidao } = req.body;

  // Verificar se está sendo atribuído a um gerente ou a um profissional
  if (gerenteId) {
    // Validar se gerente existe
    const gerente = await User.findOne({ 
      _id: gerenteId, 
      role: 'gerente' 
    });

    if (!gerente) {
      return res.status(400).json({
        success: false,
        message: 'Gerente inválido'
      });
    }

    // Preparar dados de atualização para atribuição ao gerente
    const dadosAtualizacao = {
      gerente: gerenteId,
      profissional: null, // Removendo o profissional, se houver
      status: 'atribuido',
      dataAtribuicao: new Date()
    };

    // Adicionar observações de aptidão se fornecidas
    if (observacoesAptidao) {
      dadosAtualizacao.observacoesAptidao = observacoesAptidao;
    }

    // Buscar e atualizar o cliente
    const cliente = await Cliente.findByIdAndUpdate(
      clienteId, 
      dadosAtualizacao, 
      { 
        new: true,  // Retorna o documento atualizado
        runValidators: true  // Executa validadores do schema
      }
    );

    // Verificar se o cliente existe
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });
  } else if (profissionalId) {
    // Lógica existente para atribuir a um profissional
    // Validar se profissional existe e é um profissional
    const profissional = await User.findOne({ 
      _id: profissionalId, 
      role: 'profissional' 
    });

    if (!profissional) {
      return res.status(400).json({
        success: false,
        message: 'Profissional inválido'
      });
    }

    // Preparar dados de atualização
    const dadosAtualizacao = {
      profissional: profissionalId,
      gerente: null, // Removendo o gerente, se houver
      status: 'atribuido',
      dataAtribuicao: new Date()
    };

    // Adicionar observações de aptidão se fornecidas
    if (observacoesAptidao) {
      dadosAtualizacao.observacoesAptidao = observacoesAptidao;
    }

    // Buscar e atualizar o cliente
    const cliente = await Cliente.findByIdAndUpdate(
      clienteId, 
      dadosAtualizacao, 
      { 
        new: true,  // Retorna o documento atualizado
        runValidators: true  // Executa validadores do schema
      }
    );

    // Verificar se o cliente existe
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });
  } else {
    return res.status(400).json({
      success: false,
      message: 'É necessário fornecer um ID de profissional ou gerente'
    });
  }
});

// @desc    Marcar cliente como inelegível
// @route   PUT /api/gerente/inelegivel-cliente/:clienteId
// @access  Privado (somente gerentes)
export const marcarClienteInelegivel = asyncHandler(async (req, res) => {
  const { clienteId } = req.params;
  const { motivo, observacoesAptidao } = req.body;

  // Verificar se o motivo foi fornecido
  if (!motivo) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, forneça um motivo para inelegibilidade'
    });
  }

  // Preparar dados de atualização
  const dadosAtualizacao = {
    status: 'inelegivel',
    motivoInelegibilidade: motivo
  };

  // Adicionar observações de aptidão se fornecidas
  if (observacoesAptidao) {
    dadosAtualizacao.observacoesAptidao = observacoesAptidao;
  }

  // Atualizar o cliente
  const cliente = await Cliente.findByIdAndUpdate(
    clienteId, 
    dadosAtualizacao, 
    { 
      new: true,
      runValidators: true 
    }
  );

  // Verificar se o cliente existe
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: 'Cliente não encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: cliente
  });
});

// @desc    Transferir cliente entre profissionais
// @route   PUT /api/gerente/transferir-cliente/:clienteId
// @access  Privado (somente gerentes)
export const transferirClienteProfissional = asyncHandler(async (req, res) => {
  const { clienteId } = req.params;
  const { novoProfissionalId, observacoesTransferencia } = req.body;

  // Validar se o novo profissional existe
  const novoProfissional = await User.findOne({ 
    _id: novoProfissionalId, 
    role: 'profissional' 
  });

  if (!novoProfissional) {
    return res.status(400).json({
      success: false,
      message: 'Novo profissional inválido'
    });
  }

  // Preparar dados de atualização
  const dadosAtualizacao = {
    profissional: novoProfissionalId,
    gerente: null, // Removendo o gerente, se houver
    dataUltimaTransferencia: new Date()
  };

  // Adicionar observações de transferência se fornecidas
  if (observacoesTransferencia) {
    dadosAtualizacao.observacoesTransferencia = observacoesTransferencia;
  }

  // Atualizar o cliente
  const cliente = await Cliente.findByIdAndUpdate(
    clienteId, 
    dadosAtualizacao, 
    { 
      new: true,
      runValidators: true 
    }
  );

  // Verificar se o cliente existe
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: 'Cliente não encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: cliente,
    message: 'Cliente transferido com sucesso'
  });
});

// @desc    Atualizar observações de aptidão mental
// @route   PUT /api/gerente/observacoes-aptidao/:clienteId
// @access  Privado (somente gerentes)
export const atualizarObservacoesAptidao = asyncHandler(async (req, res) => {
  const { clienteId } = req.params;
  const { observacoesAptidao } = req.body;

  // Verificar se as observações foram fornecidas
  if (!observacoesAptidao) {
    return res.status(400).json({
      success: false,
      message: 'Por favor, forneça as observações de aptidão mental'
    });
  }

  // Atualizar o cliente
  const cliente = await Cliente.findByIdAndUpdate(
    clienteId, 
    { observacoesAptidao }, 
    { 
      new: true,
      runValidators: true 
    }
  );

  // Verificar se o cliente existe
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: 'Cliente não encontrado'
    });
  }

  res.status(200).json({
    success: true,
    data: cliente
  });
});
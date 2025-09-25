import Agendamento from '../models/Agendamento.js';
import Usuario from '../models/Usuario.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import Cliente from '../models/Cliente.js';

// @desc    Obter todos os agendamentos do profissional logado ou de um profissional específico
// @route   GET /api/agendamentos
// @access  Private
export const getAgendamentos = async (req, res) => {
  try {
    let profissionalId = req.user.id;
    let filtro = { 'profissional.id': profissionalId };
    
    // Verificar se a secretária está solicitando agendamentos de um profissional específico
    if (req.user.role === 'secretaria' && req.query.profissional) {
      console.log('Secretária buscando agendamentos para o profissional:', req.query.profissional);
      profissionalId = req.query.profissional;
      filtro = { 'profissional.id': profissionalId };
    }

    // Adicionar filtros por data, se fornecidos
    if (req.query.dataInicio && req.query.dataFim) {
      console.log(`Filtrando agendamentos entre ${req.query.dataInicio} e ${req.query.dataFim}`);
      filtro.data = { 
        $gte: req.query.dataInicio,
        $lte: req.query.dataFim
      };
    }
    
    // Buscar agendamentos onde o profissional.id corresponde ao id solicitado
    const agendamentos = await Agendamento.find(filtro)
      .populate({
        path: 'cliente.id',
        model: 'Cliente',
        select: 'nome email telefone'
      });
    
    // Formatar a resposta para incluir dados completos do cliente
    const agendamentosFormatados = agendamentos.map(agendamento => {
      const clientePopulado = agendamento.cliente.id;
      return {
        _id: agendamento._id,
        cliente: {
          _id: clientePopulado?._id || agendamento.cliente.id,
          nome: clientePopulado?.nome || agendamento.cliente.nome,
          email: clientePopulado?.email || '',
          telefone: clientePopulado?.telefone || '',
          cor: agendamento.cliente.cor
        },
        profissional: agendamento.profissional,
        data: agendamento.data,
        horario: agendamento.horario,
        tipoConsulta: agendamento.tipoConsulta,
        observacoes: agendamento.observacoes,
        dataHora: `${agendamento.data}T${agendamento.horario}`,
        createdAt: agendamento.createdAt,
        updatedAt: agendamento.updatedAt
      };
    });
    
    console.log(`Encontrados ${agendamentos.length} agendamentos para o profissional ${profissionalId}`);
    
    return res.status(200).json({
      success: true,
      count: agendamentosFormatados.length,
      data: agendamentosFormatados
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar agendamentos'
    });
  }
};

// @desc    Obter um agendamento específico
// @route   GET /api/agendamentos/:id
// @access  Private
export const getAgendamento = async (req, res) => {
  try {
    const agendamentoId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(agendamentoId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de agendamento inválido'
      });
    }
    
    const agendamento = await Agendamento.findById(agendamentoId);
    
    if (!agendamento) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }
    
    // Verificar se o agendamento pertence ao profissional logado
    if (agendamento.profissional.id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado a acessar este agendamento'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: agendamento
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar agendamento'
    });
  }
};

// @desc    Criar um novo agendamento
// @route   POST /api/agendamentos
// @access  Private
export const criarAgendamento = async (req, res) => {
  try {
    const { cliente, data, horario, tipoConsulta, observacoes, profissionalId, profissionalNome } = req.body;
    
    console.log('Controller criarAgendamento recebeu:', req.body);
    
    // Verificar dados obrigatórios
    if (!cliente || !cliente.nome || !data || !horario) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça todos os campos obrigatórios'
      });
    }
    
    // Determinar qual ID do profissional usar
    let profissionalIdFinal = req.user.id;
    let profissionalNomeFinal = req.user.nome || 'Profissional';
    
    // Se foi enviado um ID de profissional e o usuário é secretária
    if (req.user.role === 'secretaria' && profissionalId) {
      console.log(`Usuário é secretária, usando profissional ID: ${profissionalId}`);
      profissionalIdFinal = profissionalId;
      profissionalNomeFinal = profissionalNome || 'Profissional';
    }
    
    // Verificar se já existe um agendamento para este profissional nesta data e horário
    const agendamentoExistente = await Agendamento.findOne({
      'profissional.id': profissionalIdFinal,
      data,
      horario
    });
    
    if (agendamentoExistente) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um agendamento para este horário'
      });
    }
    
    // Dados completos do agendamento
    const dadosAgendamento = {
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        cor: cliente.cor || '#2196F3'
      },
      profissional: {
        id: profissionalIdFinal,
        nome: profissionalNomeFinal
      },
      data,
      horario,
      tipoConsulta: tipoConsulta || 'Consulta Padrão',
      observacoes: observacoes || ''
    };
    
    // Log dos dados que serão salvos
    console.log('Dados completos do agendamento a ser criado:', dadosAgendamento);
    
    // Criar o agendamento
    const novoAgendamento = await Agendamento.create(dadosAgendamento);
    
    console.log('Agendamento criado com sucesso. ID:', novoAgendamento._id);
    
    // Verificar se precisamos também atualizar o cliente com o próximo atendimento
    if (cliente.id && mongoose.Types.ObjectId.isValid(cliente.id)) {
      try {
        const clienteObj = await Cliente.findById(cliente.id);
        if (clienteObj) {
          // Atualizar o próximo atendimento do cliente com a data formatada
          const dataAtendimento = new Date(`${data}T${horario}`);
          clienteObj.proximoAtendimento = dataAtendimento;
          await clienteObj.save();
          console.log('Cliente atualizado com o próximo atendimento:', clienteObj._id);
        }
      } catch (clienteError) {
        console.error('Erro ao atualizar cliente, mas agendamento foi criado:', clienteError);
      }
    }
    
    // Retornar o agendamento criado
    return res.status(201).json({
      success: true,
      data: novoAgendamento
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    
    // Verificar se é um erro de duplicidade (violação do índice único)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um agendamento para este horário'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar agendamento',
      detalhes: error.message
    });
  }
};

// @desc    Atualizar um agendamento
// @route   PUT /api/agendamentos/:id
// @access  Private
export const atualizarAgendamento = async (req, res) => {
  try {
    const agendamentoId = req.params.id;
    const { cliente, data, horario, tipoConsulta, observacoes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(agendamentoId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de agendamento inválido'
      });
    }
    
    // Verificar se o agendamento existe
    let agendamento = await Agendamento.findById(agendamentoId);
    
    if (!agendamento) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }
    
    // Verificar se o agendamento pertence ao profissional logado
    if (agendamento.profissional.id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado a atualizar este agendamento'
      });
    }
    
    // Se estiver mudando data ou horário, verificar se o novo horário já está ocupado
    if ((data && data !== agendamento.data) || (horario && horario !== agendamento.horario)) {
      const agendamentoExistente = await Agendamento.findOne({
        'profissional.id': req.user.id,
        data: data || agendamento.data,
        horario: horario || agendamento.horario,
        _id: { $ne: agendamentoId } // excluir o agendamento atual da busca
      });
      
      if (agendamentoExistente) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um agendamento para este horário'
        });
      }
    }
    
    // Preparar objeto de atualização
    const dadosAtualizados = {
      ...(cliente && { 
        cliente: {
          id: cliente.id || agendamento.cliente.id,
          nome: cliente.nome || agendamento.cliente.nome,
          cor: cliente.cor || agendamento.cliente.cor || '#2196F3'
        } 
      }),
      ...(data && { data }),
      ...(horario && { horario }),
      ...(tipoConsulta && { tipoConsulta }),
      observacoes: observacoes !== undefined ? observacoes : agendamento.observacoes,
      updatedAt: Date.now()
    };
    
    // Atualizar o agendamento
    agendamento = await Agendamento.findByIdAndUpdate(
      agendamentoId,
      dadosAtualizados,
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      data: agendamento
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    
    // Verificar se é um erro de duplicidade (violação do índice único)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Já existe um agendamento para este horário'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar agendamento'
    });
  }
};

// @desc    Excluir um agendamento
// @route   DELETE /api/agendamentos/:id
// @access  Private
export const excluirAgendamento = async (req, res) => {
  try {
    const agendamentoId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(agendamentoId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de agendamento inválido'
      });
    }
    
    // Verificar se o agendamento existe
    const agendamento = await Agendamento.findById(agendamentoId);
    
    if (!agendamento) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }
    
    // Verificar se o agendamento pertence ao profissional logado
    if (agendamento.profissional.id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado a excluir este agendamento'
      });
    }
    
    // Excluir o agendamento
    await Agendamento.findByIdAndDelete(agendamentoId);
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao excluir agendamento'
    });
  }
}; 
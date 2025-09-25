import Questionario from '../models/Questionario.js';
import QuestionarioEstrutura from '../models/QuestionarioEstrutura.js';
import Cliente from '../models/Cliente.js';
import asyncHandler from 'express-async-handler';

// @desc    Obter a estrutura do questionário
// @route   GET /api/questionarios/estrutura
// @access  Público
export const getEstrutura = asyncHandler(async (req, res) => {
  const estrutura = await QuestionarioEstrutura.findOne({ ativo: true }).sort('-createdAt');
  
  if (!estrutura) {
    return res.status(404).json({
      success: false,
      message: 'Estrutura do questionário não encontrada'
    });
  }
  
  res.status(200).json({
    success: true,
    data: estrutura
  });
});

// @desc    Submeter um novo questionário
// @route   POST /api/clientes/:clienteId/questionario
// @access  Público (para clientes responderem)
export const submeterQuestionario = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.clienteId);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: `Cliente não encontrado com o ID ${req.params.clienteId}`
    });
  }
  
  // Verificar se já existe um questionário para este cliente
  const questionarioExistente = await Questionario.findOne({ cliente: req.params.clienteId });
  
  if (questionarioExistente) {
    return res.status(400).json({
      success: false,
      message: 'Este cliente já respondeu o questionário'
    });
  }
  
  // Obter a estrutura mais recente do questionário
  const estrutura = await QuestionarioEstrutura.findOne({ ativo: true }).sort('-createdAt');
  
  if (!estrutura) {
    return res.status(404).json({
      success: false,
      message: 'Estrutura do questionário não encontrada'
    });
  }
  
  // Validar as respostas recebidas
  const { respostas } = req.body;
  
  if (!respostas || !Array.isArray(respostas)) {
    return res.status(400).json({
      success: false,
      message: 'As respostas devem ser fornecidas como um array'
    });
  }
  
  // Criar o questionário com os dados enviados
  const questionario = await Questionario.create({
    cliente: req.params.clienteId,
    estrutura: estrutura._id,
    versaoEstrutura: estrutura.versao,
    respostas: respostas
  });
  
  // Calcular os resultados
  await questionario.calcularResultados();
  await questionario.save();
  
  // Atualizar status do cliente
  cliente.questionarioConcluido = true;
  await cliente.save();
  
  res.status(201).json({
    success: true,
    data: questionario
  });
});

// @desc    Obter o questionário de um cliente
// @route   GET /api/clientes/:clienteId/questionario
// @access  Privado (Profissional/Gerente)
export const getQuestionario = asyncHandler(async (req, res) => {
  const cliente = await Cliente.findById(req.params.clienteId);
  
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message: `Cliente não encontrado com o ID ${req.params.clienteId}`
    });
  }
  
  // Verificar permissão (apenas gerentes)
  if (req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Não autorizado a acessar este questionário'
    });
  }
  
  const questionario = await Questionario.findOne({ cliente: req.params.clienteId }).populate('estrutura');
  
  if (!questionario) {
    return res.status(404).json({
      success: false,
      message: 'Questionário não encontrado para este cliente'
    });
  }
  
  res.status(200).json({
    success: true,
    data: questionario
  });
});

// @desc    Obter estatísticas dos questionários
// @route   GET /api/questionarios/estatisticas
// @access  Privado (Profissional/Gerente)
export const getEstatisticas = asyncHandler(async (req, res) => {
  let query;
  
  // Se for gerente e quiser ver todas as estatísticas
  if (req.user.role === 'gerente' && req.query.todos === 'true') {
    query = Questionario.find();
  } else {
    // Buscar IDs dos clientes deste profissional
    const clientesIds = await Cliente.find({ profissional: req.user.id }).select('_id');
    const clientesIdsArray = clientesIds.map(obj => obj._id);
    
    // Buscar questionários destes clientes
    query = Questionario.find({ cliente: { $in: clientesIdsArray } });
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
  
  const questionarios = await query;
  
  // Processar estatísticas
  const estatisticas = {
    total: questionarios.length,
    tiposPredominantes: {
      NO: questionarios.filter(q => q.resultado.tipoPredominante === 'NO').length,
      SO: questionarios.filter(q => q.resultado.tipoPredominante === 'SO').length,
      NE: questionarios.filter(q => q.resultado.tipoPredominante === 'NE').length,
      SE: questionarios.filter(q => q.resultado.tipoPredominante === 'SE').length
    }
  };
  
  res.status(200).json({
    success: true,
    data: estatisticas
  });
});

// @desc    Criar ou atualizar a estrutura do questionário
// @route   POST /api/questionarios/estrutura
// @access  Privado (Apenas gerentes)
// @desc    Editar questionário (adicionar campos do gerente)
// @route   PUT /api/questionarios/:id/editar
// @access  Privado (Apenas gerentes)
export const editarQuestionario = asyncHandler(async (req, res) => {
  console.log('Função editarQuestionario chamada:', {
    id: req.params.id,
    body: req.body,
    testeTiro: req.body.testeTiro,
    comentarioLivre: req.body.comentarioLivre
  });
  
  const { testeTiro, comentarioLivre } = req.body;
  
  // Buscar o questionário
  const questionario = await Questionario.findById(req.params.id);
  
  if (!questionario) {
    return res.status(404).json({
      success: false,
      message: 'Questionário não encontrado'
    });
  }
  
  // Atualizar campos
  questionario.testeTiro = testeTiro;
  questionario.comentarioLivre = comentarioLivre;
  questionario.editado = true;
  questionario.dataEdicao = new Date();
  
  await questionario.save();
  
  res.status(200).json({
    success: true,
    data: questionario,
    message: 'Questionário editado com sucesso'
  });
});

export const criarEstruturaQuestionario = asyncHandler(async (req, res) => {
  // Verificar se o usuário é um gerente
  if (req.user.role !== 'gerente') {
    return res.status(403).json({
      success: false,
      message: 'Apenas gerentes podem criar ou atualizar a estrutura do questionário'
    });
  }
  
  // Desativar todas as estruturas existentes
  await QuestionarioEstrutura.updateMany({}, { ativo: false });
  
  // Criar a nova estrutura
  const estrutura = await QuestionarioEstrutura.create({
    titulo: 'QUESTIONÁRIO PARA IDENTIFICAÇÃO DAS APTIDÕES DOMINANTES',
    descricao: 'Questionário para identificar suas aptidões predominantes',
    versao: req.body.versao || '1.0',
    categorias: [
      {
        numero: 1,
        titulo: 'Atividades de minha preferência na infância',
        descricao: 'Assinale quatro',
        tipo: 'multipla',
        qtdEscolhas: 4,
        opcoes: [
          { numero: '1.1', texto: 'Aeromodelismo', tipo: 'NO' },
          { numero: '1.2', texto: 'Amarelinha', tipo: 'SO' },
          { numero: '1.3', texto: 'Jogos de tabuleiro', tipo: 'NO' },
          { numero: '1.4', texto: 'Bonecas/bonecos', tipo: 'SE' },
          { numero: '1.5', texto: 'Bolas de gude', tipo: 'SO' },
          { numero: '1.6', texto: 'Ciranda', tipo: 'SE' },
          { numero: '1.7', texto: 'Decifrar charadas', tipo: 'NE' },
          { numero: '1.8', texto: 'Desenhar', tipo: 'NE' },
          { numero: '1.9', texto: 'Desmontar coisas', tipo: 'NO' },
          { numero: '1.10', texto: 'Empinar pipas', tipo: 'NE' },
          { numero: '1.11', texto: 'Futebol de botão', tipo: 'SO' },
          { numero: '1.12', texto: 'Jogo da Velha', tipo: 'SO' },
          { numero: '1.13', texto: 'Jogos de bola', tipo: 'SE' },
          { numero: '1.14', texto: 'Mocinho/bandido', tipo: 'SE' },
          { numero: '1.15', texto: 'Quebra-cabeças', tipo: 'NE' },
          { numero: '1.16', texto: 'Jogo de xadrez', tipo: 'NO' }
        ]
      },
      {
        numero: 2,
        titulo: 'Atividades de minha preferência na escola',
        descricao: 'Assinale quatro',
        tipo: 'multipla',
        qtdEscolhas: 4,
        opcoes: [
          { numero: '2.1', texto: 'Aritmética/matemática', tipo: 'NO' },
          { numero: '2.2', texto: 'Ciências físicas/física', tipo: 'NO' },
          { numero: '2.3', texto: 'Humanas/psicologia', tipo: 'SE' },
          { numero: '2.4', texto: 'Desenho Artístico', tipo: 'NE' },
          { numero: '2.5', texto: 'Engenharia', tipo: 'NO' },
          { numero: '2.6', texto: 'Economia', tipo: 'NO' },
          { numero: '2.7', texto: 'Geografia', tipo: 'SO' },
          { numero: '2.8', texto: 'Geometria', tipo: 'SO' },
          { numero: '2.9', texto: 'História', tipo: 'SE' },
          { numero: '2.10', texto: 'Leitura', tipo: 'SO' },
          { numero: '2.11', texto: 'Línguas', tipo: 'SE' },
          { numero: '2.12', texto: 'Música', tipo: 'NE' },
          { numero: '2.13', texto: 'Poesia/declamação', tipo: 'SE' },
          { numero: '2.14', texto: 'Português/gramática', tipo: 'SO' },
          { numero: '2.15', texto: 'Redação/composição', tipo: 'NE' },
          { numero: '2.16', texto: 'Trabalhos manuais', tipo: 'NE' }
        ]
      },
      {
        numero: 3,
        titulo: 'Atividades de minha preferência no trabalho',
        descricao: 'Assinale quatro',
        tipo: 'multipla',
        qtdEscolhas: 4,
        opcoes: [
          { numero: '3.1', texto: 'Administração de processos', tipo: 'SO' },
          { numero: '3.2', texto: 'Análise de problemas', tipo: 'NO' },
          { numero: '3.3', texto: 'Assuntos administrativos', tipo: 'SO' },
          { numero: '3.4', texto: 'Assuntos financeiros', tipo: 'NO' },
          { numero: '3.5', texto: 'Assuntos humanos/sociais', tipo: 'SE' },
          { numero: '3.6', texto: 'Assuntos técnicos', tipo: 'NO' },
          { numero: '3.7', texto: 'Criação/desenvolvimento de ideias', tipo: 'NE' },
          { numero: '3.8', texto: 'Ensinar/treinar', tipo: 'SE' },
          { numero: '3.9', texto: 'Estruturas/organização', tipo: 'SO' },
          { numero: '3.10', texto: 'Orçamentos', tipo: 'NO' },
          { numero: '3.11', texto: 'Plano de ação', tipo: 'SO' },
          { numero: '3.12', texto: 'Estratégia global', tipo: 'NE' },
          { numero: '3.13', texto: 'Propaganda', tipo: 'SE' },
          { numero: '3.14', texto: 'Relações públicas', tipo: 'SE' },
          { numero: '3.15', texto: 'Testes de mercado', tipo: 'NE' },
          { numero: '3.16', texto: 'Trabalho em equipe', tipo: 'SE' }
        ]
      },
      {
        numero: 4,
        titulo: 'Atividades de minha preferência no lazer',
        descricao: 'Assinale quatro',
        tipo: 'multipla',
        qtdEscolhas: 4,
        opcoes: [
          { numero: '4.1', texto: 'Artesanato', tipo: 'NE' },
          { numero: '4.2', texto: 'Arrumar coisas', tipo: 'SO' },
          { numero: '4.3', texto: 'Assistir corridas', tipo: 'SE' },
          { numero: '4.4', texto: 'Campismo', tipo: 'NE' },
          { numero: '4.5', texto: 'Coleções', tipo: 'SO' },
          { numero: '4.6', texto: 'Conhecer lugares novos', tipo: 'NE' },
          { numero: '4.7', texto: 'Consertar aparelhos', tipo: 'NO' },
          { numero: '4.8', texto: 'Dançar', tipo: 'SE' },
          { numero: '4.9', texto: 'Desenho/pintura', tipo: 'NE' },
          { numero: '4.10', texto: 'Esportes coletivos', tipo: 'SO' },
          { numero: '4.11', texto: 'Fotografia', tipo: 'SO' },
          { numero: '4.12', texto: 'Jogar xadrez', tipo: 'NO' },
          { numero: '4.13', texto: 'Leituras técnicas', tipo: 'NO' },
          { numero: '4.14', texto: 'Pescar', tipo: 'SE' },
          { numero: '4.15', texto: 'Reuniões sociais', tipo: 'SE' },
          { numero: '4.16', texto: 'Trabalhar com o computador', tipo: 'NO' }
        ]
      },
      {
        numero: 5,
        titulo: 'Meus descritivos',
        descricao: 'Assinale quatro',
        tipo: 'multipla',
        qtdEscolhas: 4,
        opcoes: [
          { numero: '5.1', texto: 'Afetuoso', tipo: 'SE' },
          { numero: '5.2', texto: 'Analítico', tipo: 'NO' },
          { numero: '5.3', texto: 'Brincalhão', tipo: 'NE' },
          { numero: '5.4', texto: 'Cauteloso', tipo: 'SO' },
          { numero: '5.5', texto: 'Detalhista', tipo: 'SO' },
          { numero: '5.6', texto: 'Emotivo', tipo: 'SE' },
          { numero: '5.7', texto: 'Esmerado', tipo: 'SO' },
          { numero: '5.8', texto: 'Extrovertido', tipo: 'SE' },
          { numero: '5.9', texto: 'Falante', tipo: 'SE' },
          { numero: '5.10', texto: 'Fantasioso', tipo: 'NO' },
          { numero: '5.11', texto: 'Introvertido', tipo: 'NO' },
          { numero: '5.12', texto: 'Intuitivo', tipo: 'NE' },
          { numero: '5.13', texto: 'Organizado', tipo: 'SO' },
          { numero: '5.14', texto: 'Racional', tipo: 'NO' },
          { numero: '5.15', texto: 'Subjetivo', tipo: 'SE' },
          { numero: '5.16', texto: 'Técnico', tipo: 'NE' }
        ]
      },
      {
        numero: 6,
        titulo: 'Minhas motivações',
        descricao: 'Assinale uma em cada grupo',
        tipo: 'grupo',
        grupos: [
          {
            titulo: 'Eu trabalho melhor quando:',
            opcoes: [
              { numero: '6.1', texto: 'Tudo está bem organizado', tipo: 'SO' },
              { numero: '6.2', texto: 'Disponho de informações concretas', tipo: 'NO' },
              { numero: '6.3', texto: 'Tenho oportunidade de usar a imaginação', tipo: 'NE' },
              { numero: '6.4', texto: 'Posso compartilhar minhas ideias com outros', tipo: 'SE' }
            ]
          },
          {
            titulo: 'Falta-me ânimo para empreender uma atividade quando:',
            opcoes: [
              { numero: '6.5', texto: 'Não consigo vislumbrar sua utilidade prática', tipo: 'NO' },
              { numero: '6.6', texto: 'Ela não apresenta desafio para minha inteligência', tipo: 'NE' },
              { numero: '6.7', texto: 'Tenho de trabalhar sozinho', tipo: 'SE' },
              { numero: '6.8', texto: 'Tenho de trabalhar com pessoas indisciplinadas', tipo: 'SO' }
            ]
          },
          {
            titulo: 'Eu me entusiasmo com uma atividade quando:',
            opcoes: [
              { numero: '6.9', texto: 'Conheço tudo a respeito', tipo: 'NO' },
              { numero: '6.10', texto: 'Ela apresenta regras bem definidas', tipo: 'SO' },
              { numero: '6.11', texto: 'As pessoas envolvidas trabalham em harmonia', tipo: 'SE' },
              { numero: '6.12', texto: 'Posso testar minha capacidade', tipo: 'NE' }
            ]
          },
          {
            titulo: 'Eu me aborreço quando:',
            opcoes: [
              { numero: '6.13', texto: 'Vejo as coisas bagunçadas', tipo: 'SO' },
              { numero: '6.14', texto: 'Não posso trabalhar com coisas concretas', tipo: 'NO' },
              { numero: '6.15', texto: 'As pessoas discutem e brigam', tipo: 'SE' },
              { numero: '6.16', texto: 'Cerceiam minha criatividade', tipo: 'NE' }
            ]
          }
        ]
      },
      {
        numero: 7,
        titulo: 'Minhas reações',
        descricao: 'Assinale uma em cada grupo',
        tipo: 'grupo',
        grupos: [
          {
            titulo: 'Quando pedem minha aprovação para uma ideia:',
            opcoes: [
              { numero: '7.1', texto: 'Quero examinar sua lógica e racionalidade', tipo: 'NO' },
              { numero: '7.2', texto: 'Preciso ter confiança nas pessoas envolvidas', tipo: 'SE' },
              { numero: '7.3', texto: 'Quero saber como ela será executada na prática', tipo: 'SO' },
              { numero: '7.4', texto: 'Quero descobrir se ela é inovadora', tipo: 'NE' }
            ]
          },
          {
            titulo: 'Quando resistem às minhas ideias:',
            opcoes: [
              { numero: '7.5', texto: 'Explico, passo a passo, sua aplicação', tipo: 'SO' },
              { numero: '7.6', texto: 'Demonstro seu valor com dados e fatos', tipo: 'NO' },
              { numero: '7.7', texto: 'Trato de granjear a simpatia dos envolvidos', tipo: 'SE' },
              { numero: '7.8', texto: 'Procuro estimular a imaginação dos envolvidos', tipo: 'NE' }
            ]
          },
          {
            titulo: 'Quando não entendo uma instrução:',
            opcoes: [
              { numero: '7.9', texto: 'É porque não me mostraram/explicaram em detalhes', tipo: 'SO' },
              { numero: '7.10', texto: 'É porque não entendo seus objetivos e coerência', tipo: 'NO' },
              { numero: '7.11', texto: 'É porque não gosto da instrução ou do instrutor', tipo: 'SE' },
              { numero: '7.12', texto: 'É porque ela é muito "quadrada" ou conservadora', tipo: 'NE' }
            ]
          },
          {
            titulo: 'Quando não entendem minhas instruções:',
            opcoes: [
              { numero: '7.13', texto: 'Reenfatizo utilizando exemplos ilustrativos', tipo: 'SO' },
              { numero: '7.14', texto: 'Trato de chegar ao "coração" dos envolvidos', tipo: 'SE' },
              { numero: '7.15', texto: 'Faço uma demonstração organizada de suas etapas', tipo: 'SO' },
              { numero: '7.16', texto: 'Apresento todos os dados e fatos que as reforçam', tipo: 'NO' }
            ]
          }
        ]
      },
      {
        numero: 8,
        titulo: 'Minhas convicções',
        descricao: 'Assinale as quatro frases que você, com mais entusiasmo, assinalaria embaixo',
        tipo: 'multipla',
        qtdEscolhas: 4,
        opcoes: [
          { numero: '8.1', texto: 'Só a informação traz o poder. (Freud)', tipo: 'NO' },
          { numero: '8.2', texto: 'Nunca ande pelo caminho traçado, pois ele conduz somente aonde os outros já foram. (Graham Bell)', tipo: 'NE' },
          { numero: '8.3', texto: 'Se você quer civilizar um homem, comece pela avó dele. (Victor Hugo)', tipo: 'SE' },
          { numero: '8.4', texto: 'O que mais precisamos é de alguém que nos obrigue a fazer o que sabemos. (Ralph Waldo Emerson)', tipo: 'SO' },
          { numero: '8.5', texto: 'Mais vale um pássaro na mão do que dois voando. (Popular)', tipo: 'SO' },
          { numero: '8.6', texto: 'O futuro pertence àqueles que acreditam na beleza de seus sonhos. (Eleanor Roosevelt)', tipo: 'NE' },
          { numero: '8.7', texto: 'Quem sabe mais, chora menos. (Popular)', tipo: 'NO' },
          { numero: '8.8', texto: 'Um irmão pode não ser um amigo, mas um amigo será sempre um irmão. (Benjamin Franklin)', tipo: 'SE' },
          { numero: '8.9', texto: 'O passo mais importante para chegar a concentrar-se é aprender a estar sozinho consigo mesmo. (Erich Fromm)', tipo: 'NO' },
          { numero: '8.10', texto: 'A imaginação é mais importante do que o conhecimento. (Albert Einstein)', tipo: 'NE' },
          { numero: '8.11', texto: 'Uma andorinha só não faz verão. (Popular)', tipo: 'SE' },
          { numero: '8.12', texto: 'Mais difícil do que levar uma vida organizada é impô-la aos outros. (Marcel Proust)', tipo: 'SO' },
          { numero: '8.13', texto: 'Uma alegria compartilhada transforma-se em dupla alegria; uma dor compartilhada, em meia dor. (Popular)', tipo: 'SE' },
          { numero: '8.14', texto: 'O humor é a quebra da lógica. (Henri Bergson)', tipo: 'NE' },
          { numero: '8.15', texto: 'Quem não arrisca, não petisca. (Popular)', tipo: 'SO' },
          { numero: '8.16', texto: 'O discernimento consiste em saber até onde se pode ir. (Jean Cocteau)', tipo: 'NO' }
        ]
      }
      
    ]
  });
  
  res.status(201).json({
    success: true,
    data: estrutura
  });
});
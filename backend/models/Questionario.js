import mongoose from 'mongoose';

// Esquema para as respostas do questionário
const RespostaSchema = new mongoose.Schema({
  categoria: Number,       // Número da categoria (1, 2, 3, etc.)
  opcoesSelecionadas: [String]  // Lista de opções selecionadas ("1.1", "1.5", etc.)
});

// Esquema principal do questionário
const QuestionarioSchema = new mongoose.Schema({
  // Relacionamento com o cliente
  cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cliente', 
    required: true 
  },
  
  // Relacionamento com a estrutura do questionário
  estrutura: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionarioEstrutura'
  },
  
  // Versão da estrutura usada
  versaoEstrutura: String,
  
  // Respostas do usuário (formato novo)
  respostas: [RespostaSchema],
  
  // Resultado da análise
  resultado: {
    NO: { type: Number, default: 0 },   // Pontuação Norte
    SO: { type: Number, default: 0 },   // Pontuação Sul
    NE: { type: Number, default: 0 },   // Pontuação Nordeste
    SE: { type: Number, default: 0 },   // Pontuação Sudeste
    tipoPredominante: { 
      type: String, 
      enum: ['NO', 'SO', 'NE', 'SE'] 
    },
    recomendacoes: { type: String }
  },
  
  // Data de conclusão
  dataConclusao: { 
    type: Date, 
    default: Date.now 
  },
  
  // Campos de edição do gerente - Teste de Tiro
  testeTiro: {
    checkbox1: { type: Boolean, default: false },
    checkbox2: { type: Boolean, default: false },
    checkbox3: { type: Boolean, default: false },
    checkbox4: { type: Boolean, default: false }
  },
  
  // Comentário livre do gerente
  comentarioLivre: { type: String, default: '' },
  
  // Status de edição
  editado: { type: Boolean, default: false },
  dataEdicao: { type: Date },
  gerenteEditor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Método para calcular resultados com base nas respostas
QuestionarioSchema.methods.calcularResultados = async function() {
  // Precisamos da estrutura do questionário para saber o tipo de cada opção
  const estrutura = await mongoose.model('QuestionarioEstrutura').findById(this.estrutura);
  
  if (!estrutura) {
    throw new Error('Estrutura do questionário não encontrada');
  }
  
  // Mapeamento de todas as opções para seus tipos (NO, SO, NE, SE)
  const tiposPorOpcao = {};
  
  estrutura.categorias.forEach(categoria => {
    categoria.opcoes.forEach(opcao => {
      tiposPorOpcao[opcao.numero] = opcao.tipo;
    });
  });
  
  // Contadores para cada tipo
  let countNO = 0, countSO = 0, countNE = 0, countSE = 0;
  
  // Contar ocorrências de cada tipo nas respostas
  this.respostas.forEach(resposta => {
    resposta.opcoesSelecionadas.forEach(opcao => {
      const tipo = tiposPorOpcao[opcao];
      
      if (tipo === 'NO') countNO++;
      else if (tipo === 'SO') countSO++;
      else if (tipo === 'NE') countNE++;
      else if (tipo === 'SE') countSE++;
    });
  });
  
  // Atualizar pontuações
  this.resultado.NO = countNO;
  this.resultado.SO = countSO;
  this.resultado.NE = countNE;
  this.resultado.SE = countSE;
  
  // Determinar tipo predominante
  const pontuacoes = [
    { tipo: 'NO', valor: countNO },
    { tipo: 'SO', valor: countSO },
    { tipo: 'NE', valor: countNE },
    { tipo: 'SE', valor: countSE }
  ];
  
  // Ordenar por valor (maior para menor)
  pontuacoes.sort((a, b) => b.valor - a.valor);
  
  // O tipo predominante é o primeiro após ordenação
  this.resultado.tipoPredominante = pontuacoes[0].tipo;
  
  // Gerar recomendações com base no tipo predominante
  const descricoesTipos = {
    NO: "RACIONAL/TÉCNICO - Você tem forte aptidão para trabalhos técnicos, análise lógica e resolução de problemas. Prefere trabalhar com dados concretos e objetivos, buscando eficiência e resultados práticos.",
    SO: "ORGANIZADOR/DETALHISTA - Você tem forte aptidão para organização, planejamento e trabalho metódico. Valoriza a ordem, disciplina e estrutura, destacando-se em tarefas que exigem atenção aos detalhes e procedimentos bem definidos.",
    NE: "CRIATIVO/INOVADOR - Você tem forte aptidão para atividades criativas, inovação e pensamento conceitual. Prefere ambientes dinâmicos que permitam liberdade para experimentar novas ideias e soluções originais.",
    SE: "SOCIAL/EMOCIONAL - Você tem forte aptidão para interações sociais, comunicação e trabalho em equipe. É sensível às necessidades dos outros, destacando-se em atividades que envolvem relacionamentos interpessoais e expressão emocional."
  };
  
  this.resultado.recomendacoes = descricoesTipos[this.resultado.tipoPredominante] || 'Recomendações gerais com base em seu perfil.';
  
  return this.resultado;
};

export default mongoose.model('Questionario', QuestionarioSchema);
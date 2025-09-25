import mongoose from 'mongoose';

// Modelo para cada opção de resposta no questionário
const OpcaoSchema = new mongoose.Schema({
  numero: String,         // "1.1", "2.3", etc.
  texto: String,          // Texto da opção
  tipo: {                 // Classificação da opção
    type: String,
    enum: ['NO', 'SO', 'NE', 'SE'],
    required: true
  }
});

// Modelo para grupos de perguntas (usado nas categorias 6 e 7)
const GrupoSchema = new mongoose.Schema({
  titulo: String,         // "Eu trabalho melhor quando:", etc.
  opcoes: [OpcaoSchema]   // Lista de opções neste grupo
});

// Modelo para cada categoria/seção do questionário
const CategoriaSchema = new mongoose.Schema({
  numero: Number,         // 1, 2, 3, etc.
  titulo: String,         // "Atividades de minha preferência na infância"
  descricao: String,      // "Assinale quatro"
  tipo: {                 
    type: String,
    enum: ['multipla', 'grupo'], // Seleção múltipla ou grupo de escolha única
    default: 'multipla'
  },
  qtdEscolhas: {
    type: Number,
    default: 4            // Quantas escolhas o usuário deve fazer (para tipo 'multipla')
  },
  opcoes: [OpcaoSchema],  // Lista de opções para tipo 'multipla'
  grupos: [GrupoSchema]   // Lista de grupos para tipo 'grupo'
});

// Modelo para a estrutura completa do questionário
const QuestionarioEstruturaSchema = new mongoose.Schema({
  versao: {
    type: String,
    default: '1.0'
  },
  titulo: String,
  descricao: String,
  categorias: [CategoriaSchema],
  ativo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('QuestionarioEstrutura', QuestionarioEstruturaSchema);
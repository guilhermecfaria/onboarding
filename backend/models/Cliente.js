import mongoose from 'mongoose';

const AtendimentoSchema = new mongoose.Schema({
  data: { 
    type: Date, 
    default: Date.now 
  },
  observacoes: { 
    type: String 
  },
  valor: { 
    type: Number, 
    default: 150 
  }
});

const ClienteSchema = new mongoose.Schema({
  // Dados pessoais
  nome: { 
    type: String, 
    required: [true, 'Nome é obrigatório'] 
  },
  profissao: { 
    type: String
    // required está omitido, tornando o campo opcional
  },
  dataNascimento: { 
    type: Date, 
    required: [true, 'Data de nascimento é obrigatória'] 
  },
  // Getter para calcular a idade automaticamente
  idade: { 
    type: Number, 
    get: function() {
      if (!this.dataNascimento) return null;
      
      const hoje = new Date();
      const nascimento = new Date(this.dataNascimento);
      
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      
      return idade;
    }
  },
  genero: { 
    type: String, 
    enum: ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'], 
    required: [true, 'Gênero é obrigatório'] 
  },
  endereco: { 
    type: String 
  },
  telefone: { 
    type: String,
    validate: {
      validator: function(v) {
        // Regex para aceitar apenas números, espaços, parênteses e hífen
        return /^[\d\s()-]+$/.test(v);
      },
      message: props => `${props.value} não é um telefone válido!`
    },
    // Opcional: definir um comprimento máximo
    maxlength: [15, 'Telefone muito longo']
  },
  email: { 
    type: String, 
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'] 
  },
  status: {
    type: String,
    enum: ['pendente', 'em_analise', 'atribuido', 'inelegivel'],
    default: 'pendente'
  },
  cpf: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{11}$/.test(v);
      },
      message: props => `${props.value} não é um CPF válido!`
    },
    required: [true, 'CPF é obrigatório']
  },
  quemIndicou: {
    type: String,
    default: 'no'
  },
  observacoesAptidao: {
    type: String,
    default: ''
  },
  dataAtribuicao: {
    type: Date
  },
  motivoInelegibilidade: {
    type: String
  },
  dataUltimaTransferencia: {
    type: Date
  },
  observacoesTransferencia: {
    type: String
  },
  // Relacionamento com o gerente
  gerente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Status do questionário
  questionarioConcluido: { 
    type: Boolean, 
    default: false 
  },
  
  // NOVOS CAMPOS PARA ATENDIMENTOS
  atendimentos: [AtendimentoSchema],
  
  // Valor padrão do atendimento para este cliente
  valorAtendimento: { 
    type: Number, 
    default: 150 
  },
  
  // Data do próximo atendimento agendado
  proximoAtendimento: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },

  // Novo campo para observações gerais
  observacoesGerais: { type: String, default: '' }

  
});

export default mongoose.model('Cliente', ClienteSchema);
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const AgendamentoSchema = new Schema({
  cliente: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    nome: {
      type: String,
      required: true
    },
    cor: {
      type: String,
      default: '#2196F3'
    }
  },
  profissional: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    nome: {
      type: String
    }
  },
  data: {
    type: String,
    required: true
  },
  horario: {
    type: String,
    required: true
  },
  tipoConsulta: {
    type: String,
    enum: ['Consulta Padrão', 'Retorno', 'Emergência', 'Avaliação Inicial'],
    default: 'Consulta Padrão'
  },
  observacoes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Índice composto para garantir que não haja dois agendamentos no mesmo horário para o mesmo profissional
AgendamentoSchema.index({ 'profissional.id': 1, data: 1, horario: 1 }, { unique: true });

const Agendamento = mongoose.model('Agendamento', AgendamentoSchema);

export default Agendamento; 
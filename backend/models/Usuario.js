import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  senha: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['admin', 'profissional', 'cliente'],
    default: 'cliente'
  },
  cor: {
    type: String,
    default: '#2196F3'
  },
  telefone: {
    type: String,
    trim: true
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

const Usuario = mongoose.model('Usuario', UsuarioSchema);

export default Usuario; 
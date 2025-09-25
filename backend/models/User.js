import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, 'Nome é obrigatório'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'], 
    unique: true, 
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'] 
  },
  senha: { 
    type: String, 
    required: [true, 'Senha é obrigatória'], 
    minlength: 6, 
    select: false 
  },
  role: { 
    type: String, 
    enum: ['profissional', 'gerente', 'secretaria'], 
    default: 'profissional' 
  },
  ativo: { 
    type: Boolean, 
    default: true 
  },
  gerente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: function() { 
      return this.role === 'profissional'; 
    } 
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  primeiroLogin: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Criptografar senha antes de salvar
UserSchema.pre('save', async function(next) {
  // Só executa se a senha foi modificada
  if (!this.isModified('senha')) {
    return next();
  }

  // Gerar salt e hash
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Método para gerar JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role 
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: process.env.JWT_EXPIRE 
    }
  );
};

// Método para verificar senha
UserSchema.methods.matchPassword = async function(senhaDigitada) {
  return await bcrypt.compare(senhaDigitada, this.senha);
};

// Método para gerar token de reset de senha
UserSchema.methods.getResetPasswordToken = function() {
  // Gerar token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash do token
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Definir tempo de expiração (10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

export default mongoose.model('User', UserSchema);
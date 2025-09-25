import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [role, setRole] = useState('profissional');
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    // Validação dos campos
    if (!nome || !email || !senha || !confirmarSenha || !masterPassword) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }
    
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register-master', {
        nome,
        email,
        senha,
        role,
        masterPassword
      });
      
      console.log('Registro bem-sucedido:', response.data);
      setSuccess('Conta criada com sucesso! Redirecionando para o login...');
      
      // Limpar o formulário
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
      setMasterPassword('');
      
      // Redirecionamento após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setError(
        error.response?.data?.message || 
        'Erro ao criar conta. Verifique os dados e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Criar Conta</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nome" className="block text-gray-700 font-medium mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome completo"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
              Tipo de Usuário
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="profissional">Profissional</option>
              <option value="gerente">Gerente</option>
              <option value="secretaria">Secretária</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="senha" className="block text-gray-700 font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
              minLength={6}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmarSenha" className="block text-gray-700 font-medium mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
              minLength={6}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="masterPassword" className="block text-gray-700 font-medium mb-2">
              Senha Master
            </label>
            <input
              type="password"
              id="masterPassword"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Senha master para este tipo de usuário"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              *Cada tipo de usuário requer uma senha master específica
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Criando Conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          <p>Já possui uma conta?</p>
          <p className="mt-2">
            <Link to="/login" className="text-blue-500 hover:text-blue-700">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register; 
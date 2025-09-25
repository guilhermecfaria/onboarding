// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!email || !senha) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Iniciando login com:", email);
      const result = await login(email, senha);
      console.log("Resultado do login:", result);
      
      if (result.success) {
        console.log("Login bem-sucedido. Role do usuário:", result.user?.role);
        // Redirecionamento será feito pelo componente App.jsx após verificar a role
      } else {
        console.error("Falha no login:", result.message);
        setError(result.message || 'Erro ao fazer login');
      }
    } catch (err) {
      console.error('Erro completo de login:', err);
      setError('Erro ao conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
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
          
          <div className="mb-6">
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
            />
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
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-600">
          <p>Área restrita para profissionais, gerentes e secretárias.</p>
          <p className="mt-2">
            <Link to="/register" className="text-blue-500 hover:text-blue-700">
              Criar uma conta
            </Link>
          </p>
          <p className="mt-2">
            <a href="/" className="text-blue-500 hover:text-blue-700">
              Voltar para o Questionário
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function DiagnosticoAuth() {
  const { user, token } = useAuth();
  const [serverStatus, setServerStatus] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar se o servidor está online
        const serverResponse = await axios.get('/');
        setServerStatus({
          online: true,
          message: serverResponse.data
        });
        
        // Verificar status da autenticação
        const authResponse = await axios.get('/api/auth/check', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setAuthStatus(authResponse.data);
        
        // Verificar status do banco de dados
        const dbResponse = await axios.get('/api/db-status');
        setDbStatus(dbResponse.data);
        
      } catch (err) {
        console.error('Erro no diagnóstico:', err);
        setError(err.message || 'Erro ao verificar o status do sistema');
      } finally {
        setLoading(false);
      }
    };
    
    checkServer();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Verificando sistema...</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Diagnóstico do Sistema</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status do Servidor */}
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-lg font-semibold mb-2">Servidor</h3>
          {serverStatus ? (
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${serverStatus.online ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>{serverStatus.online ? 'Online' : 'Offline'}</span>
            </div>
          ) : (
            <span className="text-gray-500">Não verificado</span>
          )}
          {serverStatus?.message && (
            <div className="mt-2 text-sm text-gray-700">{serverStatus.message}</div>
          )}
        </div>
        
        {/* Status da Autenticação */}
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-lg font-semibold mb-2">Autenticação</h3>
          {authStatus ? (
            <div>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${authStatus.authenticated ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{authStatus.authenticated ? 'Autenticado' : 'Não Autenticado'}</span>
              </div>
              {authStatus.message && (
                <div className="mt-2 text-sm text-gray-700">{authStatus.message}</div>
              )}
              {authStatus.user && (
                <div className="mt-2 text-sm">
                  <div><strong>ID:</strong> {authStatus.user.id}</div>
                  <div><strong>Nome:</strong> {authStatus.user.nome}</div>
                  <div><strong>Email:</strong> {authStatus.user.email}</div>
                  <div><strong>Tipo:</strong> {authStatus.user.role}</div>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500">Não verificado</span>
          )}
        </div>
        
        {/* Status do Banco de Dados */}
        <div className="bg-white p-4 rounded shadow-md col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Banco de Dados</h3>
          {dbStatus ? (
            <div>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${dbStatus.status === 'Sucesso' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{dbStatus.status}</span>
              </div>
              {dbStatus.connection && (
                <div className="mt-2 text-sm">
                  <div><strong>Status:</strong> {dbStatus.connection.status}</div>
                  <div><strong>Banco:</strong> {dbStatus.connection.database}</div>
                  <div><strong>Host:</strong> {dbStatus.connection.host}</div>
                </div>
              )}
              {dbStatus.collections && (
                <div className="mt-2">
                  <h4 className="font-medium">Coleções ({dbStatus.collections.length}):</h4>
                  <ul className="mt-1 text-sm">
                    {dbStatus.collections.map((col, index) => (
                      <li key={index}>
                        {col.name}: {col.documentCount} documentos
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500">Não verificado</span>
          )}
        </div>
        
        {/* Token Atual */}
        <div className="bg-white p-4 rounded shadow-md col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Token JWT</h3>
          {token ? (
            <div className="text-sm">
              <div className="overflow-x-auto bg-gray-100 p-2 rounded">
                <code className="break-all">{token}</code>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700">Nenhum token encontrado</div>
          )}
        </div>
        
        {/* Usuário Atual */}
        <div className="bg-white p-4 rounded shadow-md col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Usuário no Contexto</h3>
          {user ? (
            <div className="text-sm">
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-sm text-gray-700">Nenhum usuário autenticado</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiagnosticoAuth; 
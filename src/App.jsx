// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AgendamentosProvider } from './context/AgendamentosContext';
import { ClientesProvider } from './context/ClientesContext';
import Login from './components/Login';
import Register from './components/Register';
import DiagnosticoAuth from './components/DiagnosticoAuth';
import QuestionarioCliente from './QuestionarioCliente';
import GerenteDashboard from './pages/GerenteDashboard';
import { ProtectedRoute, RedirectIfAuthenticated } from './components/ProtectedRoute';
import './App.css';

function App() {
  const [resetQuestionario, setResetQuestionario] = useState(false);

  // Função para resetar o questionário
  const handleResetQuestionario = () => {
    setResetQuestionario(true);
    // Resetamos o flag depois de pequeno delay para permitir que o componente reaja
    setTimeout(() => setResetQuestionario(false), 100);
  };

  return (
    <AuthProvider>
      <ClientesProvider>
        <AgendamentosProvider>
          <Router>
            <AppRoutes 
              resetQuestionario={resetQuestionario} 
              onResetQuestionario={handleResetQuestionario} 
            />
          </Router>
        </AgendamentosProvider>
      </ClientesProvider>
    </AuthProvider>
  );
}

// Componente separado para acessar o contexto de autenticação
function AppRoutes({ resetQuestionario, onResetQuestionario }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // Componente Layout para envolver as páginas com cabeçalho e rodapé
  const Layout = ({ children, showAdminButton = true }) => {
    return (
      <div className="app-container">
        {/* Barra superior com informações */}
        <header className="app-header">
          <h1 
            onClick={!user ? onResetQuestionario : undefined} 
            style={{ cursor: !user ? 'pointer' : 'default' }}
          >
            {user ? (
              <span>
                Área do Gerente
              </span>
            ) : (
              'Questionário Coaching'
            )}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user && (
              <span style={{ fontSize: '0.9rem' }}>
                {user.nome}
              </span>
            )}
            {user ? (
              <>
                <a href="/gerente/dashboard" className="admin-button" style={{ backgroundColor: '#166534', borderColor: '#166534' }}>
                  Área Gerente
                </a>
                <a href="/" className="admin-button" style={{ backgroundColor: '#166534', borderColor: '#166534' }}>
                  Voltar aos Forms
                </a>
                <button onClick={logout} className="admin-button logout" style={{ backgroundColor: '#166534', borderColor: '#166534' }}>
                  Sair
                </button>
              </>
            ) : (
              showAdminButton && (
                <a href="/login" className="admin-button">
                  Área Restrita
                </a>
              )
            )}
          </div>
        </header>

        {/* Conteúdo principal da aplicação */}
        <main className="app-content">
          {children}
        </main>
        
        {/* Rodapé com informações */}
        <footer className="app-footer">
          <p>Questionário Holistico © {new Date().getFullYear()}</p>
        </footer>
      </div>
    );
  };
  
  return (
    <Routes>
      {/* Rota pública para o questionário */}
      <Route path="/" element={
        <Layout>
          <QuestionarioCliente resetQuestionario={resetQuestionario} />
        </Layout>
      } />
      
      {/* Rotas públicas - redirecionam se já estiver autenticado */}
      <Route element={<RedirectIfAuthenticated />}>
        <Route path="/login" element={
          <Layout showAdminButton={false}>
            <Login />
          </Layout>
        } />
        <Route path="/register" element={
          <Layout showAdminButton={false}>
            <Register />
          </Layout>
        } />
      </Route>
      
      {/* Rota de diagnóstico */}
      <Route path="/diagnostico" element={
        <Layout>
          <DiagnosticoAuth />
        </Layout>
      } />
      
      {/* Rotas protegidas para gerentes */}
      <Route 
        path="/gerente" 
        element={<ProtectedRoute allowedRoles={['gerente']} />}
      >
        <Route path="dashboard" element={
          <Layout>
            <GerenteDashboard />
          </Layout>
        } />
      </Route>
      
      {/* Redirecionamento baseado no papel do usuário */}
      <Route path="/dashboard" element={
        user ? (
          <Navigate to="/gerente/dashboard" replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      
      {/* Rota para qualquer outro caminho */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
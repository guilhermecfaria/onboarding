// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente para proteger rotas que exigem autenticação
export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  
  // Se estiver carregando, mostrar indicador de carregamento
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

  // Se não estiver autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se roles forem especificados e o usuário não tiver o role permitido
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Apenas gerentes têm acesso
    return <Navigate to="/gerente/dashboard" replace />;
  }

  // Se passou por todas as verificações, renderizar os componentes filhos
  return <Outlet />;
};

// Componente para redirecionar usuários autenticados da página de login
export const RedirectIfAuthenticated = () => {
  const { user, loading } = useAuth();
  
  // Se estiver carregando, mostrar indicador de carregamento
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

  // Se estiver autenticado, redirecionar para dashboard do gerente
  if (user) {
    return <Navigate to="/gerente/dashboard" replace />;
  }

  // Se não estiver autenticado, renderizar o componente filho (Login)
  return <Outlet />;
};
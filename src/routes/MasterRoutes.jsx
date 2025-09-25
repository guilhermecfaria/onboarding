import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../auth/authContext";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import StudentDashboard from "../pages/Student/StudentDashboard";
import ProfissionalDashboard from "../pages/ProfissionalDashboard";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import DiagPage from "../pages/Diagnostics/DiagPage";
import ConfigPage from "../pages/Admin/ConfigPage";
import ClientesPage from "../pages/Profissional/Clientes/ClientesPage";
import DevolutivaPage from "../pages/Profissional/Devolutiva/DevolutivaPage";

// Auth components
import PrivateRoute from "./PrivateRoute";
import AuthStatus from "../pages/AuthStatus";

// Rotas protegidas por função
const ProfessionalRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== "profissional") {
    return <Navigate to="/login" />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }
  return children;
};

const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== "student") {
    return <Navigate to="/login" />;
  }
  return children;
};

const MasterRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth-status" element={<AuthStatus />} />

          {/* Rotas do Aluno */}
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute>
                <StudentRoute>
                  <StudentDashboard />
                </StudentRoute>
              </PrivateRoute>
            }
          />

          {/* Rotas do Profissional */}
          <Route
            path="/profissional/dashboard"
            element={
              <PrivateRoute>
                <ProfessionalRoute>
                  <ProfissionalDashboard />
                </ProfessionalRoute>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/profissional/clientes"
            element={
              <PrivateRoute>
                <ProfessionalRoute>
                  <ClientesPage />
                </ProfessionalRoute>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/profissional/devolutiva"
            element={
              <PrivateRoute>
                <ProfessionalRoute>
                  <DevolutivaPage />
                </ProfessionalRoute>
              </PrivateRoute>
            }
          />

          {/* Rotas do Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/admin/config"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <ConfigPage />
                </AdminRoute>
              </PrivateRoute>
            }
          />

          {/* Página de diagnósticos do sistema */}
          <Route
            path="/diagnostics"
            element={
              <PrivateRoute>
                <DiagPage />
              </PrivateRoute>
            }
          />

          {/* Rota padrão - redireciona para home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default MasterRoutes; 
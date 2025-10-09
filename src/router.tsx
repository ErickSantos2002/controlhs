import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Logs from "./pages/Logs";
import Home from "./pages/Home";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-500">Verificando permissões...</div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 text-red-600 text-center font-semibold">
        Acesso negado. Esta página é restrita a administradores.
      </div>
    );
  }

  return <>{children}</>;
};

import Bloqueio from "./pages/Bloqueio"; // importe o novo componente

const RequireVendas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-500">Verificando permissões...</div>;

  if (!user || (user.role !== "admin" && user.role !== "vendas" && user.role !== "financeiro" && user.role !== "qualidade")) {
    return <Bloqueio />;
  }

  return <>{children}</>;
};

const RequireServicos: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-500">Verificando permissões...</div>;

  if (!user || (user.role !== "admin" && user.role !== "servicos" && user.role !== "financeiro" && user.role !== "qualidade")) {
    return <Bloqueio />;
  }

  return <>{children}</>;
};

const RequireVendedores: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-500">Verificando permissões...</div>;

  if (!user || (user.role !== "admin" && user.role !== "vendas" && user.role !== "financeiro" && user.role !== "qualidade")) {
    return <Bloqueio />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route
      path="/inicio"
      element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      }
    />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    
    <Route
      path="/logs"
      element={
        <ProtectedRoute>
          <RequireAdmin>
            <Logs />
          </RequireAdmin>
        </ProtectedRoute>
      }
    />

    <Route path="/" element={<Navigate to="/inicio" />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;

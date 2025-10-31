import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patrimonios from "./pages/Patrimonios";
import NotFound from "./pages/NotFound";
import Logs from "./pages/Logs";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-500">Verificando permissões...</div>;

  if (!user || user.role !== "Administrador") {
    return (
      <div className="p-6 text-red-600 text-center font-semibold">
        Acesso negado. Esta página é restrita a administradores.
      </div>
    );
  }

  return <>{children}</>;
};

import Bloqueio from "./pages/Bloqueio"; // importe o novo componente

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/patrimonios"
      element={
        <ProtectedRoute>
          <Patrimonios />
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

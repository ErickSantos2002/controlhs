import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

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
    {/* Rota padrão: redireciona "/" para "/dashboard" se autenticado */}
    <Route path="/" element={<Navigate to="/dashboard" />} />
    {/* Qualquer outra rota: NotFound */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;

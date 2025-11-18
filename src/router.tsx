import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading de páginas para melhor performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Patrimonios = lazy(() => import('./pages/Patrimonios'));
const Transferencias = lazy(() => import('./pages/Transferencias'));
const Baixas = lazy(() => import('./pages/Baixas'));
const Inventarios = lazy(() => import('./pages/Inventarios'));
const InventarioConferencia = lazy(() => import('./pages/InventarioConferencia'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Logs = lazy(() => import('./pages/Logs'));
const CadastrosBasicos = lazy(() => import('./pages/CadastrosBasicos'));
const Bloqueio = lazy(() => import('./pages/Bloqueio'));

import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Loading Fallback Component
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0f0f0f] dark:to-[#1a1a1a]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
    </div>
  </div>
);

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="p-6 text-gray-500">Verificando permissões...</div>;

  if (!user || user.role !== 'Administrador') {
    return (
      <div className="p-6 text-red-600 text-center font-semibold">
        Acesso negado. Esta página é restrita a administradores.
      </div>
    );
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
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
      path="/transferencias"
      element={
        <ProtectedRoute>
          <Transferencias />
        </ProtectedRoute>
      }
    />

    <Route
      path="/baixas"
      element={
        <ProtectedRoute>
          <Baixas />
        </ProtectedRoute>
      }
    />

    <Route
      path="/inventarios"
      element={
        <ProtectedRoute>
          <Inventarios />
        </ProtectedRoute>
      }
    />

    <Route
      path="/inventarios/:id/conferencia"
      element={
        <ProtectedRoute>
          <InventarioConferencia />
        </ProtectedRoute>
      }
    />

    <Route
      path="/cadastros"
      element={
        <ProtectedRoute>
          <CadastrosBasicos />
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

    <Route path="/" element={<Navigate to="/dashboard" />} />
    <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;

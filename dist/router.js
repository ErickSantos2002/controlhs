import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patrimonios from './pages/Patrimonios';
import Transferencias from './pages/Transferencias';
import NotFound from './pages/NotFound';
import Logs from './pages/Logs';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
const RequireAdmin = ({ children, }) => {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx("div", { className: "p-6 text-gray-500", children: "Verificando permiss\u00F5es..." });
    if (!user || user.role !== 'Administrador') {
        return (_jsx("div", { className: "p-6 text-red-600 text-center font-semibold", children: "Acesso negado. Esta p\u00E1gina \u00E9 restrita a administradores." }));
    }
    return _jsx(_Fragment, { children: children });
};
const AppRoutes = () => (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/patrimonios", element: _jsx(ProtectedRoute, { children: _jsx(Patrimonios, {}) }) }), _jsx(Route, { path: "/transferencias", element: _jsx(ProtectedRoute, { children: _jsx(Transferencias, {}) }) }), _jsx(Route, { path: "/logs", element: _jsx(ProtectedRoute, { children: _jsx(RequireAdmin, { children: _jsx(Logs, {}) }) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/inicio" }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }));
export default AppRoutes;

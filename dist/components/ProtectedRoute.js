import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("span", { className: "text-gray-500 text-lg", children: "Carregando..." }) }));
    }
    // Se não está autenticado, redireciona para login
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    // Se está autenticado, renderiza os filhos (página protegida)
    return _jsx(_Fragment, { children: children });
};
export default ProtectedRoute;

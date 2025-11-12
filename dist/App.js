import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
import './styles/index.css'; // Importa o Tailwind e estilos globais
import AppRoutes from './router';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
// Rotas onde o layout (Header/Sidebar) não deve aparecer (ex: login)
const noLayoutRoutes = ['/login'];
const App = () => {
    const location = useLocation();
    const hideLayout = noLayoutRoutes.includes(location.pathname);
    if (hideLayout) {
        // 🔥 Quando for rota sem layout, renderiza só as rotas
        return _jsx(AppRoutes, {});
    }
    return (_jsxs("div", { className: "h-screen flex flex-col bg-gray-100 dark:bg-darkGray text-gray-900 dark:text-lightGray transition-colors", children: [_jsx(Header, {}), _jsxs("div", { className: "flex flex-1 overflow-hidden", children: [_jsx(Sidebar, {}), _jsx("main", { className: "flex-1 overflow-auto bg-gray-100 dark:bg-darkGray transition-colors", children: _jsx(AppRoutes, {}) })] })] }));
};
export default App;

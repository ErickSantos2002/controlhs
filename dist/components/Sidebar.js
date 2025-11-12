import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    if (location.pathname === '/login')
        return null;
    const iconBaseClass = 'w-5 h-5 mr-2 transition-colors';
    const getColor = (isActive) => {
        if (darkMode) {
            return 'D1D1D1'; // ícones em cinza claro no dark
        }
        return isActive ? '1E3A8A' : '1D4ED8'; // tons de azul no modo claro
    };
    const menuItems = [
        {
            label: 'Dashboard',
            to: '/dashboard',
            icon: (isActive) => (_jsx("img", { src: `https://img.icons8.com/?size=100&id=udjU_YS4lMXL&format=png&color=${getColor(isActive)}`, alt: "Dashboard", className: iconBaseClass })),
        },
        {
            label: 'Patrimônios',
            to: '/patrimonios',
            icon: (isActive) => (_jsx("img", { src: "https://img.icons8.com/?size=100&id=f6XnJbAyvoWg&format=png", alt: "Patrim\u00F4nios", className: `${iconBaseClass} ${isActive ? 'opacity-100' : 'opacity-70'} 
                  dark:filter dark:brightness-0 dark:invert transition-all duration-200` })),
        },
        {
            label: 'Transferências',
            to: '/transferencias',
            icon: (isActive) => (_jsx("img", { src: `https://img.icons8.com/?size=100&id=P1YG1sk94HiB&format=png&color=${getColor(isActive)}`, alt: "Transfer\u00EAncias", className: `${iconBaseClass} ${isActive ? 'opacity-100' : 'opacity-70'} 
            dark:filter dark:brightness-0 dark:invert transition-all duration-200` })),
        },
        ...((user === null || user === void 0 ? void 0 : user.role) === 'Administrador'
            ? [
                {
                    label: 'Log de Auditoria',
                    to: '/Logs',
                    icon: (isActive) => (_jsx("img", { src: `https://img.icons8.com/?size=100&id=2969&format=png&color=${getColor(isActive)}`, alt: "Configura\u00E7\u00F5es", className: iconBaseClass })),
                },
            ]
            : []),
    ];
    return (_jsxs("aside", { className: "hidden lg:flex w-56 \r\n      bg-white/95 dark:bg-[#1e1e1e]/95 \r\n      text-gray-900 dark:text-lightGray \r\n      shadow-md sticky top-0 flex-col \r\n      border-r border-gray-200 dark:border-[#2d2d2d] \r\n      transition-colors", children: [_jsx("nav", { className: "flex-1 py-6", children: _jsx("ul", { className: "space-y-2", children: menuItems.map((item) => (_jsx("li", { children: _jsx(NavLink, { to: item.to, className: ({ isActive }) => `flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isActive
                                ? 'bg-gray-200 text-blue-700 dark:bg-accentGray/50 dark:text-lightGray'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-accentGray/30'}`, end: true, children: ({ isActive }) => (_jsxs(_Fragment, { children: [item.icon(isActive), item.label] })) }) }, item.to))) }) }), _jsx("div", { className: "px-4 py-3 border-t border-gray-200 dark:border-accentGray", children: _jsxs("div", { className: "flex items-center justify-between font-medium text-gray-800 dark:text-lightGray", children: [_jsx("div", { className: "flex items-center gap-2", children: darkMode ? (
                            // ☀️ Sol amarelo (modo claro)
                            _jsx("img", { src: "https://img.icons8.com/?size=100&id=s6SybfgfYCLU&format=png&color=FFD700", alt: "Modo Claro", className: "w-6 h-6 drop-shadow-md" })) : (
                            // 🌙 Lua azul (modo escuro)
                            _jsx("img", { src: "https://img.icons8.com/?size=100&id=11404&format=png&color=2563EB", alt: "Modo Escuro", className: "w-6 h-6 drop-shadow-md" })) }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: darkMode, onChange: toggleDarkMode, className: "sr-only peer" }), _jsx("div", { className: "w-12 h-7 bg-gray-400 dark:bg-accentGray rounded-full peer-checked:bg-blue-600 transition-all" }), _jsx("div", { className: "absolute left-1 top-1 w-5 h-5 bg-white rounded-full border shadow-md transition-transform peer-checked:translate-x-5" })] })] }) })] }));
};
export default Sidebar;

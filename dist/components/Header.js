import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/HS2.ico';
import ModalTrocarSenha from '../components/ModalTrocarSenha'; // 🔹 certifique-se de ajustar o caminho
const Header = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const [menuVisivel, setMenuVisivel] = useState(false);
    const [menuAnimado, setMenuAnimado] = useState(false);
    const [modalSenhaAberta, setModalSenhaAberta] = useState(false); // 🔹 novo estado
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef(null);
    if (location.pathname === '/login')
        return null;
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const abrirMenu = () => {
        setMenuVisivel(true);
        setTimeout(() => setMenuAnimado(true), 10);
    };
    const fecharMenu = () => {
        setMenuAnimado(false);
        setTimeout(() => setMenuVisivel(false), 300);
    };
    useEffect(() => {
        const handleClickFora = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                fecharMenu();
            }
        };
        if (menuVisivel) {
            document.addEventListener('mousedown', handleClickFora);
            document.body.style.overflow = 'hidden';
        }
        else {
            document.removeEventListener('mousedown', handleClickFora);
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('mousedown', handleClickFora);
            document.body.style.overflow = '';
        };
    }, [menuVisivel]);
    const handleConfirmarSenha = (novaSenha) => {
        console.log('Nova senha:', novaSenha);
        // 🔹 Aqui você pode adicionar a lógica para atualizar a senha via API
    };
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: "sticky top-0 inset-x-0 z-50 \r\n        bg-white/95 dark:bg-[#1e1e1e]/95 \r\n        backdrop-blur-sm shadow-md \r\n        flex items-center justify-between px-4 py-3 \r\n        transition-colors border-b border-gray-200 dark:border-[#2d2d2d]", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: abrirMenu, className: "block lg:hidden text-gray-700 dark:text-lightGray text-2xl focus:outline-none", children: "\u2630" }), _jsxs(Link, { to: "/dashboard", className: "hidden lg:flex items-center gap-2 font-bold text-xl text-blue-700 dark:text-lightGray hover:scale-105 transition no-underline group", children: [_jsx("img", { src: logo, alt: "Logo", className: "w-6 h-6 transition-transform duration-500 group-hover:rotate-[360deg]" }), _jsx("span", { children: "ControlHS" })] })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsx("button", { onClick: () => setModalSenhaAberta(true), className: "group text-gray-700 dark:text-gray-300 underline underline-offset-4 transition hover:text-blue-600 dark:hover:text-blue-400", children: _jsxs("span", { children: [user === null || user === void 0 ? void 0 : user.username, ' ', _jsxs("span", { className: "text-xs text-gray-400 group-hover:text-blue-400 transition", children: ["(", user === null || user === void 0 ? void 0 : user.role, ")"] })] }) }), !menuVisivel && (_jsx("button", { onClick: handleLogout, className: "bg-blue-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-blue-700 transition", children: "Sair" }))] })] }), menuVisivel && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black/40 z-40 transition-opacity", onClick: fecharMenu }), _jsxs("div", { ref: menuRef, className: `fixed inset-y-0 left-0 w-[70vw] bg-white/95 dark:bg-[#1e1e1e] z-50 shadow-lg px-6 pb-6 flex flex-col transform transition-transform duration-300 ${menuAnimado ? 'translate-x-0' : '-translate-x-full'}`, children: [_jsxs("div", { className: "flex items-center justify-between py-3 mb-3 border-b border-gray-200 dark:border-[#2d2d2d]", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("img", { src: logo, alt: "Logo", className: "w-6 h-6 object-contain" }), _jsx("span", { className: "font-bold text-lg text-blue-700 dark:text-lightGray", children: "Menu" })] }), _jsx("button", { onClick: fecharMenu, className: "text-gray-600 dark:text-gray-300 text-2xl leading-none", children: "\u00D7" })] }), _jsxs("nav", { className: "flex flex-col gap-4", children: [_jsx(Link, { to: "/dashboard", onClick: fecharMenu, className: "text-gray-700 dark:text-gray-200 font-medium hover:text-blue-600 dark:hover:text-lightGray transition", children: "Dashboard" }), (user === null || user === void 0 ? void 0 : user.role) === 'Administrador' && (_jsx(Link, { to: "/logs", onClick: fecharMenu, className: "text-gray-700 dark:text-gray-200 font-medium hover:text-blue-600 dark:hover:text-lightGray transition", children: "Logs de Auditoria" }))] }), _jsxs("div", { className: "mt-auto flex flex-col gap-3 border-t border-gray-200 dark:border-[#2d2d2d] pt-4", children: [_jsxs("div", { className: "flex items-center justify-between font-medium text-gray-700 dark:text-gray-200 py-2", children: [_jsx("div", { className: "flex items-center gap-2", children: darkMode ? (_jsx("img", { src: "https://img.icons8.com/?size=100&id=s6SybfgfYCLU&format=png&color=FFD700", alt: "Modo Claro", className: "w-5 h-5" })) : (_jsx("img", { src: "https://img.icons8.com/?size=100&id=11404&format=png&color=1E40AF", alt: "Modo Escuro", className: "w-5 h-5" })) }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: darkMode, onChange: toggleDarkMode, className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-300 rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 transition" }), _jsx("div", { className: "absolute left-1 top-1 bg-white w-4 h-4 rounded-full border transition peer-checked:translate-x-5" })] })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center w-full text-left text-red-600 font-medium hover:text-red-800 py-2 rounded-lg transition", children: [_jsx("img", { src: "https://img.icons8.com/?size=100&id=59781&format=png&color=FF0000", alt: "Sair", className: "w-5 h-5" }), _jsx("span", { className: "ml-2", children: "Sair" })] })] })] })] })), _jsx(ModalTrocarSenha, { isOpen: modalSenhaAberta, onClose: () => setModalSenhaAberta(false), onConfirm: handleConfirmarSenha })] }));
};
export default Header;

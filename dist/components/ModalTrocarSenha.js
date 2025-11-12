import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const ModalTrocarSenha = ({ isOpen, onClose, onConfirm, }) => {
    const [novaSenha, setNovaSenha] = useState('');
    const [repitaSenha, setRepitaSenha] = useState('');
    if (!isOpen)
        return null;
    const handleConfirm = () => {
        if (novaSenha !== repitaSenha) {
            alert('As senhas não coincidem!');
            return;
        }
        onConfirm(novaSenha);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity", children: _jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 \r\n                   border border-gray-200 dark:border-[#2d2d2d] \r\n                   rounded-xl shadow-xl p-8 sm:p-6 \r\n                   max-w-md w-[90%] sm:w-full \r\n                   mx-4 sm:mx-0 transition-colors", children: [_jsx("h2", { className: "text-xl font-bold mb-6 text-center text-gray-900 dark:text-[#facc15] tracking-tight", children: "Trocar Senha" }), _jsxs("div", { className: "flex flex-col gap-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: "Nova senha:" }), _jsx("input", { type: "password", value: novaSenha, onChange: (e) => setNovaSenha(e.target.value), className: "w-full mt-1 px-3 py-2 border rounded-lg\r\n                         bg-white dark:bg-[#181818]\r\n                         text-gray-800 dark:text-gray-200\r\n                         border-gray-300 dark:border-gray-600\r\n                         focus:outline-none focus:ring-2 focus:ring-blue-500\r\n                         transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: "Repita nova senha:" }), _jsx("input", { type: "password", value: repitaSenha, onChange: (e) => setRepitaSenha(e.target.value), className: "w-full mt-1 px-3 py-2 border rounded-lg\r\n                         bg-white dark:bg-[#181818]\r\n                         text-gray-800 dark:text-gray-200\r\n                         border-gray-300 dark:border-gray-600\r\n                         focus:outline-none focus:ring-2 focus:ring-blue-500\r\n                         transition-colors" })] })] }), _jsxs("div", { className: "mt-8 flex justify-end gap-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 rounded-lg font-medium\r\n                       bg-gray-300 hover:bg-gray-400\r\n                       dark:bg-[#2a2a2a] dark:hover:bg-[#3a3a3a]\r\n                       text-gray-800 dark:text-gray-100\r\n                       transition-colors", children: "Cancelar" }), _jsx("button", { onClick: handleConfirm, className: "px-4 py-2 rounded-lg font-medium\r\n                       bg-blue-600 hover:bg-blue-700\r\n                       text-white shadow-sm\r\n                       transition-colors", children: "Confirmar" })] })] }) }));
};
export default ModalTrocarSenha;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ModalObservacoes = ({ observacoes, onClose, }) => {
    if (!observacoes)
        return null;
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full", children: [_jsx("h2", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Observa\u00E7\u00F5es da Nota" }), _jsx("div", { className: "max-h-60 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line", children: observacoes }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsx("button", { onClick: onClose, className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Fechar" }) })] }) }));
};
export default ModalObservacoes;

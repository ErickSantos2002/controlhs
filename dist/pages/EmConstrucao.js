import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Helmet } from 'react-helmet';
const EmConstrucao = ({ titulo }) => {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center px-4 \r\n                    bg-gray-50 dark:bg-[#0f172a] transition-colors", children: [_jsx(Helmet, { children: _jsxs("title", { children: [titulo, " | DataCoreHS"] }) }), _jsx("h1", { className: "text-4xl font-bold text-blue-600 dark:text-yellow-400 mb-4 transition-colors", children: "Em constru\u00E7\u00E3o" }), _jsx("p", { className: "text-lg text-gray-700 dark:text-gray-300 max-w-md transition-colors", children: "Em breve teremos gr\u00E1ficos e an\u00E1lises aqui para ajudar na sua tomada de decis\u00E3o." })] }));
};
export default EmConstrucao;

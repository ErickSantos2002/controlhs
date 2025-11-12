import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Helmet } from 'react-helmet';
const Bloqueio = () => {
    return (_jsxs("div", { className: "p-6 h-full bg-gray-50 dark:bg-[#0f172a] flex flex-col items-center justify-center text-center transition-colors", children: [_jsx(Helmet, { children: _jsx("title", { children: "Acesso negado | DataCoreHS" }) }), _jsx("h1", { className: "\r\n        text-4xl font-bold mb-4 \r\n        animate-blinkLight dark:animate-blinkDark\r\n      ", children: "Acesso negado" }), _jsx("p", { className: "text-lg text-gray-700 dark:text-gray-300 max-w-md", children: "Voc\u00EA n\u00E3o tem permiss\u00E3o para acessar esta p\u00E1gina." })] }));
};
export default Bloqueio;

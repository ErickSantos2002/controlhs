import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
const NotFound = () => {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen bg-gray-50", children: [_jsx("h1", { className: "text-6xl font-extrabold text-blue-600 mb-4", children: "404" }), _jsx("p", { className: "text-xl text-gray-700 mb-6", children: "P\u00E1gina n\u00E3o encontrada." }), _jsx(Link, { to: "/dashboard", className: "px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors", children: "Voltar ao Dashboard" })] }));
};
export default NotFound;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
const Logs = () => {
    const { user, loading } = useAuth();
    const [modalAberto, setModalAberto] = useState(false);
    const [detalheSelecionado, setDetalheSelecionado] = useState(null);
    // --- Paginação ESTÁTICA (somente visual) ---
    const PAGINA_ATUAL = 1; // mude aqui pra simular outra página
    const ITENS_POR_PAGINA = 10; // tamanho da página (visual)
    const TOTAL_REGISTROS = 48; // total mockado
    const TOTAL_PAGINAS = Math.ceil(TOTAL_REGISTROS / ITENS_POR_PAGINA);
    const INICIO = (PAGINA_ATUAL - 1) * ITENS_POR_PAGINA + 1;
    const FIM = Math.min(PAGINA_ATUAL * ITENS_POR_PAGINA, TOTAL_REGISTROS);
    // janelinha de até 5 páginas
    const WINDOW = Math.min(5, TOTAL_PAGINAS);
    let start = 1;
    if (TOTAL_PAGINAS > 5) {
        if (PAGINA_ATUAL <= 3)
            start = 1;
        else if (PAGINA_ATUAL >= TOTAL_PAGINAS - 2)
            start = TOTAL_PAGINAS - 4;
        else
            start = PAGINA_ATUAL - 2;
    }
    const PAGES = Array.from({ length: WINDOW }, (_, i) => start + i);
    // 🔹 Logs fictícios — depois pode substituir por fetch real da API
    const logs = [
        {
            acao: 'Atualização de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 12,
            usuario: 'Welton',
            criado_em: '2025-10-09 14:21:32',
            detalhes: {
                antes: { status: 'ativo' },
                depois: { status: 'baixado' },
            },
        },
        {
            acao: 'Exclusão de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 9,
            usuario: 'Erick',
            criado_em: '2025-10-09 10:11:52',
            detalhes: {
                registro_removido: { id: 9, nome: 'Notebook Dell', valor: 6500 },
            },
        },
        {
            acao: 'Atualização de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 5,
            usuario: 'Djalma',
            criado_em: '2025-10-08 16:05:14',
            detalhes: {
                antes: { status: 'manutenção' },
                depois: { status: 'ativo' },
            },
        },
        {
            acao: 'Atualização de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 3,
            usuario: 'Gabriel',
            criado_em: '2025-10-08 12:32:47',
            detalhes: {
                antes: { valor: 2500 },
                depois: { valor: 2700 },
            },
        },
        {
            acao: 'Atualização de usuário',
            entidade: 'users',
            entidade_id: 4,
            usuario: 'Admin',
            criado_em: '2025-10-07 18:41:20',
            detalhes: {
                antes: { role: 'comum' },
                depois: { role: 'admin' },
            },
        },
        {
            acao: 'Criação de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 25,
            usuario: 'Welton',
            criado_em: '2025-10-06 11:07:15',
            detalhes: {
                novo_registro: {
                    nome: 'Impressora HP LaserJet 4200',
                    categoria: 'Equipamento',
                    valor: 3500,
                },
            },
        },
        {
            acao: 'Atualização de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 12,
            usuario: 'Welton',
            criado_em: '2025-10-09 14:21:32',
            detalhes: {
                antes: { status: 'ativo' },
                depois: { status: 'baixado' },
            },
        },
        {
            acao: 'Exclusão de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 9,
            usuario: 'Erick',
            criado_em: '2025-10-09 10:11:52',
            detalhes: {
                registro_removido: { id: 9, nome: 'Notebook Dell', valor: 6500 },
            },
        },
        {
            acao: 'Atualização de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 5,
            usuario: 'Djalma',
            criado_em: '2025-10-08 16:05:14',
            detalhes: {
                antes: { status: 'manutenção' },
                depois: { status: 'ativo' },
            },
        },
        {
            acao: 'Atualização de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 3,
            usuario: 'Gabriel',
            criado_em: '2025-10-08 12:32:47',
            detalhes: {
                antes: { valor: 2500 },
                depois: { valor: 2700 },
            },
        },
        {
            acao: 'Atualização de usuário',
            entidade: 'users',
            entidade_id: 4,
            usuario: 'Admin',
            criado_em: '2025-10-07 18:41:20',
            detalhes: {
                antes: { role: 'comum' },
                depois: { role: 'admin' },
            },
        },
        {
            acao: 'Criação de patrimônio',
            entidade: 'patrimonios',
            entidade_id: 25,
            usuario: 'Welton',
            criado_em: '2025-10-06 11:07:15',
            detalhes: {
                novo_registro: {
                    nome: 'Impressora HP LaserJet 4200',
                    categoria: 'Equipamento',
                    valor: 3500,
                },
            },
        },
    ];
    const abrirModal = (detalhes) => {
        setDetalheSelecionado(detalhes);
        setModalAberto(true);
    };
    const fecharModal = () => {
        setModalAberto(false);
        setDetalheSelecionado(null);
    };
    if (loading) {
        return (_jsx("div", { className: "p-6 text-gray-500 dark:text-gray-300", children: "Verificando permiss\u00F5es..." }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md transition-colors mb-6", children: _jsxs("div", { className: "px-6 py-4", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-[#facc15] tracking-tight", children: "Log de Auditoria" }), _jsxs("p", { className: "text-gray-600 dark:text-gray-300 mt-1", children: ["Bem-vindo, ", _jsx("span", { className: "font-semibold", children: user === null || user === void 0 ? void 0 : user.username }), " (", user === null || user === void 0 ? void 0 : user.role, ")"] }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 text-sm mt-2", children: "Consulte abaixo o hist\u00F3rico de altera\u00E7\u00F5es e a\u00E7\u00F5es realizadas no sistema, permitindo acompanhar a rastreabilidade e manter a transpar\u00EAncia dos dados." })] }) }), _jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 md:mb-0", children: "Logs de Auditoria" }), _jsx("div", { className: "flex flex-col md:flex-row gap-2 w-full md:w-auto", children: _jsx("div", { className: "relative flex-1 md:flex-initial", children: _jsx("input", { type: "text", placeholder: "Pesquisar log...", className: "pl-3 pr-3 py-2 w-full md:w-64 rounded-lg border \r\n                          focus:outline-none focus:ring-2 focus:ring-blue-500\r\n                          bg-white dark:bg-darkGray\r\n                          text-gray-800 dark:text-gray-200\r\n                          border-gray-300 dark:border-gray-600\r\n                          placeholder-gray-400 dark:placeholder-gray-500\r\n                          transition-colors" }) }) })] }), _jsx("div", { className: "overflow-x-auto overflow-y-auto rounded-lg max-h-screen-md border border-gray-200 dark:border-[#2a2a2a]", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b border-gray-300 dark:border-[#2a2a2a] bg-gray-200 dark:bg-[#181818]", children: [
                                            'Ação',
                                            'Entidade',
                                            'ID Entidade',
                                            'Usuário',
                                            'Data',
                                            'Detalhes',
                                        ].map((header, idx) => (_jsx("th", { className: "px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200", children: header }, idx))) }) }), _jsx("tbody", { children: logs.slice(0, 10).map((log, index) => (_jsxs("tr", { className: `border-b border-gray-100 dark:border-gray-700 
                              hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors
                              ${index % 2 === 0 ? 'bg-white dark:bg-[#1b1b1b]' : 'bg-gray-50 dark:bg-[#222222]'}`, children: [_jsx("td", { className: "px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-center", children: log.acao }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center", children: log.entidade }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center", children: log.entidade_id }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center", children: log.usuario }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-700 dark:text-gray-300 text-center", children: new Date(log.criado_em).toLocaleString('pt-BR') }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("button", { onClick: () => abrirModal(log.detalhes), className: "px-3 py-1 text-sm font-medium rounded-md \r\n                                bg-blue-600 hover:bg-blue-700 \r\n                                text-white transition-colors", children: "Ver Detalhes" }) })] }, index))) })] }) }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "hidden md:flex justify-between items-center w-full", children: [_jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: ["Mostrando ", INICIO, " a ", FIM, " de ", TOTAL_REGISTROS, " registros"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { disabled: PAGINA_ATUAL === 1, className: "px-3 py-1 border rounded-lg\r\n                  bg-white dark:bg-[#1f1f1f]\r\n                  border-gray-300 dark:border-gray-600\r\n                  text-gray-700 dark:text-gray-300\r\n                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a]\r\n                  disabled:opacity-50 disabled:cursor-not-allowed\r\n                  transition-colors", children: "Anterior" }), _jsx("div", { className: "flex gap-1", children: PAGES.map((page) => (_jsx("button", { className: `px-3 py-1 border rounded-lg transition-colors ${PAGINA_ATUAL === page
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}`, "aria-current": PAGINA_ATUAL === page ? 'page' : undefined, children: page }, page))) }), _jsx("button", { disabled: PAGINA_ATUAL === TOTAL_PAGINAS, className: "px-3 py-1 border rounded-lg\r\n                  bg-white dark:bg-[#1f1f1f]\r\n                  border-gray-300 dark:border-gray-600\r\n                  text-gray-700 dark:text-gray-300\r\n                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a]\r\n                  disabled:opacity-50 disabled:cursor-not-allowed\r\n                  transition-colors", children: "Pr\u00F3ximo" })] })] }), _jsxs("div", { className: "flex md:hidden flex-col items-center mt-2 gap-2 text-center", children: [_jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300", children: ["Mostrando ", INICIO, " a ", FIM, " de ", TOTAL_REGISTROS, " registros"] }), _jsxs("div", { className: "flex justify-center gap-1", children: [_jsx("button", { disabled: PAGINA_ATUAL === 1, className: "px-3 py-1 border rounded-lg\r\n                  bg-white dark:bg-[#1f1f1f]\r\n                  border-gray-300 dark:border-gray-600\r\n                  text-gray-700 dark:text-gray-300\r\n                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a]\r\n                  disabled:opacity-50 disabled:cursor-not-allowed\r\n                  transition-colors", children: '<' }), _jsx("span", { className: "px-3 py-1 border rounded-lg\r\n                  bg-white dark:bg-[#1f1f1f]\r\n                  text-gray-700 dark:text-gray-300\r\n                  border-gray-300 dark:border-gray-600", children: PAGINA_ATUAL }), _jsx("button", { disabled: PAGINA_ATUAL === TOTAL_PAGINAS, className: "px-3 py-1 border rounded-lg\r\n                  bg-white dark:bg-[#1f1f1f]\r\n                  border-gray-300 dark:border-gray-600\r\n                  text-gray-700 dark:text-gray-300\r\n                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a]\r\n                  disabled:opacity-50 disabled:cursor-not-allowed\r\n                  transition-colors", children: '>' })] })] }), _jsx("div", { className: "mt-3 text-sm text-gray-600 dark:text-gray-300 text-center", children: "Exibindo os 10 registros mais recentes" })] })] }), modalAberto && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-opacity", children: _jsxs("div", { className: "bg-white dark:bg-[#1e1e1e] rounded-xl shadow-xl border border-gray-200 dark:border-[#2d2d2d] max-w-lg w-full mx-4 p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center", children: "Detalhes da Altera\u00E7\u00E3o" }), _jsx("pre", { className: "text-sm bg-gray-100 dark:bg-[#181818] text-gray-800 dark:text-gray-300 p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] max-h-[300px] overflow-auto", children: JSON.stringify(detalheSelecionado, null, 2) }), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx("button", { onClick: fecharModal, className: "px-4 py-2 rounded-lg font-medium \r\n                          bg-gray-300 hover:bg-gray-400 \r\n                          dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 \r\n                          transition-colors", children: "Fechar" }) })] }) }))] }));
};
export default Logs;

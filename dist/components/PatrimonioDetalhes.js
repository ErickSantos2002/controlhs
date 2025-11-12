import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, Edit, Calendar, DollarSign, TrendingDown, MapPin, Building, User, Tag, Info, } from 'lucide-react';
import { usePatrimonios } from '../context/PatrimoniosContext';
const PatrimonioDetalhes = ({ isOpen, onClose, patrimonio, onEdit, }) => {
    const { categorias, setores, usuarios } = usePatrimonios();
    if (!isOpen || !patrimonio)
        return null;
    // ========================================
    // HELPERS
    // ========================================
    const formatCurrency = (value) => {
        if (value == null)
            return 'R$ 0,00';
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };
    const formatDate = (date) => {
        if (!date)
            return 'N/A';
        return new Date(date).toLocaleDateString('pt-BR');
    };
    const formatDateTime = (date) => {
        if (!date)
            return 'N/A';
        return new Date(date).toLocaleString('pt-BR');
    };
    const getCategoriaNome = () => {
        const categoria = categorias.find((c) => c.id === patrimonio.categoria_id);
        return (categoria === null || categoria === void 0 ? void 0 : categoria.nome) || 'N/A';
    };
    const getSetorNome = () => {
        const setor = setores.find((s) => s.id === patrimonio.setor_id);
        return (setor === null || setor === void 0 ? void 0 : setor.nome) || 'N/A';
    };
    const getResponsavelNome = () => {
        const responsavel = usuarios.find((u) => u.id === patrimonio.responsavel_id);
        return (responsavel === null || responsavel === void 0 ? void 0 : responsavel.username) || 'N/A';
    };
    const calcularDepreciacao = () => {
        const valorAquisicao = patrimonio.valor_aquisicao || 0;
        const valorAtual = patrimonio.valor_atual || 0;
        const depreciacao = valorAquisicao - valorAtual;
        const percentual = valorAquisicao > 0 ? (depreciacao / valorAquisicao) * 100 : 0;
        return {
            valor: depreciacao,
            percentual,
        };
    };
    const depreciacao = calcularDepreciacao();
    // ========================================
    // RENDER
    // ========================================
    return (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity", onClick: onClose }), _jsx("div", { className: "flex min-h-full items-center justify-center", children: _jsxs("div", { className: "relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: "Detalhes do Patrim\u00F4nio" }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", children: _jsx(X, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" }) })] }), _jsxs("div", { className: "p-6 max-h-[calc(100vh-200px)] overflow-y-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Info, { className: "w-5 h-5 text-blue-600 dark:text-blue-400" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200", children: "Informa\u00E7\u00F5es B\u00E1sicas" })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Nome" }), _jsx("p", { className: "text-base font-medium text-gray-900 dark:text-gray-100", children: patrimonio.nome })] }), _jsx("div", { children: _jsx("span", { className: `inline-flex px-3 py-1 text-xs font-semibold rounded-full ${patrimonio.status === 'ativo'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                                                                    : patrimonio.status === 'manutencao'
                                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'}`, children: patrimonio.status === 'ativo'
                                                                    ? 'Ativo'
                                                                    : patrimonio.status === 'manutencao'
                                                                        ? 'Em Manutenção'
                                                                        : 'Baixado' }) })] }), patrimonio.descricao && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Descri\u00E7\u00E3o" }), _jsx("p", { className: "text-base text-gray-700 dark:text-gray-300", children: patrimonio.descricao })] })), patrimonio.numero_serie && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "N\u00FAmero de S\u00E9rie" }), _jsx("p", { className: "text-base font-mono text-gray-700 dark:text-gray-300", children: patrimonio.numero_serie })] })), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "ID do Patrim\u00F4nio" }), _jsxs("p", { className: "text-base font-mono text-gray-700 dark:text-gray-300", children: ["#", patrimonio.id] })] })] })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(DollarSign, { className: "w-5 h-5 text-green-600 dark:text-green-400" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200", children: "Dados Financeiros" })] }), _jsx("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Valor de Aquisi\u00E7\u00E3o" }), _jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: formatCurrency(patrimonio.valor_aquisicao) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Valor Atual" }), _jsx("p", { className: "text-lg font-semibold text-blue-600 dark:text-blue-400", children: formatCurrency(patrimonio.valor_atual) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Deprecia\u00E7\u00E3o" }), _jsx("p", { className: "text-lg font-semibold text-orange-600 dark:text-orange-400", children: formatCurrency(depreciacao.valor) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "% de Deprecia\u00E7\u00E3o" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("p", { className: "text-lg font-semibold text-orange-600 dark:text-orange-400", children: [depreciacao.percentual.toFixed(1), "%"] }), _jsx(TrendingDown, { className: "w-4 h-4 text-orange-500" })] })] })] }) })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(MapPin, { className: "w-5 h-5 text-purple-600 dark:text-purple-400" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200", children: "Localiza\u00E7\u00E3o e Responsabilidade" })] }), _jsx("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Tag, { className: "w-4 h-4 text-gray-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Categoria" }), _jsx("p", { className: "text-base font-medium text-gray-700 dark:text-gray-300", children: getCategoriaNome() })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Building, { className: "w-4 h-4 text-gray-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Setor" }), _jsx("p", { className: "text-base font-medium text-gray-700 dark:text-gray-300", children: getSetorNome() })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(User, { className: "w-4 h-4 text-gray-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Respons\u00E1vel" }), _jsx("p", { className: "text-base font-medium text-gray-700 dark:text-gray-300", children: getResponsavelNome() })] })] })] }) })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Calendar, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200", children: "Datas" })] }), _jsx("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Data de Aquisi\u00E7\u00E3o" }), _jsx("p", { className: "text-base font-medium text-gray-700 dark:text-gray-300", children: formatDate(patrimonio.data_aquisicao) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Data de Cadastro" }), _jsx("p", { className: "text-base font-medium text-gray-700 dark:text-gray-300", children: formatDateTime(patrimonio.criado_em) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "\u00DAltima Atualiza\u00E7\u00E3o" }), _jsx("p", { className: "text-base font-medium text-gray-700 dark:text-gray-300", children: formatDateTime(patrimonio.atualizado_em) })] })] }) })] })] }), _jsxs("div", { className: "flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300\r\n                bg-white dark:bg-[#2a2a2a]\r\n                border border-gray-300 dark:border-gray-600\r\n                rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]\r\n                transition-colors", children: "Fechar" }), onEdit && (_jsxs("button", { onClick: () => {
                                        onEdit(patrimonio);
                                        onClose();
                                    }, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white\r\n                  bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600\r\n                  rounded-lg shadow-sm hover:shadow-md\r\n                  transition-all duration-200", children: [_jsx(Edit, { className: "w-4 h-4" }), "Editar Patrim\u00F4nio"] }))] })] }) })] }));
};
export default PatrimonioDetalhes;

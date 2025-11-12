import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { Plus, Download, Search, Eye, Edit, Trash2, ChevronUp, ChevronDown, Loader2, AlertCircle, RefreshCw, X, Package, TrendingUp, DollarSign, } from 'lucide-react';
import { PatrimoniosProvider, usePatrimonios, } from '../context/PatrimoniosContext';
import PatrimonioModal from '../components/PatrimonioModal';
import PatrimonioDetalhes from '../components/PatrimonioDetalhes';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
// ========================================
// COMPONENTE INTERNO COM LÓGICA
// ========================================
const PatrimoniosContent = () => {
    var _a;
    const { user } = useAuth();
    const { patrimoniosFiltrados, categorias, setores, usuarios, filtros, setFiltros, ordenacao, setOrdenacao, loading, error, deletePatrimonio, refreshData, } = usePatrimonios();
    // ========================================
    // ESTADOS LOCAIS
    // ========================================
    // Modais
    const [modalMode, setModalMode] = useState(null);
    const [patrimonioSelecionado, setPatrimonioSelecionado] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;
    // Busca local (com debounce)
    const [buscaLocal, setBuscaLocal] = useState('');
    // Estados UI
    const [deletingId, setDeletingId] = useState(null);
    // ========================================
    // PERMISSÕES
    // ========================================
    const userRole = ((_a = user === null || user === void 0 ? void 0 : user.role) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const canCreate = ['administrador', 'gestor'].includes(userRole);
    const canEdit = ['administrador', 'gestor', 'gerente'].includes(userRole);
    const canDelete = userRole === 'administrador';
    const isAdmin = ['gestor', 'administrador', 'gerente'].includes(userRole);
    // ========================================
    // EFEITOS
    // ========================================
    // Atualiza busca no contexto com debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setFiltros(Object.assign(Object.assign({}, filtros), { busca: buscaLocal }));
            setPaginaAtual(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [buscaLocal]);
    // Reset página quando filtros mudam
    useEffect(() => {
        setPaginaAtual(1);
    }, [
        filtros.categoria,
        filtros.setor,
        filtros.status,
        filtros.responsavel,
        filtros.dataInicio,
        filtros.dataFim,
    ]);
    // ========================================
    // KPIs CALCULADOS
    // ========================================
    const kpis = useMemo(() => {
        const total = patrimoniosFiltrados.length;
        const valorTotal = patrimoniosFiltrados.reduce((sum, p) => sum + (p.valor_atual || 0), 0);
        const depreciacaoTotal = patrimoniosFiltrados.reduce((sum, p) => sum + ((p.valor_aquisicao || 0) - (p.valor_atual || 0)), 0);
        return {
            total,
            valorTotal,
            depreciacaoTotal,
        };
    }, [patrimoniosFiltrados]);
    // ========================================
    // PAGINAÇÃO
    // ========================================
    const dadosPaginados = useMemo(() => {
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        return patrimoniosFiltrados.slice(inicio, fim);
    }, [patrimoniosFiltrados, paginaAtual, itensPorPagina]);
    const totalPaginas = Math.ceil(patrimoniosFiltrados.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina + 1;
    const fim = Math.min(paginaAtual * itensPorPagina, patrimoniosFiltrados.length);
    const paginasVisiveis = useMemo(() => {
        const window = Math.min(5, totalPaginas);
        let start = 1;
        if (totalPaginas > 5) {
            if (paginaAtual <= 3)
                start = 1;
            else if (paginaAtual >= totalPaginas - 2)
                start = totalPaginas - 4;
            else
                start = paginaAtual - 2;
        }
        return Array.from({ length: window }, (_, i) => start + i);
    }, [paginaAtual, totalPaginas]);
    // ========================================
    // HANDLERS
    // ========================================
    const handleOrdenar = (campo) => {
        setOrdenacao({
            campo: campo,
            direcao: ordenacao.campo === campo && ordenacao.direcao === 'asc'
                ? 'desc'
                : 'asc',
        });
    };
    const handleView = (patrimonio) => {
        setPatrimonioSelecionado(patrimonio);
        setModalMode('view');
    };
    const handleEdit = (patrimonio) => {
        setPatrimonioSelecionado(patrimonio);
        setModalMode('edit');
    };
    const handleDeleteClick = (patrimonio) => {
        setShowDeleteConfirm(patrimonio);
    };
    const handleDeleteConfirm = async () => {
        if (!showDeleteConfirm)
            return;
        setDeletingId(showDeleteConfirm.id);
        try {
            await deletePatrimonio(showDeleteConfirm.id);
            setShowDeleteConfirm(null);
        }
        catch (err) {
            console.error('Erro ao excluir patrimônio:', err);
        }
        finally {
            setDeletingId(null);
        }
    };
    // ✅ ADICIONADO: Lógica no limparFiltros
    const limparFiltros = () => {
        // Se for usuário comum, mantém o filtro dele
        if (!isAdmin && user) {
            setFiltros({
                busca: '',
                categoria: 'todas',
                setor: 'todos',
                status: 'todos',
                responsavel: user.id.toString(), // Mantém filtrado pelo usuário
                dataInicio: undefined,
                dataFim: undefined,
            });
            setBuscaLocal('');
        }
        else {
            // Admin pode limpar tudo
            setFiltros({
                busca: '',
                categoria: 'todas',
                setor: 'todos',
                status: 'todos',
                responsavel: 'todos',
                dataInicio: undefined,
                dataFim: undefined,
            });
            setBuscaLocal('');
        }
        // ...
    };
    const handleExportarExcel = () => {
        if (patrimoniosFiltrados.length === 0) {
            alert('Nenhum patrimônio para exportar!');
            return;
        }
        const dados = patrimoniosFiltrados.map((p) => {
            var _a, _b, _c, _d, _e;
            return ({
                ID: p.id,
                Nome: p.nome,
                'Número de Série': p.numero_serie || '-',
                Categoria: ((_a = categorias.find((c) => c.id === p.categoria_id)) === null || _a === void 0 ? void 0 : _a.nome) || '-',
                Setor: ((_b = setores.find((s) => s.id === p.setor_id)) === null || _b === void 0 ? void 0 : _b.nome) || '-',
                Responsável: ((_c = usuarios.find((u) => u.id === p.responsavel_id)) === null || _c === void 0 ? void 0 : _c.username) || '-',
                'Data Aquisição': p.data_aquisicao
                    ? new Date(p.data_aquisicao).toLocaleDateString('pt-BR')
                    : '-',
                'Valor Aquisição': ((_d = p.valor_aquisicao) === null || _d === void 0 ? void 0 : _d.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                })) || 'R$ 0,00',
                'Valor Atual': ((_e = p.valor_atual) === null || _e === void 0 ? void 0 : _e.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                })) || 'R$ 0,00',
                Depreciação: ((p.valor_aquisicao || 0) - (p.valor_atual || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                Status: p.status === 'ativo'
                    ? 'Ativo'
                    : p.status === 'manutencao'
                        ? 'Em Manutenção'
                        : 'Baixado',
            });
        });
        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Patrimônios');
        const fileName = `patrimonios_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };
    // ========================================
    // HELPERS
    // ========================================
    const getCategoriaNome = (id) => { var _a; return ((_a = categorias.find((c) => c.id === id)) === null || _a === void 0 ? void 0 : _a.nome) || 'N/A'; };
    const getSetorNome = (id) => { var _a; return ((_a = setores.find((s) => s.id === id)) === null || _a === void 0 ? void 0 : _a.nome) || 'N/A'; };
    const getResponsavelNome = (id) => { var _a; return ((_a = usuarios.find((u) => u.id === id)) === null || _a === void 0 ? void 0 : _a.username) || 'N/A'; };
    const formatCurrency = (value) => {
        if (value == null)
            return 'R$ 0,00';
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };
    const getStatusDisplay = (status) => {
        if (status === 'ativo')
            return 'Ativo';
        if (status === 'manutencao')
            return 'Em Manutenção';
        if (status === 'baixado')
            return 'Baixado';
        return 'N/A';
    };
    const OrdenacaoIcon = ({ campo }) => {
        if (ordenacao.campo !== campo)
            return null;
        return ordenacao.direcao === 'asc' ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" }));
    };
    // ========================================
    // RENDER
    // ========================================
    if (error) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: _jsxs("div", { className: "text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Erro ao carregar dados" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 mb-4", children: error }), _jsx("button", { onClick: () => refreshData(), className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors", children: "Tentar Novamente" })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-[#facc15] tracking-tight", children: "Gest\u00E3o de Patrim\u00F4nios" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 mt-1", children: "Gerencie todos os bens patrimoniais da organiza\u00E7\u00E3o" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("button", { onClick: () => refreshData(), disabled: loading, className: "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg\r\n                text-gray-700 dark:text-gray-300\r\n                bg-white dark:bg-[#1f1f1f]\r\n                border border-gray-300 dark:border-gray-600\r\n                hover:bg-gray-50 dark:hover:bg-[#2a2a2a]\r\n                disabled:opacity-50 disabled:cursor-not-allowed\r\n                shadow-sm hover:shadow-md\r\n                transition-all duration-200", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), "Atualizar"] }), _jsxs("button", { onClick: handleExportarExcel, disabled: loading || patrimoniosFiltrados.length === 0, className: "flex items-center justify-center gap-2 px-4 py-2 \r\n                bg-gradient-to-r from-green-500 to-emerald-600 \r\n                text-white font-medium rounded-lg shadow-md\r\n                hover:from-green-400 hover:to-emerald-500 \r\n                dark:hover:from-green-600 dark:hover:to-green-500\r\n                disabled:opacity-50 disabled:cursor-not-allowed\r\n                transition-all duration-300", children: [_jsx(Download, { className: "w-4 h-4" }), "Exportar"] }), canCreate && (_jsxs("button", { onClick: () => setModalMode('create'), className: "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg\r\n                  text-white \r\n                  bg-blue-600 hover:bg-blue-700 \r\n                  dark:bg-blue-500 dark:hover:bg-blue-600\r\n                  shadow-sm hover:shadow-md\r\n                  transition-all duration-200", children: [_jsx(Plus, { className: "w-4 h-4" }), "Novo Patrim\u00F4nio"] }))] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: [_jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Total de Patrim\u00F4nios" }), _jsx("p", { className: "text-3xl font-semibold text-blue-500 dark:text-blue-300 mt-2 tracking-tight", children: kpis.total.toLocaleString('pt-BR') })] }), _jsx("div", { className: "bg-blue-100/70 dark:bg-blue-900/50 p-3 rounded-full", children: _jsx(Package, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }) })] }) }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Valor Total" }), _jsx("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400 mt-2", children: kpis.valorTotal.toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }) })] }), _jsx("div", { className: "bg-green-100 dark:bg-green-900/40 p-3 rounded-full", children: _jsx(DollarSign, { className: "w-6 h-6 text-green-600 dark:text-green-400" }) })] }) }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Deprecia\u00E7\u00E3o Total" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2", children: kpis.depreciacaoTotal.toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL',
                                            }) })] }), _jsx("div", { className: "bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-full", children: _jsx(TrendingUp, { className: "w-6 h-6 text-yellow-600 dark:text-yellow-400" }) })] }) })] }), _jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl border border-gray-200 dark:border-[#2d2d2d] p-5 shadow-md transition-colors", children: [_jsxs("div", { className: "flex flex-nowrap items-center gap-3 mb-4", children: [_jsxs("div", { className: "relative flex-1 min-w-0", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Buscar por nome, descri\u00E7\u00E3o ou n\u00FAmero de s\u00E9rie...", value: buscaLocal, onChange: (e) => setBuscaLocal(e.target.value), className: "w-full pl-10 pr-4 py-2 rounded-lg\r\n                bg-white/95 dark:bg-[#2a2a2a]/95\r\n                text-gray-900 dark:text-gray-100\r\n                border border-gray-300 dark:border-[#3a3a3a]\r\n                placeholder-gray-400 dark:placeholder-gray-500\r\n                focus:ring-2 focus:ring-blue-500 focus:border-transparent\r\n                transition-all" })] }), _jsx("button", { onClick: limparFiltros, title: "Limpar filtros", className: "flex-shrink-0 flex items-center justify-center w-[48px] h-[42px]\r\n              rounded-lg border border-gray-300 dark:border-[#3a3a3a]\r\n              bg-white/95 dark:bg-[#2a2a2a]/95\r\n              text-gray-600 dark:text-gray-300\r\n              hover:bg-red-500 hover:text-white dark:hover:bg-red-600\r\n              transition-all duration-200 shadow-sm hover:shadow-md", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-3 border-t border-gray-200 dark:border-[#2d2d2d]", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Categoria" }), _jsxs("select", { value: filtros.categoria, onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { categoria: e.target.value })), className: "w-full px-3 py-2 rounded-lg\r\n                bg-white/95 dark:bg-[#2a2a2a]/95\r\n                text-gray-900 dark:text-gray-100\r\n                border border-gray-300 dark:border-[#3a3a3a]\r\n                focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "todas", children: "Todas" }), categorias.map((cat) => (_jsx("option", { value: cat.id, children: cat.nome }, cat.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Setor" }), _jsxs("select", { value: filtros.setor, onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { setor: e.target.value })), className: "w-full px-3 py-2 rounded-lg\r\n                bg-white/95 dark:bg-[#2a2a2a]/95\r\n                text-gray-900 dark:text-gray-100\r\n                border border-gray-300 dark:border-[#3a3a3a]\r\n                focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "todos", children: "Todos" }), setores.map((setor) => (_jsx("option", { value: setor.id, children: setor.nome }, setor.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Status" }), _jsxs("select", { value: filtros.status, onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { status: e.target.value })), className: "w-full px-3 py-2 rounded-lg\r\n                bg-white/95 dark:bg-[#2a2a2a]/95\r\n                text-gray-900 dark:text-gray-100\r\n                border border-gray-300 dark:border-[#3a3a3a]\r\n                focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "todos", children: "Todos" }), _jsx("option", { value: "ativo", children: "Ativo" }), _jsx("option", { value: "manutencao", children: "Em Manuten\u00E7\u00E3o" }), _jsx("option", { value: "baixado", children: "Baixado" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Respons\u00E1vel" }), _jsx("select", { value: filtros.responsavel, onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { responsavel: e.target.value })), disabled: !isAdmin, className: "w-full px-3 py-2 rounded-lg\r\n                bg-white/95 dark:bg-[#2a2a2a]/95\r\n                text-gray-900 dark:text-gray-100\r\n                border border-gray-300 dark:border-[#3a3a3a]\r\n                focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: isAdmin ? (_jsxs(_Fragment, { children: [_jsx("option", { value: "todos", children: "Todos os respons\u00E1veis" }), usuarios.map((usuario) => (_jsx("option", { value: usuario.id, children: usuario.username }, usuario.id)))] })) : (_jsx("option", { value: user === null || user === void 0 ? void 0 : user.id, children: user === null || user === void 0 ? void 0 : user.username })) })] })] })] }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-md overflow-hidden transition-colors", children: loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" }) })) : patrimoniosFiltrados.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-[#2a2a2a] border-b border-gray-200 dark:border-[#2d2d2d]", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors", onClick: () => handleOrdenar('nome'), children: _jsxs("div", { className: "flex items-center gap-1", children: ["Nome", _jsx(OrdenacaoIcon, { campo: "nome" })] }) }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "Categoria" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "Respons\u00E1vel" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "Setor" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors", onClick: () => handleOrdenar('data_aquisicao'), children: _jsxs("div", { className: "flex items-center justify-center gap-1", children: ["Data Aquisi\u00E7\u00E3o", _jsx(OrdenacaoIcon, { campo: "data_aquisicao" })] }) }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors", onClick: () => handleOrdenar('valor_atual'), children: _jsxs("div", { className: "flex items-center justify-center gap-1", children: ["Valor Atual", _jsx(OrdenacaoIcon, { campo: "valor_atual" })] }) }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "Deprecia\u00E7\u00E3o" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-[#2d2d2d]", children: dadosPaginados.map((patrimonio) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors", children: [_jsxs("td", { className: "px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100", children: [patrimonio.nome, patrimonio.numero_serie && (_jsxs("span", { className: "block text-xs text-gray-500 dark:text-gray-400", children: ["SN: ", patrimonio.numero_serie] }))] }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: getCategoriaNome(patrimonio.categoria_id) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: getResponsavelNome(patrimonio.responsavel_id) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: getSetorNome(patrimonio.setor_id) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: patrimonio.data_aquisicao
                                                        ? new Date(patrimonio.data_aquisicao).toLocaleDateString('pt-BR')
                                                        : 'N/A' }), _jsx("td", { className: "px-4 py-3 text-sm text-center font-semibold text-blue-600 dark:text-blue-400", children: formatCurrency(patrimonio.valor_atual) }), _jsx("td", { className: "px-4 py-3 text-sm text-center font-semibold text-yellow-600 dark:text-yellow-400", children: formatCurrency((patrimonio.valor_aquisicao || 0) -
                                                        (patrimonio.valor_atual || 0)) }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${patrimonio.status === 'ativo'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                                                            : patrimonio.status === 'manutencao'
                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'}`, children: getStatusDisplay(patrimonio.status) }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("button", { onClick: () => handleView(patrimonio), className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors", title: "Visualizar", children: _jsx(Eye, { className: "w-4 h-4 text-blue-600 dark:text-blue-400" }) }), canEdit && (_jsx("button", { onClick: () => handleEdit(patrimonio), className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors", title: "Editar", children: _jsx(Edit, { className: "w-4 h-4 text-yellow-600 dark:text-yellow-400" }) })), canDelete && (_jsx("button", { onClick: () => handleDeleteClick(patrimonio), disabled: deletingId === patrimonio.id, className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors disabled:opacity-50", title: "Excluir", children: deletingId === patrimonio.id ? (_jsx(Loader2, { className: "w-4 h-4 text-red-600 animate-spin" })) : (_jsx(Trash2, { className: "w-4 h-4 text-red-600 dark:text-red-400" })) }))] }) })] }, patrimonio.id))) })] }) }), totalPaginas > 1 && (_jsx("div", { className: "mt-4 px-4 pb-4", children: _jsxs("div", { className: "hidden md:flex justify-between items-center text-sm text-gray-600 dark:text-gray-300", children: [_jsxs("div", { children: ["Mostrando ", inicio, " a ", fim, " de ", patrimoniosFiltrados.length, ' ', "registros"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setPaginaAtual((prev) => Math.max(1, prev - 1)), disabled: paginaAtual === 1, className: "px-3 py-1 border rounded-lg\r\n                        bg-white/95 dark:bg-[#1e1e1e]/95\r\n                        border-gray-300 dark:border-[#3a3a3a]\r\n                        text-gray-700 dark:text-gray-300\r\n                        hover:bg-gray-100 dark:hover:bg-[#2a2a2a]\r\n                        disabled:opacity-50 disabled:cursor-not-allowed\r\n                        transition-colors", children: "Anterior" }), _jsx("div", { className: "flex gap-1", children: paginasVisiveis.map((page) => (_jsx("button", { onClick: () => setPaginaAtual(page), className: `px-3 py-1 border rounded-lg transition-colors ${paginaAtual === page
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white/95 dark:bg-[#1e1e1e]/95 border-gray-300 dark:border-[#3a3a3a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'}`, children: page }, page))) }), _jsx("button", { onClick: () => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1)), disabled: paginaAtual === totalPaginas, className: "px-3 py-1 border rounded-lg\r\n                        bg-white/95 dark:bg-[#1e1e1e]/95\r\n                        border-gray-300 dark:border-[#3a3a3a]\r\n                        text-gray-700 dark:text-gray-300\r\n                        hover:bg-gray-100 dark:hover:bg-[#2a2a2a]\r\n                        disabled:opacity-50 disabled:cursor-not-allowed\r\n                        transition-colors", children: "Pr\u00F3ximo" })] })] }) }))] })) : (_jsxs("div", { className: "py-12 text-center", children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400 text-lg", children: "Nenhum patrim\u00F4nio encontrado com os filtros selecionados" }), _jsx("button", { onClick: limparFiltros, className: "mt-2 px-3 py-1.5 text-sm font-medium rounded-lg\r\n                text-white bg-blue-600 hover:bg-blue-700\r\n                dark:bg-blue-500 dark:hover:bg-blue-600\r\n                shadow-sm hover:shadow-md transition-all duration-200", children: "Limpar filtros" })] })) }), (modalMode === 'create' || modalMode === 'edit') && (_jsx(PatrimonioModal, { isOpen: true, onClose: () => {
                    setModalMode(null);
                    setPatrimonioSelecionado(null);
                }, patrimonio: modalMode === 'edit' ? patrimonioSelecionado : null, onSuccess: () => {
                    refreshData();
                } })), modalMode === 'view' && (_jsx(PatrimonioDetalhes, { isOpen: true, onClose: () => {
                    setModalMode(null);
                    setPatrimonioSelecionado(null);
                }, patrimonio: patrimonioSelecionado, onEdit: (p) => {
                    setPatrimonioSelecionado(p);
                    setModalMode('edit');
                } })), showDeleteConfirm && (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity", onClick: () => setShowDeleteConfirm(null) }), _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsxs("div", { className: "relative w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center", children: _jsx(AlertCircle, { className: "w-5 h-5 text-red-600 dark:text-red-400" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "Confirmar Exclus\u00E3o" })] }), _jsxs("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: ["Tem certeza que deseja excluir o patrim\u00F4nio", ' ', _jsx("strong", { children: showDeleteConfirm.nome }), "? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita."] }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: () => setShowDeleteConfirm(null), className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300\r\n                    bg-white dark:bg-[#2a2a2a]\r\n                    border border-gray-300 dark:border-gray-600\r\n                    rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]\r\n                    transition-colors", children: "Cancelar" }), _jsx("button", { onClick: handleDeleteConfirm, disabled: deletingId !== null, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white\r\n                    bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600\r\n                    rounded-lg shadow-sm hover:shadow-md\r\n                    disabled:opacity-50 disabled:cursor-not-allowed\r\n                    transition-all duration-200", children: deletingId ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Excluindo..."] })) : (_jsxs(_Fragment, { children: [_jsx(Trash2, { className: "w-4 h-4" }), "Sim, Excluir"] })) })] })] }) })] }))] }));
};
// ========================================
// COMPONENTE PRINCIPAL (COM PROVIDER)
// ========================================
const Patrimonios = () => {
    return (_jsx(PatrimoniosProvider, { children: _jsx(PatrimoniosContent, {}) }));
};
export default Patrimonios;

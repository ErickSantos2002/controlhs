import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { Plus, Download, Search, Eye, Check, X, Trash2, ChevronUp, ChevronDown, Loader2, AlertCircle, RefreshCw, ArrowRightLeft, Clock, CheckCircle, XCircle, ArrowRight, } from 'lucide-react';
import { TransferenciasProvider, useTransferencias, } from '../context/TransferenciasContext';
import TransferenciaModal from '../components/TransferenciaModal';
import TransferenciaDetalhes from '../components/TransferenciaDetalhes';
import TransferenciaAprovacao from '../components/TransferenciaAprovacao';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { STATUS_LABELS, STATUS_COLORS, } from '../types/transferencias.types';
// ========================================
// COMPONENTE INTERNO COM LÓGICA
// ========================================
const TransferenciasContent = () => {
    var _a, _b, _c, _d, _e;
    const { user } = useAuth();
    const { transferenciasFiltradas, patrimonios, setores, usuarios, filtros, setFiltros, ordenacao, setOrdenacao, loading, error, kpis, podeAprovar, podeEfetivar, deleteTransferencia, efetivarTransferencia, refreshData, } = useTransferencias();
    // ========================================
    // ESTADOS LOCAIS
    // ========================================
    // Modais
    const [modalCriar, setModalCriar] = useState(false);
    const [modalDetalhes, setModalDetalhes] = useState(null);
    const [modalAprovacao, setModalAprovacao] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    // Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;
    // Busca local (com debounce)
    const [buscaLocal, setBuscaLocal] = useState('');
    // Estados UI
    const [deletingId, setDeletingId] = useState(null);
    const [efetivandoId, setEfetivandoId] = useState(null);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    // ========================================
    // PERMISSÕES
    // ========================================
    const userRole = ((_a = user === null || user === void 0 ? void 0 : user.role) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const isAdmin = ['gestor', 'administrador', 'gerente'].includes(userRole);
    const canCreate = true; // Todos podem solicitar transferências
    const canDelete = userRole === 'administrador';
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
        filtros.status,
        filtros.patrimonio,
        filtros.solicitante,
        filtros.aprovador,
        filtros.dataInicio,
        filtros.dataFim,
    ]);
    // ========================================
    // PAGINAÇÃO
    // ========================================
    const dadosPaginados = useMemo(() => {
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        return transferenciasFiltradas.slice(inicio, fim);
    }, [transferenciasFiltradas, paginaAtual, itensPorPagina]);
    const totalPaginas = Math.ceil(transferenciasFiltradas.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina + 1;
    const fim = Math.min(paginaAtual * itensPorPagina, transferenciasFiltradas.length);
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
    const handleView = (transferencia) => {
        setModalDetalhes(transferencia);
    };
    const handleAprovar = (transferencia) => {
        setModalAprovacao({ transferencia, tipo: 'aprovar' });
    };
    const handleRejeitar = (transferencia) => {
        setModalAprovacao({ transferencia, tipo: 'rejeitar' });
    };
    const handleEfetivar = async (transferencia) => {
        if (!window.confirm('Confirma a efetivação desta transferência? O patrimônio será atualizado com o novo setor e responsável.')) {
            return;
        }
        setEfetivandoId(transferencia.id);
        try {
            await efetivarTransferencia(transferencia.id);
            await refreshData();
        }
        catch (err) {
            console.error('Erro ao efetivar transferência:', err);
        }
        finally {
            setEfetivandoId(null);
        }
    };
    const handleDeleteClick = (transferencia) => {
        setShowDeleteConfirm(transferencia);
    };
    const handleDeleteConfirm = async () => {
        if (!showDeleteConfirm)
            return;
        setDeletingId(showDeleteConfirm.id);
        try {
            await deleteTransferencia(showDeleteConfirm.id);
            setShowDeleteConfirm(null);
        }
        catch (err) {
            console.error('Erro ao excluir transferência:', err);
        }
        finally {
            setDeletingId(null);
        }
    };
    const limparFiltros = () => {
        setFiltros({
            busca: '',
            status: 'todos',
            setor: 'todos', // ✅ Campo unificado
            responsavel: 'todos', // ✅ Campo unificado
            patrimonio: 'todos',
            solicitante: 'todos',
            aprovador: 'todos',
            dataInicio: undefined,
            dataFim: undefined,
        });
        setBuscaLocal('');
    };
    const handleExportarExcel = () => {
        if (transferenciasFiltradas.length === 0) {
            alert('Nenhuma transferência para exportar!');
            return;
        }
        const dados = transferenciasFiltradas.map((t) => {
            const patrimonio = patrimonios.find((p) => p.id === t.patrimonio_id);
            const setorOrigem = setores.find((s) => s.id === t.setor_origem_id);
            const setorDestino = setores.find((s) => s.id === t.setor_destino_id);
            const responsavelOrigem = usuarios.find((u) => u.id === t.responsavel_origem_id);
            const responsavelDestino = usuarios.find((u) => u.id === t.responsavel_destino_id);
            const solicitante = usuarios.find((u) => u.id === t.solicitante_id);
            const aprovador = t.aprovado_por
                ? usuarios.find((u) => u.id === t.aprovado_por)
                : null;
            return {
                ID: t.id,
                Patrimônio: (patrimonio === null || patrimonio === void 0 ? void 0 : patrimonio.nome) || 'N/A',
                'Setor Origem': (setorOrigem === null || setorOrigem === void 0 ? void 0 : setorOrigem.nome) || 'N/A',
                'Setor Destino': (setorDestino === null || setorDestino === void 0 ? void 0 : setorDestino.nome) || 'N/A',
                'Responsável Origem': (responsavelOrigem === null || responsavelOrigem === void 0 ? void 0 : responsavelOrigem.username) || 'N/A',
                'Responsável Destino': (responsavelDestino === null || responsavelDestino === void 0 ? void 0 : responsavelDestino.username) || 'N/A',
                Solicitante: (solicitante === null || solicitante === void 0 ? void 0 : solicitante.username) || 'N/A',
                'Data Solicitação': t.data_transferencia
                    ? new Date(t.data_transferencia).toLocaleDateString('pt-BR')
                    : 'N/A',
                Status: STATUS_LABELS[t.status],
                Aprovador: (aprovador === null || aprovador === void 0 ? void 0 : aprovador.username) || '-',
                'Data Aprovação': t.data_aprovacao // ✅ Sem cast
                    ? new Date(t.data_aprovacao).toLocaleDateString('pt-BR')
                    : 'N/A',
                'Data Efetivação': t.data_efetivacao // ✅ NOVO CAMPO
                    ? new Date(t.data_efetivacao).toLocaleDateString('pt-BR')
                    : 'N/A',
                Motivo: t.motivo || 'N/A',
                'Motivo Rejeição': t.motivo_rejeicao || '-', // ✅ NOVO CAMPO
                Observações: t.observacoes || '-', // ✅ NOVO CAMPO
            };
        });
        const ws = XLSX.utils.json_to_sheet(dados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transferencias');
        const dataHoje = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `transferencias_${dataHoje}.xlsx`);
    };
    // ========================================
    // HELPERS
    // ========================================
    const getPatrimonioNome = (patrimonio_id) => {
        const patrimonio = patrimonios.find((p) => p.id === patrimonio_id);
        return (patrimonio === null || patrimonio === void 0 ? void 0 : patrimonio.nome) || 'N/A';
    };
    const getSetorNome = (setor_id) => {
        if (!setor_id)
            return 'N/A';
        const setor = setores.find((s) => s.id === setor_id);
        return (setor === null || setor === void 0 ? void 0 : setor.nome) || 'N/A';
    };
    const getUsuarioNome = (user_id) => {
        if (!user_id)
            return 'N/A';
        const user = usuarios.find((u) => u.id === user_id);
        return (user === null || user === void 0 ? void 0 : user.username) || 'N/A';
    };
    const formatDate = (date) => {
        if (!date)
            return 'N/A';
        return new Date(date).toLocaleDateString('pt-BR');
    };
    // ========================================
    // RENDER
    // ========================================
    return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsx("div", { className: "bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md border border-gray-200 dark:border-[#2d2d2d] p-6 mb-6 transition-colors", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-[#facc15] tracking-tight", children: "Gest\u00E3o de Transfer\u00EAncias" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 mt-1", children: "Controle completo das movimenta\u00E7\u00F5es de patrim\u00F4nio entre setores e respons\u00E1veis" })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("button", { onClick: () => refreshData(), disabled: loading, className: "flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300\r\n                  bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#3a3a3a]\r\n                  hover:bg-gray-50 dark:hover:bg-[#333333]\r\n                  font-medium text-sm rounded-lg transition-all duration-200", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), "Atualizar"] }), _jsxs("button", { onClick: handleExportarExcel, className: "flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700\r\n                  dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium text-sm\r\n                  rounded-lg shadow-sm hover:shadow-md transition-all duration-200", children: [_jsx(Download, { className: "w-4 h-4" }), "Exportar"] }), canCreate && (_jsxs("button", { onClick: () => setModalCriar(true), className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 \r\n                    dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium text-sm \r\n                    rounded-lg shadow-sm hover:shadow-md transition-all duration-200", children: [_jsx(Plus, { className: "w-4 h-4" }), "Nova Transfer\u00EAncia"] }))] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Total de Transfer\u00EAncias" }), _jsx("p", { className: "text-3xl font-semibold text-blue-600 dark:text-blue-400 mt-2 tracking-tight", children: (_b = kpis.total) === null || _b === void 0 ? void 0 : _b.toLocaleString('pt-BR') })] }), _jsx("div", { className: "bg-blue-100/70 dark:bg-blue-900/40 p-3 rounded-full", children: _jsx(ArrowRightLeft, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }) })] }) }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Pendentes" }), _jsx("p", { className: "text-3xl font-semibold text-yellow-600 dark:text-yellow-400 mt-2 tracking-tight", children: (_c = kpis.pendentes) === null || _c === void 0 ? void 0 : _c.toLocaleString('pt-BR') })] }), _jsx("div", { className: "bg-yellow-100/70 dark:bg-yellow-900/40 p-3 rounded-full", children: _jsx(Clock, { className: "w-6 h-6 text-yellow-600 dark:text-yellow-400" }) })] }) }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Aprovadas (M\u00EAs)" }), _jsx("p", { className: "text-3xl font-semibold text-green-600 dark:text-green-400 mt-2 tracking-tight", children: (_d = kpis.aprovadasMes) === null || _d === void 0 ? void 0 : _d.toLocaleString('pt-BR') })] }), _jsx("div", { className: "bg-green-100/70 dark:bg-green-900/40 p-3 rounded-full", children: _jsx(CheckCircle, { className: "w-6 h-6 text-green-600 dark:text-green-400" }) })] }) }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Rejeitadas (M\u00EAs)" }), _jsx("p", { className: "text-3xl font-semibold text-red-600 dark:text-red-400 mt-2 tracking-tight", children: (_e = kpis.rejeitadasMes) === null || _e === void 0 ? void 0 : _e.toLocaleString('pt-BR') })] }), _jsx("div", { className: "bg-red-100/70 dark:bg-red-900/40 p-3 rounded-full", children: _jsx(XCircle, { className: "w-6 h-6 text-red-600 dark:text-red-400" }) })] }) })] }), _jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl border border-gray-200 dark:border-[#2d2d2d] p-5 shadow-md mb-6 transition-colors", children: [_jsxs("div", { className: "flex flex-nowrap items-center gap-3 mb-4", children: [_jsxs("div", { className: "relative flex-1 min-w-0", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Buscar por patrim\u00F4nio, motivo ou setor...", value: buscaLocal, onChange: (e) => setBuscaLocal(e.target.value), className: "w-full pl-10 pr-4 py-2 rounded-lg\r\n                  bg-white/95 dark:bg-[#2a2a2a]/95\r\n                  text-gray-900 dark:text-gray-100\r\n                  border border-gray-300 dark:border-[#3a3a3a]\r\n                  placeholder-gray-400 dark:placeholder-gray-500\r\n                  focus:ring-2 focus:ring-blue-500 focus:border-transparent\r\n                  transition-all" })] }), _jsx("button", { onClick: limparFiltros, title: "Limpar filtros", className: "flex-shrink-0 flex items-center justify-center w-[48px] h-[42px]\r\n                rounded-lg border border-gray-300 dark:border-[#3a3a3a]\r\n                bg-white/95 dark:bg-[#2a2a2a]/95\r\n                text-gray-600 dark:text-gray-300\r\n                hover:bg-red-500 hover:text-white dark:hover:bg-red-600\r\n                transition-all duration-200 shadow-sm hover:shadow-md", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-200 dark:border-[#2d2d2d]", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Status" }), _jsxs("select", { value: filtros.status, onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { status: e.target.value })), className: "w-full px-3 py-2 rounded-lg\r\n                  bg-white/95 dark:bg-[#2a2a2a]/95\r\n                  text-gray-900 dark:text-gray-100\r\n                  border border-gray-300 dark:border-[#3a3a3a]\r\n                  focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "todos", children: "Todos" }), _jsx("option", { value: "pendente", children: "Pendente" }), _jsx("option", { value: "aprovada", children: "Aprovada" }), _jsx("option", { value: "concluida", children: "Conclu\u00EDda" }), _jsx("option", { value: "rejeitada", children: "Rejeitada" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Setor (Origem ou Destino)" }), _jsxs("select", { value: filtros.setor, onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { setor: e.target.value })), className: "w-full px-3 py-2 rounded-lg\r\n                  bg-white/95 dark:bg-[#2a2a2a]/95\r\n                  text-gray-900 dark:text-gray-100\r\n                  border border-gray-300 dark:border-[#3a3a3a]\r\n                  focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "todos", children: "Todos" }), setores.map((s) => (_jsx("option", { value: s.id, children: s.nome }, s.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Respons\u00E1vel (Origem ou Destino)" }), _jsx("select", { value: filtros.responsavel, onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { responsavel: e.target.value })), disabled: !isAdmin, className: "w-full px-3 py-2 rounded-lg\r\n                bg-white/95 dark:bg-[#2a2a2a]/95\r\n                text-gray-900 dark:text-gray-100\r\n                border border-gray-300 dark:border-[#3a3a3a]\r\n                focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: isAdmin ? (_jsxs(_Fragment, { children: [_jsx("option", { value: "todos", children: "Todos os respons\u00E1veis" }), usuarios.map((usuario) => (_jsx("option", { value: usuario.id, children: usuario.username }, usuario.id)))] })) : (_jsx("option", { value: user === null || user === void 0 ? void 0 : user.id, children: user === null || user === void 0 ? void 0 : user.username })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Patrim\u00F4nio" }), _jsxs("select", { value: filtros.patrimonio, onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { patrimonio: e.target.value })), className: "w-full px-3 py-2 rounded-lg\r\n                  bg-white/95 dark:bg-[#2a2a2a]/95\r\n                  text-gray-900 dark:text-gray-100\r\n                  border border-gray-300 dark:border-[#3a3a3a]\r\n                  focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "todos", children: "Todos" }), patrimonios.map((p) => (_jsxs("option", { value: p.id, children: [p.nome, " ", p.numero_serie ? `(${p.numero_serie})` : ''] }, p.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Data In\u00EDcio" }), _jsx("input", { type: "date", value: filtros.dataInicio || '', onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { dataInicio: e.target.value })), className: "w-full px-3 py-2 rounded-lg\r\n                  bg-white/95 dark:bg-[#2a2a2a]/95\r\n                  text-gray-900 dark:text-gray-100\r\n                  border border-gray-300 dark:border-[#3a3a3a]\r\n                  focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Data Fim" }), _jsx("input", { type: "date", value: filtros.dataFim || '', onChange: (e) => setFiltros(Object.assign(Object.assign({}, filtros), { dataFim: e.target.value })), className: "w-full px-3 py-2 rounded-lg\r\n                  bg-white/95 dark:bg-[#2a2a2a]/95\r\n                  text-gray-900 dark:text-gray-100\r\n                  border border-gray-300 dark:border-[#3a3a3a]\r\n                  focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] })] }), _jsxs("div", { className: "mt-4 text-sm text-gray-600 dark:text-gray-400", children: ["Exibindo", ' ', _jsx("span", { className: "font-medium", children: transferenciasFiltradas.length }), ' ', "transfer\u00EAncia(s)"] })] }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 rounded-xl border border-gray-200 dark:border-[#2d2d2d] shadow-md overflow-hidden transition-colors", children: loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" }) })) : error ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-500 mb-4" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100 font-medium", children: "Erro ao carregar dados" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 text-sm mt-1", children: error }), _jsx("button", { onClick: refreshData, className: "mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 \r\n                  dark:hover:bg-blue-600 text-white font-medium text-sm rounded-lg \r\n                  shadow-sm hover:shadow-md transition-all duration-200", children: "Tentar Novamente" })] })) : dadosPaginados.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [_jsx(ArrowRightLeft, { className: "w-12 h-12 text-gray-400 mb-4" }), _jsx("p", { className: "text-gray-900 dark:text-gray-100 font-medium", children: "Nenhuma transfer\u00EAncia encontrada" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400 text-sm mt-2", children: transferenciasFiltradas.length === 0 &&
                                filtros.busca === '' &&
                                filtros.status === 'todos'
                                ? 'Clique em "Nova Transferência" para começar'
                                : 'Tente ajustar os filtros para ver mais resultados' })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-[#2a2a2a] border-b border-gray-200 dark:border-[#2d2d2d]", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors", onClick: () => handleOrdenar('id'), children: _jsxs("div", { className: "flex items-center gap-1", children: ["ID", ordenacao.campo === 'id' &&
                                                                (ordenacao.direcao === 'asc' ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })))] }) }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors", onClick: () => handleOrdenar('patrimonio_nome'), children: _jsxs("div", { className: "flex items-center gap-1", children: ["Patrim\u00F4nio", ordenacao.campo === 'patrimonio_nome' &&
                                                                (ordenacao.direcao === 'asc' ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })))] }) }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "De \u2192 Para (Setor)" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "De \u2192 Para (Respons\u00E1vel)" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors", onClick: () => handleOrdenar('data_transferencia'), children: _jsxs("div", { className: "flex items-center justify-center gap-1", children: ["Data", ordenacao.campo === 'data_transferencia' &&
                                                                (ordenacao.direcao === 'asc' ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })))] }) }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333333] transition-colors", onClick: () => handleOrdenar('status'), children: _jsxs("div", { className: "flex items-center justify-center gap-1", children: ["Status", ordenacao.campo === 'status' &&
                                                                (ordenacao.direcao === 'asc' ? (_jsx(ChevronUp, { className: "w-4 h-4" })) : (_jsx(ChevronDown, { className: "w-4 h-4" })))] }) }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "Aprovador" }), _jsx("th", { className: "px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-400 uppercase tracking-wider", children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-[#2d2d2d]", children: dadosPaginados.map((t) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors", children: [_jsxs("td", { className: "px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100", children: ["#", t.id] }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-900 dark:text-gray-100", children: getPatrimonioNome(t.patrimonio_id) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { children: getSetorNome(t.setor_origem_id) }), _jsx(ArrowRight, { className: "w-4 h-4 text-blue-500 dark:text-blue-400" }), _jsx("span", { children: getSetorNome(t.setor_destino_id) })] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("span", { children: getUsuarioNome(t.responsavel_origem_id) }), _jsx(ArrowRight, { className: "w-4 h-4 text-blue-500 dark:text-blue-400" }), _jsx("span", { children: getUsuarioNome(t.responsavel_destino_id) })] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400", children: formatDate(t.data_transferencia) }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[t.status]}`, children: STATUS_LABELS[t.status] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400", children: t.aprovado_por ? getUsuarioNome(t.aprovado_por) : '-' }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("button", { onClick: () => handleView(t), className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors", title: "Visualizar", children: _jsx(Eye, { className: "w-4 h-4 text-blue-600 dark:text-blue-400" }) }), t.status === 'pendente' && podeAprovar(t) && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleAprovar(t), className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors", title: "Aprovar", children: _jsx(Check, { className: "w-4 h-4 text-green-600 dark:text-green-400" }) }), _jsx("button", { onClick: () => handleRejeitar(t), className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors", title: "Rejeitar", children: _jsx(X, { className: "w-4 h-4 text-red-600 dark:text-red-400" }) })] })), t.status === 'aprovada' && podeEfetivar(t) && (_jsx("button", { onClick: () => handleEfetivar(t), disabled: efetivandoId === t.id, className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors disabled:opacity-50", title: "Efetivar", children: efetivandoId === t.id ? (_jsx(Loader2, { className: "w-4 h-4 text-blue-600 animate-spin" })) : (_jsx(ArrowRightLeft, { className: "w-4 h-4 text-blue-600 dark:text-blue-400" })) })), canDelete && t.status !== 'concluida' && (_jsx("button", { onClick: () => handleDeleteClick(t), disabled: deletingId === t.id, className: "p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3a3a3a] transition-colors disabled:opacity-50", title: "Excluir", children: deletingId === t.id ? (_jsx(Loader2, { className: "w-4 h-4 text-red-600 animate-spin" })) : (_jsx(Trash2, { className: "w-4 h-4 text-red-600 dark:text-red-400" })) }))] }) })] }, t.id))) })] }) }), totalPaginas > 1 && (_jsx("div", { className: "mt-4 px-4 pb-4", children: _jsxs("div", { className: "hidden md:flex justify-between items-center text-sm text-gray-600 dark:text-gray-300", children: [_jsxs("div", { children: ["Mostrando ", inicio, " a ", fim, " de", ' ', transferenciasFiltradas.length, " registros"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setPaginaAtual(Math.max(1, paginaAtual - 1)), disabled: paginaAtual === 1, className: "px-3 py-1 border rounded-lg\r\n                          bg-white/95 dark:bg-[#1e1e1e]/95\r\n                          border-gray-300 dark:border-[#3a3a3a]\r\n                          text-gray-700 dark:text-gray-300\r\n                          hover:bg-gray-100 dark:hover:bg-[#2a2a2a]\r\n                          disabled:opacity-50 disabled:cursor-not-allowed\r\n                          transition-colors", children: "Anterior" }), _jsx("div", { className: "flex gap-1", children: paginasVisiveis.map((page) => (_jsx("button", { onClick: () => setPaginaAtual(page), className: `px-3 py-1 border rounded-lg transition-colors ${paginaAtual === page
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white/95 dark:bg-[#1e1e1e]/95 border-gray-300 dark:border-[#3a3a3a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]'}`, children: page }, page))) }), _jsx("button", { onClick: () => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1)), disabled: paginaAtual === totalPaginas, className: "px-3 py-1 border rounded-lg\r\n                          bg-white/95 dark:bg-[#1e1e1e]/95\r\n                          border-gray-300 dark:border-[#3a3a3a]\r\n                          text-gray-700 dark:text-gray-300\r\n                          hover:bg-gray-100 dark:hover:bg-[#2a2a2a]\r\n                          disabled:opacity-50 disabled:cursor-not-allowed\r\n                          transition-colors", children: "Pr\u00F3ximo" })] })] }) }))] })) }), showDeleteConfirm && (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm", onClick: () => setShowDeleteConfirm(null) }), _jsx("div", { className: "flex min-h-full items-center justify-center", children: _jsxs("div", { className: "relative bg-white dark:bg-[#1e1e1e] rounded-lg p-6 max-w-md w-full mx-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Confirmar Exclus\u00E3o" }), _jsxs("p", { className: "text-gray-600 dark:text-gray-400 mb-6", children: ["Tem certeza que deseja excluir a transfer\u00EAncia #", showDeleteConfirm.id, "? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita."] }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsx("button", { onClick: () => setShowDeleteConfirm(null), className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300\r\n                      bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600\r\n                      rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors", children: "Cancelar" }), _jsx("button", { onClick: handleDeleteConfirm, disabled: deletingId === showDeleteConfirm.id, className: "px-4 py-2 text-sm font-medium text-white bg-red-600 \r\n                      hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 \r\n                      rounded-lg shadow-sm hover:shadow-md transition-all duration-200\r\n                      disabled:opacity-50 disabled:cursor-not-allowed", children: deletingId === showDeleteConfirm.id
                                                ? 'Excluindo...'
                                                : 'Excluir' })] })] }) })] })), _jsx(TransferenciaModal, { isOpen: modalCriar, onClose: () => setModalCriar(false), onSuccess: () => {
                    setModalCriar(false);
                    refreshData();
                } }), _jsx(TransferenciaDetalhes, { isOpen: !!modalDetalhes, onClose: () => setModalDetalhes(null), transferencia: modalDetalhes, onAprovar: handleAprovar, onRejeitar: handleRejeitar, onEfetivar: handleEfetivar }), modalAprovacao && (_jsx(TransferenciaAprovacao, { isOpen: true, onClose: () => setModalAprovacao(null), transferencia: modalAprovacao.transferencia, tipo: modalAprovacao.tipo, onSuccess: () => {
                    setModalAprovacao(null);
                    refreshData();
                } }))] }));
};
// ========================================
// COMPONENTE WRAPPER COM PROVIDER
// ========================================
const Transferencias = () => {
    return (_jsx(TransferenciasProvider, { children: _jsx(TransferenciasContent, {}) }));
};
export default Transferencias;

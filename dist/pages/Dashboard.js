import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Filter, Home, Activity, DollarSign, PieChart, Search, Download, AlertCircle, Loader2, } from 'lucide-react';
import { ResponsiveContainer, PieChart as RChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend, } from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { useAuth } from '../hooks/useAuth';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const DashboardPatrimonio = () => {
    const { user } = useAuth();
    const { patrimonios, categorias, setores, usuarios, filtros, setFiltros, loading, error, patrimoniosFiltrados, kpis, refreshData, initializeData, // <- ADICIONAR
    initialized, // <- ADICIONAR
     } = useDashboard();
    // Estados locais para paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [buscaLocal, setBuscaLocal] = useState('');
    const itensPorPagina = 10;
    const CORES_GRAFICO = ['#3b82f6', '#22c55e', '#facc15', '#ef4444', '#a855f7'];
    // 2. ADICIONAR este useEffect ANTES do useEffect de busca:
    // Inicializa dados quando o componente monta (após login)
    useEffect(() => {
        if (user && !initialized) {
            initializeData();
        }
    }, [user, initialized, initializeData]);
    // Atualiza busca no contexto com debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setFiltros(Object.assign(Object.assign({}, filtros), { busca: buscaLocal }));
        }, 300);
        return () => clearTimeout(timer);
    }, [buscaLocal]);
    // Dados para gráficos
    const dadosGraficos = useMemo(() => {
        // Distribuição por Categoria
        const distribuicaoCategoria = categorias
            .map((cat) => {
            const patrimoniosCategoria = patrimoniosFiltrados.filter((p) => p.categoria_id === cat.id);
            const valor = patrimoniosCategoria.reduce((sum, p) => sum + p.valor_atual, 0);
            return {
                name: cat.nome,
                value: valor,
            };
        })
            .filter((item) => item.value > 0);
        // Distribuição por Setor
        const distribuicaoSetor = setores
            .map((setor) => {
            const patrimoniosSetor = patrimoniosFiltrados.filter((p) => p.setor_id === setor.id);
            return {
                name: setor.nome,
                value: patrimoniosSetor.length,
            };
        })
            .filter((item) => item.value > 0);
        // Depreciação por Categoria
        const depreciacaoCategoria = categorias
            .map((cat) => {
            const patrimoniosCategoria = patrimoniosFiltrados.filter((p) => p.categoria_id === cat.id);
            const depreciacao = patrimoniosCategoria.reduce((sum, p) => sum + (p.valor_aquisicao - p.valor_atual), 0);
            return {
                categoria: cat.nome,
                valor: depreciacao,
            };
        })
            .filter((item) => item.valor > 0);
        // Valor por Responsável
        const valorResponsavel = usuarios
            .map((user) => {
            const patrimoniosUser = patrimoniosFiltrados.filter((p) => p.responsavel_id === user.id);
            const valor = patrimoniosUser.reduce((sum, p) => sum + p.valor_atual, 0);
            return {
                responsavel: user.username,
                valor: valor,
            };
        })
            .filter((item) => item.valor > 0)
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 10); // Top 10 responsáveis
        return {
            distribuicaoCategoria,
            distribuicaoSetor,
            depreciacaoCategoria,
            valorResponsavel,
        };
    }, [patrimoniosFiltrados, categorias, setores, usuarios]);
    const isMobile = window.innerWidth < 768;
    // Paginação
    const dadosPaginados = useMemo(() => {
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        return patrimoniosFiltrados.slice(inicio, fim);
    }, [patrimoniosFiltrados, paginaAtual]);
    const totalPaginas = Math.ceil(patrimoniosFiltrados.length / itensPorPagina);
    const inicio = (paginaAtual - 1) * itensPorPagina + 1;
    const fim = Math.min(paginaAtual * itensPorPagina, patrimoniosFiltrados.length);
    // Páginas visíveis na navegação
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
    // Handlers
    const handleFiltroChange = useCallback((campo, valor) => {
        setFiltros(Object.assign(Object.assign({}, filtros), { [campo]: valor }));
        setPaginaAtual(1); // Reset página ao filtrar
    }, [filtros, setFiltros]);
    const handleExportarExcel = useCallback(() => {
        if (patrimoniosFiltrados.length === 0) {
            alert('Nenhum dado para exportar!');
            return;
        }
        // Monta os dados que vão pro Excel
        const dados = patrimoniosFiltrados.map((bem) => {
            var _a, _b, _c, _d;
            return ({
                Nome: bem.nome,
                Categoria: ((_a = categorias.find((c) => c.id === bem.categoria_id)) === null || _a === void 0 ? void 0 : _a.nome) || 'N/A',
                Responsavel: ((_b = usuarios.find((u) => u.id === bem.responsavel_id)) === null || _b === void 0 ? void 0 : _b.username) || 'N/A',
                Setor: ((_c = setores.find((s) => s.id === bem.setor_id)) === null || _c === void 0 ? void 0 : _c.nome) || 'N/A',
                'Data de Aquisição': bem.data_aquisicao
                    ? new Date(bem.data_aquisicao).toLocaleDateString('pt-BR')
                    : 'N/A',
                'Valor Atual (R$)': (_d = bem.valor_atual) === null || _d === void 0 ? void 0 : _d.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                }),
                'Depreciação (R$)': ((bem.valor_aquisicao || 0) - (bem.valor_atual || 0)).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                }),
                Situação: bem.status === 'ativo'
                    ? 'Ativo'
                    : bem.status === 'manutencao'
                        ? 'Manutenção'
                        : 'Baixado',
            });
        });
        // Cria o workbook e a planilha
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dados);
        XLSX.utils.book_append_sheet(wb, ws, 'Patrimonios');
        // Converte para blob e baixa
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, `Patrimonios_ControlHS_${new Date().toISOString().split('T')[0]}.xlsx`);
    }, [patrimoniosFiltrados, categorias, setores, usuarios]);
    // Função auxiliar para obter nome por ID
    const getNomeCategoria = (id) => { var _a; return ((_a = categorias.find((c) => c.id === id)) === null || _a === void 0 ? void 0 : _a.nome) || 'N/A'; };
    const getNomeSetor = (id) => { var _a; return ((_a = setores.find((s) => s.id === id)) === null || _a === void 0 ? void 0 : _a.nome) || 'N/A'; };
    const getNomeUsuario = (id) => { var _a; return ((_a = usuarios.find((u) => u.id === id)) === null || _a === void 0 ? void 0 : _a.username) || 'N/A'; };
    // Mapear status para exibição
    const getStatusDisplay = (status) => {
        const statusMap = {
            ativo: 'Ativo',
            manutencao: 'Manutenção',
            baixado: 'Baixado',
        };
        return statusMap[status] || status;
    };
    // Loading state
    if (loading) {
        return (_jsx("div", { className: "min-h-full bg-gray-100 dark:bg-[#121212] flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "Carregando dados do patrim\u00F4nio..." })] }) }));
    }
    // Error state
    if (error) {
        return (_jsx("div", { className: "min-h-full bg-gray-100 dark:bg-[#121212] flex items-center justify-center", children: _jsxs("div", { className: "text-center bg-white dark:bg-[#1e1e1e] rounded-xl p-8 shadow-lg max-w-md", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "Erro ao carregar dados" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 mb-4", children: error }), _jsx("button", { onClick: refreshData, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "Tentar Novamente" })] }) }));
    }
    return (_jsx("div", { className: "min-h-full bg-gray-100 dark:bg-[#121212] transition-colors", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md transition-colors", children: _jsxs("div", { className: "px-6 py-4", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-[#facc15] tracking-tight", children: "Patrim\u00F4nio - Dashboard" }), _jsxs("p", { className: "text-gray-600 dark:text-gray-300 mt-1", children: ["Bem-vindo, ", _jsx("span", { className: "font-semibold", children: user === null || user === void 0 ? void 0 : user.username }), ' ', "(", user === null || user === void 0 ? void 0 : user.role, ")"] }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 text-sm mt-2", children: "Visualize os indicadores e a situa\u00E7\u00E3o atual dos bens patrimoniais da empresa." })] }) }), _jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 mt-6 mb-6 transition-colors", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Filter, { className: "w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" }), _jsx("h2", { className: "text-lg font-semibold text-gray-800 dark:text-gray-100", children: "Filtros" })] }), _jsx("button", { onClick: refreshData, className: "px-2 py-1 text-sm font-medium rounded-lg\r\n                        text-white \r\n                        bg-blue-600 hover:bg-blue-700 \r\n                        dark:bg-blue-500 dark:hover:bg-blue-600\r\n                        shadow-sm hover:shadow-md\r\n                        transition-all duration-200", children: "Atualizar Dados" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Categoria" }), _jsxs("select", { value: filtros.categoria, onChange: (e) => handleFiltroChange('categoria', e.target.value), className: "w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a]\r\n                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600\r\n                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors", children: [_jsx("option", { value: "todas", children: "Todas" }), categorias.map((cat) => (_jsx("option", { value: cat.nome.toLowerCase(), children: cat.nome }, cat.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Setor" }), _jsxs("select", { value: filtros.setor, onChange: (e) => handleFiltroChange('setor', e.target.value), className: "w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a]\r\n                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600\r\n                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors", children: [_jsx("option", { value: "todos", children: "Todos" }), setores.map((setor) => (_jsx("option", { value: setor.nome.toLowerCase(), children: setor.nome }, setor.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Situa\u00E7\u00E3o" }), _jsxs("select", { value: filtros.situacao, onChange: (e) => handleFiltroChange('situacao', e.target.value), className: "w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a]\r\n                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600\r\n                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors", children: [_jsx("option", { value: "todas", children: "Todas" }), _jsx("option", { value: "ativos", children: "Ativos" }), _jsx("option", { value: "manutencao", children: "Manuten\u00E7\u00E3o" }), _jsx("option", { value: "baixados", children: "Baixados" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Respons\u00E1vel" }), _jsxs("select", { value: filtros.responsavel, onChange: (e) => handleFiltroChange('responsavel', e.target.value), className: "w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a]\r\n                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600\r\n                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors", children: [_jsx("option", { value: "todos", children: "Todos" }), usuarios.map((user) => (_jsx("option", { value: user.username.toLowerCase(), children: user.username }, user.id)))] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Aquisi\u00E7\u00E3o - In\u00EDcio" }), _jsx("input", { type: "date", value: filtros.dataInicio || '', onChange: (e) => handleFiltroChange('dataInicio', e.target.value), className: "w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a]\r\n                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600\r\n                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Aquisi\u00E7\u00E3o - Fim" }), _jsx("input", { type: "date", value: filtros.dataFim || '', onChange: (e) => handleFiltroChange('dataFim', e.target.value), className: "w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a]\r\n                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600\r\n                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Filtros Personalizados" }), _jsxs("select", { value: filtros.filtroPersonalizado, onChange: (e) => handleFiltroChange('filtroPersonalizado', e.target.value), className: "w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a]\r\n                          text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600\r\n                          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors", children: [_jsx("option", { value: "nenhum", children: "Nenhum" }), _jsx("option", { value: "antigos", children: "Bens acima de 5 anos" }), _jsx("option", { value: "depreciados", children: "Totalmente depreciados" }), _jsx("option", { value: "em_alta", children: "Com alto valor residual" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Total de Itens" }), _jsx("p", { className: "text-3xl font-semibold text-blue-500 dark:text-blue-300 mt-2 tracking-tight", children: kpis.totalItens.toLocaleString('pt-BR') })] }), _jsx("div", { className: "bg-blue-100/70 dark:bg-blue-900/50 p-3 rounded-full", children: _jsx(Home, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }) })] }) }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Valor Total" }), _jsx("p", { className: "text-2xl font-bold text-green-600 dark:text-green-400 mt-2", children: kpis.valorTotal.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }) })] }), _jsx("div", { className: "bg-green-100 dark:bg-green-900/40 p-3 rounded-full", children: _jsx(DollarSign, { className: "w-6 h-6 text-green-600 dark:text-green-400" }) })] }) }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Deprecia\u00E7\u00E3o Acumulada" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2", children: kpis.depreciacaoAcumulada.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }) })] }), _jsx("div", { className: "bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-full", children: _jsx(Activity, { className: "w-6 h-6 text-yellow-600 dark:text-yellow-400" }) })] }) }), _jsx("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700 dark:text-gray-400", children: "Bens Ativos" }), _jsx("p", { className: "text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2", children: kpis.ativos.toLocaleString('pt-BR') }), _jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [kpis.manutencao > 0 && `${kpis.manutencao} Manutenção`, kpis.baixados > 0 && ` | ${kpis.baixados} baixados`] })] }), _jsx("div", { className: "bg-purple-100 dark:bg-purple-900/40 p-3 rounded-full", children: _jsx(PieChart, { className: "w-6 h-6 text-purple-600 dark:text-purple-400" }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [_jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4", children: "Distribui\u00E7\u00E3o de Valor por Categoria" }), dadosGraficos.distribuicaoCategoria.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(RChart, { children: [_jsx(Pie, { data: dadosGraficos.distribuicaoCategoria, cx: "50%", cy: "50%", outerRadius: 80, dataKey: "value", label: ({ name, value }) => value ? `${name}: ${(value / 1000).toFixed(0)}k` : name, children: dadosGraficos.distribuicaoCategoria.map((entry, index) => (_jsx(Cell, { fill: CORES_GRAFICO[index % CORES_GRAFICO.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => value.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }) }), _jsx(Legend, { verticalAlign: "bottom", align: "center", wrapperStyle: {
                                                    marginTop: 10,
                                                    fontSize: '12px', // fonte um pouco menor para não pesar
                                                } })] }) })) : (_jsx("div", { className: "h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400", children: "Sem dados para exibir" }))] }), _jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4", children: "Distribui\u00E7\u00E3o por Setor" }), dadosGraficos.distribuicaoSetor.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(RChart, { children: [_jsx(Pie, { data: dadosGraficos.distribuicaoSetor, cx: "50%", cy: "50%", outerRadius: 80, dataKey: "value", label: ({ name, value }) => {
                                                    if (typeof value === 'number') {
                                                        return `${name}: ${value}`;
                                                    }
                                                    return name;
                                                }, children: dadosGraficos.distribuicaoSetor.map((_, index) => (_jsx(Cell, { fill: CORES_GRAFICO[index % CORES_GRAFICO.length] }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => typeof value === 'number'
                                                    ? value.toLocaleString('pt-BR')
                                                    : value }), _jsx(Legend, { verticalAlign: "bottom", align: "center", wrapperStyle: {
                                                    marginTop: 10,
                                                    fontSize: '12px',
                                                } })] }) })) : (_jsx("div", { className: "h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400", children: "Sem dados para exibir" }))] }), _jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4", children: "Deprecia\u00E7\u00E3o por Categoria" }), dadosGraficos.depreciacaoCategoria.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: dadosGraficos.depreciacaoCategoria, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#475569" }), _jsx(XAxis, { type: "number", tickFormatter: (value) => `${(value / 1000).toFixed(0)}k` }), _jsx(YAxis, { dataKey: "categoria", type: "category", width: 120 }), _jsx(Bar, { dataKey: "valor", fill: "#f59e0b" }), _jsx(Tooltip, { formatter: (value) => value.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }), contentStyle: {
                                                    backgroundColor: '#f9fafb',
                                                    color: '#000',
                                                    borderRadius: '8px',
                                                    border: '1px solid #d1d5db',
                                                }, itemStyle: { color: '#000' }, labelStyle: { color: '#f59e0b', fontWeight: 600 } })] }) })) : (_jsx("div", { className: "h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400", children: "Sem dados para exibir" }))] }), _jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4", children: "Top 10 - Valor por Respons\u00E1vel" }), dadosGraficos.valorResponsavel.length > 0 ? (_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: dadosGraficos.valorResponsavel, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#475569" }), _jsx(XAxis, { type: "number", tickFormatter: (value) => `${(value / 1000).toFixed(0)}k` }), _jsx(YAxis, { dataKey: "responsavel", type: "category", width: 100 }), _jsx(Bar, { dataKey: "valor", fill: "#2563eb" }), _jsx(Tooltip, { formatter: (value) => value.toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                }), contentStyle: {
                                                    backgroundColor: '#f9fafb',
                                                    color: '#000',
                                                    borderRadius: '8px',
                                                    border: '1px solid #d1d5db',
                                                }, itemStyle: { color: '#000' }, labelStyle: { color: '#2563eb', fontWeight: 600 } })] }) })) : (_jsx("div", { className: "h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400", children: "Sem dados para exibir" }))] })] }), _jsxs("div", { className: "bg-white/95 dark:bg-[#1e1e1e]/95 border border-gray-200 dark:border-[#2d2d2d] rounded-xl shadow-md p-6 transition-colors", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 md:mb-0", children: "Bens Patrimoniais" }), _jsxs("div", { className: "flex flex-col md:flex-row gap-2 w-full md:w-auto", children: [_jsxs("div", { className: "relative flex-1 md:flex-initial", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Pesquisar bem...", value: buscaLocal, onChange: (e) => setBuscaLocal(e.target.value), className: "pl-10 pr-3 py-2 w-full md:w-64 rounded-lg border \r\n                            focus:outline-none focus:ring-2 focus:ring-blue-500\r\n                            bg-white dark:bg-[#2a2a2a]\r\n                            text-gray-800 dark:text-gray-200\r\n                            border-gray-300 dark:border-gray-600\r\n                            placeholder-gray-400 dark:placeholder-gray-500\r\n                            transition-colors" })] }), _jsxs("button", { onClick: handleExportarExcel, className: "flex items-center justify-center gap-2 px-4 py-2 \r\n                          bg-gradient-to-r from-green-500 to-emerald-600 \r\n                          text-white font-medium rounded-lg shadow-md\r\n                          hover:from-green-400 hover:to-emerald-500 \r\n                          dark:hover:from-green-600 dark:hover:to-green-500\r\n                          transition-all duration-300", children: [_jsx(Download, { className: "w-4 h-4" }), "Exportar Excel"] })] })] }), patrimoniosFiltrados.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-300 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#181818]", children: [_jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Nome" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Categoria" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Respons\u00E1vel" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Localiza\u00E7\u00E3o" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Data de Aquisi\u00E7\u00E3o" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Valor Atual" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Deprecia\u00E7\u00E3o" }), _jsx("th", { className: "px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-200", children: "Situa\u00E7\u00E3o" })] }) }), _jsx("tbody", { children: dadosPaginados.map((bem, index) => {
                                                    const depreciacao = (bem.valor_aquisicao || 0) - (bem.valor_atual || 0);
                                                    return (_jsxs("tr", { className: `border-b border-gray-100 dark:border-gray-700 
                                    hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors
                                    ${index % 2 === 0 ? 'bg-white dark:bg-[#1b1b1b]' : 'bg-gray-50 dark:bg-[#222222]'}`, children: [_jsxs("td", { className: "px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100", children: [bem.nome, bem.numero_serie && (_jsxs("span", { className: "block text-xs text-gray-500 dark:text-gray-400", children: ["SN: ", bem.numero_serie] }))] }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: getNomeCategoria(bem.categoria_id) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: getNomeUsuario(bem.responsavel_id) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: getNomeSetor(bem.setor_id) }), _jsx("td", { className: "px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300", children: bem.data_aquisicao
                                                                    ? new Date(bem.data_aquisicao).toLocaleDateString('pt-BR')
                                                                    : 'N/A' }), _jsx("td", { className: "px-4 py-3 text-sm text-center font-semibold text-blue-600 dark:text-blue-400", children: (bem.valor_atual || 0).toLocaleString('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL',
                                                                }) }), _jsx("td", { className: "px-4 py-3 text-sm text-center font-semibold text-yellow-600 dark:text-yellow-400", children: ((bem.valor_aquisicao || 0) -
                                                                    (bem.valor_atual || 0)).toLocaleString('pt-BR', {
                                                                    style: 'currency',
                                                                    currency: 'BRL',
                                                                }) }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full
                                ${bem.status === 'ativo'
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                                                                        : bem.status === 'manutencao'
                                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'}`, children: getStatusDisplay(bem.status) }) })] }, bem.id));
                                                }) })] }) }), totalPaginas > 1 && (_jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "hidden md:flex justify-between items-center text-sm text-gray-600 dark:text-gray-300", children: [_jsxs("div", { children: ["Mostrando ", inicio, " a ", fim, " de", ' ', patrimoniosFiltrados.length, " registros"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setPaginaAtual((prev) => Math.max(1, prev - 1)), disabled: paginaAtual === 1, className: "px-3 py-1 border rounded-lg\r\n                                  bg-white dark:bg-[#1f1f1f]\r\n                                  border-gray-300 dark:border-gray-600\r\n                                  text-gray-700 dark:text-gray-300\r\n                                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a]\r\n                                  disabled:opacity-50 disabled:cursor-not-allowed\r\n                                  transition-colors", children: "Anterior" }), _jsx("div", { className: "flex gap-1", children: paginasVisiveis.map((page) => (_jsx("button", { onClick: () => setPaginaAtual(page), className: `px-3 py-1 border rounded-lg transition-colors
                              ${paginaAtual === page
                                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                                    : 'bg-white dark:bg-[#1f1f1f] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}`, children: page }, page))) }), _jsx("button", { onClick: () => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1)), disabled: paginaAtual === totalPaginas, className: "px-3 py-1 border rounded-lg\r\n                                  bg-white dark:bg-[#1f1f1f]\r\n                                  border-gray-300 dark:border-gray-600\r\n                                  text-gray-700 dark:text-gray-300\r\n                                  hover:bg-gray-50 dark:hover:bg-[#2a2a2a]\r\n                                  disabled:opacity-50 disabled:cursor-not-allowed\r\n                                  transition-colors", children: "Pr\u00F3ximo" })] })] }), _jsxs("div", { className: "flex flex-col md:hidden items-center mt-3 text-sm text-gray-600 dark:text-gray-300", children: [_jsxs("div", { className: "mb-2", children: ["Mostrando ", inicio, " a ", fim, " de", ' ', patrimoniosFiltrados.length, " registros"] }), _jsxs("div", { className: "flex justify-center gap-2 items-center", children: [_jsx("button", { onClick: () => setPaginaAtual((prev) => Math.max(1, prev - 1)), disabled: paginaAtual === 1, className: "px-3 py-1 border rounded-lg\r\n                                bg-white dark:bg-[#1f1f1f]\r\n                                border-gray-300 dark:border-gray-600\r\n                                text-gray-700 dark:text-gray-300\r\n                                hover:bg-gray-50 dark:hover:bg-[#2a2a2a]\r\n                                disabled:opacity-50 disabled:cursor-not-allowed\r\n                                transition-colors", children: '<' }), _jsx("span", { className: "px-3 py-1 border rounded-lg\r\n                                    bg-white dark:bg-[#1f1f1f]\r\n                                    text-gray-700 dark:text-gray-300\r\n                                    border-gray-300 dark:border-gray-600", children: paginaAtual }), _jsx("button", { onClick: () => setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1)), disabled: paginaAtual === totalPaginas, className: "px-3 py-1 border rounded-lg\r\n                                bg-white dark:bg-[#1f1f1f]\r\n                                border-gray-300 dark:border-gray-600\r\n                                text-gray-700 dark:text-gray-300\r\n                                hover:bg-gray-50 dark:hover:bg-[#2a2a2a]\r\n                                disabled:opacity-50 disabled:cursor-not-allowed\r\n                                transition-colors", children: '>' })] })] })] }))] })) : (_jsxs("div", { className: "py-12 text-center", children: [_jsx("p", { className: "text-gray-500 dark:text-gray-400 text-lg", children: "Nenhum bem encontrado com os filtros selecionados" }), _jsx("button", { onClick: () => {
                                        setFiltros({
                                            categoria: 'todas',
                                            setor: 'todos',
                                            situacao: 'todas',
                                            responsavel: 'todos',
                                            dataInicio: undefined,
                                            dataFim: undefined,
                                            filtroPersonalizado: 'nenhum',
                                            busca: '',
                                        });
                                        setBuscaLocal('');
                                    }, className: "mt-2 px-2 py-1 text-sm font-medium rounded-lg\r\n                          text-white \r\n                          bg-blue-600 hover:bg-blue-700 \r\n                          dark:bg-blue-500 dark:hover:bg-blue-600\r\n                          shadow-sm hover:shadow-md\r\n                          transition-all duration-200", children: "Limpar filtros" })] }))] })] }) }));
};
export default DashboardPatrimonio;

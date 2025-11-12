import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useMemo, } from 'react';
import { listPatrimonios, listCategorias, listSetores, listUsuarios, } from '../services/controlapi';
const DashboardContext = createContext(undefined);
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos
export const DashboardProvider = ({ children, }) => {
    // Estados principais
    const [patrimonios, setPatrimonios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [setores, setSetores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(0);
    const [initialized, setInitialized] = useState(false);
    // Filtros
    const [filtros, setFiltros] = useState({
        categoria: 'todas',
        setor: 'todos',
        situacao: 'todas',
        responsavel: 'todos',
        dataInicio: undefined,
        dataFim: undefined,
        filtroPersonalizado: 'nenhum',
        busca: '',
    });
    // Função para buscar dados da API
    const fetchData = useCallback(async (forceRefresh = false) => {
        // Verifica se precisa atualizar (cache expirado ou forceRefresh)
        const now = Date.now();
        if (!forceRefresh && lastFetch && now - lastFetch < CACHE_EXPIRY_TIME) {
            return; // Usa cache existente
        }
        setLoading(true);
        setError(null);
        try {
            // Busca dados em paralelo para melhor performance
            const [patrimoniosData, categoriasData, setoresData, usuariosData] = await Promise.all([
                listPatrimonios(),
                listCategorias(),
                listSetores(),
                listUsuarios(),
            ]);
            setPatrimonios(patrimoniosData || []);
            setCategorias(categoriasData || []);
            setSetores(setoresData || []);
            setUsuarios(usuariosData || []);
            setLastFetch(now);
            setInitialized(true);
        }
        catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Não foi possível carregar os dados do patrimônio. Verifique sua conexão.');
        }
        finally {
            setLoading(false);
        }
    }, [lastFetch]);
    // Função para inicializar dados (chamada manualmente pelo componente)
    const initializeData = useCallback(async () => {
        if (!initialized) {
            await fetchData(true);
        }
    }, [initialized, fetchData]);
    // REMOVIDO: useEffect que carregava dados automaticamente
    // Agora os dados só são carregados quando initializeData() é chamado
    // Filtra patrimônios baseado nos filtros ativos
    const patrimoniosFiltrados = useMemo(() => {
        var _a, _b, _c;
        let filtrados = [...patrimonios];
        // Filtro por categoria
        if (filtros.categoria !== 'todas') {
            const categoriaId = (_a = categorias.find((c) => c.nome.toLowerCase() === filtros.categoria.toLowerCase())) === null || _a === void 0 ? void 0 : _a.id;
            if (categoriaId) {
                filtrados = filtrados.filter((p) => p.categoria_id === categoriaId);
            }
        }
        // Filtro por setor
        if (filtros.setor !== 'todos') {
            const setorId = (_b = setores.find((s) => s.nome.toLowerCase() === filtros.setor.toLowerCase())) === null || _b === void 0 ? void 0 : _b.id;
            if (setorId) {
                filtrados = filtrados.filter((p) => p.setor_id === setorId);
            }
        }
        // Filtro por situação/status
        if (filtros.situacao !== 'todas') {
            const statusMap = {
                ativos: 'ativo',
                manutencao: 'manutencao',
                'em manutenção': 'manutencao',
                baixados: 'baixado',
            };
            const status = statusMap[filtros.situacao.toLowerCase()];
            if (status) {
                filtrados = filtrados.filter((p) => p.status === status);
            }
        }
        // Filtro por responsável
        if (filtros.responsavel !== 'todos') {
            const usuarioId = (_c = usuarios.find((u) => u.username.toLowerCase() === filtros.responsavel.toLowerCase())) === null || _c === void 0 ? void 0 : _c.id;
            if (usuarioId) {
                filtrados = filtrados.filter((p) => p.responsavel_id === usuarioId);
            }
        }
        // Filtro por período de aquisição
        if (filtros.dataInicio) {
            filtrados = filtrados.filter((p) => new Date(p.data_aquisicao) >= new Date(filtros.dataInicio));
        }
        if (filtros.dataFim) {
            filtrados = filtrados.filter((p) => new Date(p.data_aquisicao) <= new Date(filtros.dataFim));
        }
        // Filtros personalizados
        if (filtros.filtroPersonalizado !== 'nenhum') {
            const hoje = new Date();
            const cincoAnosAtras = new Date();
            cincoAnosAtras.setFullYear(hoje.getFullYear() - 5);
            switch (filtros.filtroPersonalizado) {
                case 'antigos':
                    filtrados = filtrados.filter((p) => new Date(p.data_aquisicao) <= cincoAnosAtras);
                    break;
                case 'depreciados':
                    filtrados = filtrados.filter((p) => p.valor_atual <= p.valor_aquisicao * 0.1);
                    break;
                case 'em_alta':
                    filtrados = filtrados.filter((p) => p.valor_atual >= p.valor_aquisicao * 0.7);
                    break;
            }
        }
        // Busca por texto
        if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            filtrados = filtrados.filter((p) => {
                var _a, _b;
                return p.nome.toLowerCase().includes(busca) ||
                    ((_a = p.descricao) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(busca)) ||
                    ((_b = p.numero_serie) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(busca));
            });
        }
        return filtrados;
    }, [patrimonios, categorias, setores, usuarios, filtros]);
    // Calcula KPIs baseado nos patrimônios filtrados
    const kpis = useMemo(() => {
        const totalItens = patrimoniosFiltrados.length;
        const valorTotal = patrimoniosFiltrados.reduce((sum, p) => sum + (p.valor_atual || 0), 0);
        const depreciacaoAcumulada = patrimoniosFiltrados.reduce((sum, p) => sum + ((p.valor_aquisicao || 0) - (p.valor_atual || 0)), 0);
        const ativos = patrimoniosFiltrados.filter((p) => p.status === 'ativo').length;
        const manutencao = patrimoniosFiltrados.filter((p) => p.status === 'manutencao').length;
        const baixados = patrimoniosFiltrados.filter((p) => p.status === 'baixado').length;
        return {
            totalItens,
            valorTotal,
            depreciacaoAcumulada,
            ativos,
            manutencao,
            baixados,
        };
    }, [patrimoniosFiltrados]);
    const contextValue = {
        patrimonios,
        categorias,
        setores,
        usuarios,
        filtros,
        setFiltros,
        loading,
        error,
        initialized,
        patrimoniosFiltrados,
        refreshData: () => fetchData(true),
        initializeData,
        kpis,
    };
    return (_jsx(DashboardContext.Provider, { value: contextValue, children: children }));
};
// Hook customizado para usar o contexto
export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard deve ser usado dentro de DashboardProvider');
    }
    return context;
};

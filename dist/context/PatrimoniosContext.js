import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, } from 'react';
import { listPatrimonios, createPatrimonio as apiCreatePatrimonio, updatePatrimonio as apiUpdatePatrimonio, deletePatrimonio as apiDeletePatrimonio, listCategorias, listSetores, listUsuarios, } from '../services/controlapi';
// ========================================
// CONTEXT & PROVIDER
// ========================================
const PatrimoniosContext = createContext(undefined);
// Cache configuration
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos
// 🆕 Função auxiliar para obter role do usuário do localStorage
const getUserRoleFromStorage = () => {
    var _a;
    return ((_a = localStorage.getItem('role')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
};
// 🆕 Função auxiliar para obter ID do usuário do localStorage
const getUserIdFromStorage = () => {
    return localStorage.getItem('id');
};
export const PatrimoniosProvider = ({ children, }) => {
    // ========================================
    // ESTADOS PRINCIPAIS
    // ========================================
    const [patrimonios, setPatrimonios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [setores, setSetores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(0);
    // ========================================
    // FILTROS E ORDENAÇÃO - 🆕 INICIALIZAÇÃO INTELIGENTE
    // ========================================
    // 🔥 SOLUÇÃO: Inicializa filtros ANTES do carregamento
    const getInitialFilters = () => {
        const userRole = getUserRoleFromStorage();
        const userId = getUserIdFromStorage();
        // 🎯 NOVA LÓGICA DE FILTROS POR ROLE
        // Administrador e Gerente: veem tudo
        if (['administrador', 'gerente'].includes(userRole)) {
            return {
                busca: '',
                categoria: 'todas',
                setor: 'todos',
                status: 'todos',
                responsavel: 'todos',
                dataInicio: undefined,
                dataFim: undefined,
            };
        }
        // Gestor: vê apenas do setor dele (precisa buscar o setor do usuário)
        if (userRole === 'gestor') {
            const setorId = localStorage.getItem('setor_id'); // 🆕 Precisa salvar no login!
            return {
                busca: '',
                categoria: 'todas',
                setor: setorId || 'todos', // 🎯 Filtra por setor
                status: 'todos',
                responsavel: 'todos',
                dataInicio: undefined,
                dataFim: undefined,
            };
        }
        // Usuario comum: vê apenas os patrimônios dele
        if (userId) {
            return {
                busca: '',
                categoria: 'todas',
                setor: 'todos',
                status: 'todos',
                responsavel: userId, // 🎯 Filtra por responsável
                dataInicio: undefined,
                dataFim: undefined,
            };
        }
        // Fallback: sem filtro
        return {
            busca: '',
            categoria: 'todas',
            setor: 'todos',
            status: 'todos',
            responsavel: 'todos',
            dataInicio: undefined,
            dataFim: undefined,
        };
    };
    const [filtros, setFiltros] = useState(getInitialFilters());
    const [ordenacao, setOrdenacao] = useState({
        campo: 'id',
        direcao: 'asc',
    });
    // ========================================
    // FETCH DE DADOS
    // ========================================
    const fetchData = useCallback(async (forceRefresh = false) => {
        var _a, _b;
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
        }
        catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) ||
                'Não foi possível carregar os dados. Verifique sua conexão.');
        }
        finally {
            setLoading(false);
        }
    }, [lastFetch]);
    // Carrega dados iniciais
    useEffect(() => {
        fetchData();
    }, []);
    // ========================================
    // FUNÇÕES CRUD
    // ========================================
    const createPatrimonio = useCallback(async (data) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            const novoPatrimonio = await apiCreatePatrimonio(data);
            setPatrimonios((prev) => [...prev, novoPatrimonio]);
            console.log('Patrimônio criado com sucesso!');
        }
        catch (err) {
            console.error('Erro ao criar patrimônio:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao criar patrimônio');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const updatePatrimonio = useCallback(async (id, data) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            const patrimonioAtualizado = await apiUpdatePatrimonio(id, data);
            setPatrimonios((prev) => prev.map((p) => (p.id === id ? patrimonioAtualizado : p)));
            console.log('Patrimônio atualizado com sucesso!');
        }
        catch (err) {
            console.error('Erro ao atualizar patrimônio:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao atualizar patrimônio');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const deletePatrimonio = useCallback(async (id) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            await apiDeletePatrimonio(id);
            setPatrimonios((prev) => prev.filter((p) => p.id !== id));
            console.log('Patrimônio excluído com sucesso!');
        }
        catch (err) {
            console.error('Erro ao excluir patrimônio:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao excluir patrimônio');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    // ========================================
    // FILTRAGEM E ORDENAÇÃO
    // ========================================
    const patrimoniosFiltrados = useMemo(() => {
        let filtrados = [...patrimonios];
        // Filtro de busca geral (nome, descrição, número de série)
        if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            filtrados = filtrados.filter((p) => {
                var _a, _b;
                return p.nome.toLowerCase().includes(busca) ||
                    ((_a = p.descricao) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(busca)) ||
                    ((_b = p.numero_serie) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(busca));
            });
        }
        // Filtro por categoria
        if (filtros.categoria !== 'todas') {
            const categoriaId = parseInt(filtros.categoria);
            if (!isNaN(categoriaId)) {
                filtrados = filtrados.filter((p) => p.categoria_id === categoriaId);
            }
        }
        // Filtro por setor
        if (filtros.setor !== 'todos') {
            const setorId = parseInt(filtros.setor);
            if (!isNaN(setorId)) {
                filtrados = filtrados.filter((p) => p.setor_id === setorId);
            }
        }
        // Filtro por status
        if (filtros.status !== 'todos') {
            filtrados = filtrados.filter((p) => p.status === filtros.status);
        }
        // Filtro por responsável
        if (filtros.responsavel !== 'todos') {
            const responsavelId = parseInt(filtros.responsavel);
            if (!isNaN(responsavelId)) {
                filtrados = filtrados.filter((p) => p.responsavel_id === responsavelId);
            }
        }
        // Filtro por período de aquisição
        if (filtros.dataInicio) {
            filtrados = filtrados.filter((p) => {
                if (!p.data_aquisicao)
                    return false;
                return new Date(p.data_aquisicao) >= new Date(filtros.dataInicio);
            });
        }
        if (filtros.dataFim) {
            filtrados = filtrados.filter((p) => {
                if (!p.data_aquisicao)
                    return false;
                return new Date(p.data_aquisicao) <= new Date(filtros.dataFim);
            });
        }
        // Aplicar ordenação
        filtrados.sort((a, b) => {
            var _a, _b, _c, _d, _e, _f;
            let aVal;
            let bVal;
            // Determinar valores para comparação baseado no campo
            switch (ordenacao.campo) {
                case 'categoria_nome':
                    aVal = ((_a = categorias.find((c) => c.id === a.categoria_id)) === null || _a === void 0 ? void 0 : _a.nome) || '';
                    bVal = ((_b = categorias.find((c) => c.id === b.categoria_id)) === null || _b === void 0 ? void 0 : _b.nome) || '';
                    break;
                case 'setor_nome':
                    aVal = ((_c = setores.find((s) => s.id === a.setor_id)) === null || _c === void 0 ? void 0 : _c.nome) || '';
                    bVal = ((_d = setores.find((s) => s.id === b.setor_id)) === null || _d === void 0 ? void 0 : _d.nome) || '';
                    break;
                case 'responsavel_nome':
                    aVal =
                        ((_e = usuarios.find((u) => u.id === a.responsavel_id)) === null || _e === void 0 ? void 0 : _e.username) || '';
                    bVal =
                        ((_f = usuarios.find((u) => u.id === b.responsavel_id)) === null || _f === void 0 ? void 0 : _f.username) || '';
                    break;
                default:
                    aVal = a[ordenacao.campo];
                    bVal = b[ordenacao.campo];
            }
            // Tratar valores nulos/undefined
            if (aVal == null)
                aVal = '';
            if (bVal == null)
                bVal = '';
            // Comparação
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return ordenacao.direcao === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            if (ordenacao.direcao === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            }
            else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
        return filtrados;
    }, [patrimonios, categorias, setores, usuarios, filtros, ordenacao]);
    // ========================================
    // CONTEXT VALUE
    // ========================================
    const contextValue = {
        // Dados
        patrimonios,
        categorias,
        setores,
        usuarios,
        // Filtros e Ordenação
        filtros,
        setFiltros,
        ordenacao,
        setOrdenacao,
        // Estados
        loading,
        error,
        // Dados computados
        patrimoniosFiltrados,
        // Funções
        createPatrimonio,
        updatePatrimonio,
        deletePatrimonio,
        refreshData: () => fetchData(true),
    };
    return (_jsx(PatrimoniosContext.Provider, { value: contextValue, children: children }));
};
// ========================================
// HOOK CUSTOMIZADO
// ========================================
export const usePatrimonios = () => {
    const context = useContext(PatrimoniosContext);
    if (!context) {
        throw new Error('usePatrimonios deve ser usado dentro de PatrimoniosProvider');
    }
    return context;
};

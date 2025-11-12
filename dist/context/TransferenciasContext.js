import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, } from 'react';
import { listTransferencias, createTransferencia as apiCreateTransferencia, deleteTransferencia as apiDeleteTransferencia, listPatrimonios, listCategorias, listSetores, listUsuarios, createLog, 
// 🆕 NOVOS IMPORTS
aprovarTransferencia as apiAprovarTransferencia, rejeitarTransferencia as apiRejeitarTransferencia, efetivarTransferencia as apiEfetivarTransferencia, } from '../services/controlapi';
// ========================================
// CONTEXT & PROVIDER
// ========================================
const TransferenciasContext = createContext(undefined);
// Cache configuration
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos
// 🆕 Funções auxiliares para obter dados do localStorage
const getUserRoleFromStorage = () => {
    var _a;
    return ((_a = localStorage.getItem('role')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
};
const getUserIdFromStorage = () => {
    return localStorage.getItem('id');
};
// 🆕 Inicializa filtros com base no usuário
const getInitialFilters = () => {
    const userRole = getUserRoleFromStorage();
    const userId = getUserIdFromStorage();
    // 🎯 NOVA LÓGICA DE FILTROS POR ROLE
    // Administrador e Gerente: veem tudo
    if (['administrador', 'gerente'].includes(userRole)) {
        return {
            busca: '',
            status: 'todos',
            setor: 'todos',
            responsavel: 'todos',
            patrimonio: 'todos',
            solicitante: 'todos',
            aprovador: 'todos',
            dataInicio: undefined,
            dataFim: undefined,
        };
    }
    // Gestor: vê apenas transferências do setor dele
    if (userRole === 'gestor') {
        const setorId = localStorage.getItem('setor_id');
        return {
            busca: '',
            status: 'todos',
            setor: setorId || 'todos', // 🎯 Filtra por setor (origem OU destino)
            responsavel: 'todos',
            patrimonio: 'todos',
            solicitante: 'todos',
            aprovador: 'todos',
            dataInicio: undefined,
            dataFim: undefined,
        };
    }
    // Usuario comum: vê apenas transferências onde ele é responsável
    if (userId) {
        return {
            busca: '',
            status: 'todos',
            setor: 'todos',
            responsavel: userId, // 🎯 Filtra por responsável (origem OU destino)
            patrimonio: 'todos',
            solicitante: 'todos',
            aprovador: 'todos',
            dataInicio: undefined,
            dataFim: undefined,
        };
    }
    // Fallback: sem filtro
    return {
        busca: '',
        status: 'todos',
        setor: 'todos',
        responsavel: 'todos',
        patrimonio: 'todos',
        solicitante: 'todos',
        aprovador: 'todos',
        dataInicio: undefined,
        dataFim: undefined,
    };
};
export const TransferenciasProvider = ({ children }) => {
    // ========================================
    // ESTADOS PRINCIPAIS
    // ========================================
    const [transferencias, setTransferencias] = useState([]);
    const [patrimonios, setPatrimonios] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [setores, setSetores] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(0);
    // ========================================
    // FILTROS E ORDENAÇÃO
    // ========================================
    // 🆕 Filtros inicializados de forma inteligente
    const [filtros, setFiltros] = useState(getInitialFilters());
    const [ordenacao, setOrdenacao] = useState({
        campo: 'id',
        direcao: 'desc',
    });
    // ========================================
    // INFORMAÇÕES DO USUÁRIO LOGADO
    // ========================================
    const getUserInfo = useCallback(() => {
        var _a;
        const userId = parseInt(localStorage.getItem('id') || '0');
        const role = ((_a = localStorage.getItem('role')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        const username = localStorage.getItem('username') || '';
        // Busca o usuário completo para pegar o setor_id
        const user = usuarios.find((u) => u.id === userId);
        return {
            id: userId,
            username,
            role,
            setor_id: user === null || user === void 0 ? void 0 : user.setor_id,
        };
    }, [usuarios]);
    // ========================================
    // 🆕 CÁLCULO DE STATUS (NOVA LÓGICA)
    // ========================================
    const getTransferenciaStatus = useCallback((transferencia) => {
        // ✅ Nova lógica baseada em campos fixos
        // NÃO compara mais com patrimônio atual
        // 1. Rejeitada tem prioridade
        if (transferencia.motivo_rejeicao) {
            return 'rejeitada';
        }
        // 2. Se foi efetivada, está concluída
        if (transferencia.efetivada) {
            return 'concluida';
        }
        // 3. Se tem aprovador, está aprovada
        if (transferencia.aprovado_por) {
            return 'aprovada';
        }
        // 4. Caso contrário, pendente
        return 'pendente';
    }, [] // 🆕 SEM DEPENDÊNCIAS! Não usa mais patrimonios
    );
    // ========================================
    // VERIFICAÇÕES DE PERMISSÃO
    // ========================================
    const podeAprovar = useCallback((transferencia) => {
        const { role, setor_id } = getUserInfo();
        if (role === 'administrador')
            return true;
        if (role === 'gestor') {
            // Gestor só aprova se for do setor origem ou destino
            return (setor_id === transferencia.setor_origem_id ||
                setor_id === transferencia.setor_destino_id);
        }
        return false;
    }, [getUserInfo]);
    const podeEfetivar = useCallback((transferencia) => {
        const { role } = getUserInfo();
        const status = getTransferenciaStatus(transferencia);
        // Só pode efetivar se estiver aprovada (não concluída)
        if (status !== 'aprovada')
            return false;
        return ['administrador', 'gestor'].includes(role);
    }, [getUserInfo, getTransferenciaStatus]);
    const verificarTransferenciaPendente = useCallback((patrimonio_id) => {
        return transferencias.some((t) => {
            const status = getTransferenciaStatus(t);
            return t.patrimonio_id === patrimonio_id && status === 'pendente';
        });
    }, [transferencias, getTransferenciaStatus]);
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
            const [transferenciasData, patrimoniosData, categoriasData, setoresData, usuariosData,] = await Promise.all([
                listTransferencias(),
                listPatrimonios(),
                listCategorias(),
                listSetores(),
                listUsuarios(),
            ]);
            setTransferencias(transferenciasData || []);
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
    // FUNÇÕES CRUD BÁSICAS
    // ========================================
    const createTransferencia = useCallback(async (data) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            // 🆕 solicitante_id é preenchido automaticamente pela API agora
            // Não precisa mais adicionar aqui
            const novaTransferencia = await apiCreateTransferencia(data);
            setTransferencias((prev) => [...prev, novaTransferencia]);
            // Log de auditoria
            await createLog({
                acao: 'criar_transferencia',
                entidade: 'transferencia',
                entidade_id: novaTransferencia.id,
                detalhes: { patrimonio_id: data.patrimonio_id, motivo: data.motivo },
            });
            console.log('Transferência solicitada com sucesso!');
        }
        catch (err) {
            console.error('Erro ao criar transferência:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao solicitar transferência');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const updateTransferencia = useCallback(async (id, data) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            // ⚠️ Este método não é mais recomendado
            // Use aprovarTransferencia, rejeitarTransferencia ou efetivarTransferencia
            console.warn('updateTransferencia está deprecated. Use os métodos específicos.');
            console.log('Transferência atualizada com sucesso!');
        }
        catch (err) {
            console.error('Erro ao atualizar transferência:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao atualizar transferência');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const deleteTransferencia = useCallback(async (id) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            await apiDeleteTransferencia(id);
            setTransferencias((prev) => prev.filter((t) => t.id !== id));
            // Log de auditoria
            await createLog({
                acao: 'excluir_transferencia',
                entidade: 'transferencia',
                entidade_id: id,
                detalhes: {},
            });
            console.log('Transferência excluída com sucesso!');
        }
        catch (err) {
            console.error('Erro ao excluir transferência:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao excluir transferência');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    // ========================================
    // 🆕 FUNÇÕES ESPECIAIS DE APROVAÇÃO (REESCRITAS)
    // ========================================
    const aprovarTransferencia = useCallback(async (id, observacoes, efetivarAutomaticamente = false) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            // 🆕 Usa novo endpoint
            const transferenciaAtualizada = await apiAprovarTransferencia(id, {
                observacoes,
                efetivar_automaticamente: efetivarAutomaticamente,
            });
            // Atualiza estado local
            setTransferencias((prev) => prev.map((t) => (t.id === id ? transferenciaAtualizada : t)));
            // 🆕 Se efetivou, recarrega patrimônios
            if (efetivarAutomaticamente) {
                const patrimoniosAtualizados = await listPatrimonios();
                setPatrimonios(patrimoniosAtualizados || []);
            }
            console.log('Transferência aprovada com sucesso!');
        }
        catch (err) {
            console.error('Erro ao aprovar transferência:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao aprovar transferência');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const rejeitarTransferencia = useCallback(async (id, motivo) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            // 🆕 Usa novo endpoint
            const transferenciaAtualizada = await apiRejeitarTransferencia(id, {
                motivo_rejeicao: motivo,
            });
            // Atualiza estado local
            setTransferencias((prev) => prev.map((t) => (t.id === id ? transferenciaAtualizada : t)));
            console.log('Transferência rejeitada.');
        }
        catch (err) {
            console.error('Erro ao rejeitar transferência:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao rejeitar transferência');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    const efetivarTransferencia = useCallback(async (id) => {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            // 🆕 Usa novo endpoint
            const transferenciaAtualizada = await apiEfetivarTransferencia(id);
            // Atualiza estado local
            setTransferencias((prev) => prev.map((t) => (t.id === id ? transferenciaAtualizada : t)));
            // 🆕 Recarrega patrimônios (foram atualizados)
            const patrimoniosAtualizados = await listPatrimonios();
            setPatrimonios(patrimoniosAtualizados || []);
            console.log('Transferência efetivada com sucesso!');
        }
        catch (err) {
            console.error('Erro ao efetivar transferência:', err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao efetivar transferência');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, []);
    // ========================================
    // CÁLCULO DE KPIs
    // ========================================
    const kpis = useMemo(() => {
        const transferenciasComStatus = transferencias.map((t) => (Object.assign(Object.assign({}, t), { status: getTransferenciaStatus(t) })));
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        const total = transferenciasComStatus.length;
        const pendentes = transferenciasComStatus.filter((t) => t.status === 'pendente').length;
        const aprovadasMes = transferenciasComStatus.filter((t) => {
            if (t.status !== 'aprovada' && t.status !== 'concluida')
                return false;
            if (!t.criado_em)
                return false;
            const data = new Date(t.criado_em);
            return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        }).length;
        const rejeitadasMes = transferenciasComStatus.filter((t) => {
            if (t.status !== 'rejeitada')
                return false;
            if (!t.criado_em)
                return false;
            const data = new Date(t.criado_em);
            return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
        }).length;
        return {
            total,
            pendentes,
            aprovadasMes,
            rejeitadasMes,
        };
    }, [transferencias, getTransferenciaStatus]);
    // ========================================
    // 🆕 FILTRAGEM E ORDENAÇÃO (MODIFICADO)
    // ========================================
    const transferenciasFiltradas = useMemo(() => {
        let filtradas = transferencias.map((t) => (Object.assign(Object.assign({}, t), { status: getTransferenciaStatus(t) })));
        // Filtro de busca geral
        if (filtros.busca) {
            const busca = filtros.busca.toLowerCase();
            filtradas = filtradas.filter((t) => {
                var _a;
                const patrimonio = patrimonios.find((p) => p.id === t.patrimonio_id);
                const nomePatrimonio = (patrimonio === null || patrimonio === void 0 ? void 0 : patrimonio.nome.toLowerCase()) || '';
                const motivo = ((_a = t.motivo) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                return nomePatrimonio.includes(busca) || motivo.includes(busca);
            });
        }
        // Filtro por status
        if (filtros.status !== 'todos') {
            filtradas = filtradas.filter((t) => t.status === filtros.status);
        }
        // 🆕 Filtro por setor UNIFICADO (origem OU destino)
        if (filtros.setor !== 'todos') {
            const setorId = parseInt(filtros.setor);
            if (!isNaN(setorId)) {
                filtradas = filtradas.filter((t) => t.setor_origem_id === setorId || t.setor_destino_id === setorId);
            }
        }
        // 🆕 Filtro por responsável UNIFICADO (origem OU destino)
        if (filtros.responsavel !== 'todos') {
            const responsavelId = parseInt(filtros.responsavel);
            if (!isNaN(responsavelId)) {
                filtradas = filtradas.filter((t) => t.responsavel_origem_id === responsavelId ||
                    t.responsavel_destino_id === responsavelId);
            }
        }
        // Filtro por patrimônio
        if (filtros.patrimonio !== 'todos') {
            const patrimonioId = parseInt(filtros.patrimonio);
            if (!isNaN(patrimonioId)) {
                filtradas = filtradas.filter((t) => t.patrimonio_id === patrimonioId);
            }
        }
        // Filtro por solicitante
        if (filtros.solicitante !== 'todos') {
            const solicitanteId = parseInt(filtros.solicitante);
            if (!isNaN(solicitanteId)) {
                filtradas = filtradas.filter((t) => t.solicitante_id === solicitanteId);
            }
        }
        // Filtro por aprovador
        if (filtros.aprovador !== 'todos') {
            const aprovadorId = parseInt(filtros.aprovador);
            if (!isNaN(aprovadorId)) {
                filtradas = filtradas.filter((t) => t.aprovado_por === aprovadorId);
            }
        }
        // Filtro por período
        if (filtros.dataInicio) {
            filtradas = filtradas.filter((t) => {
                if (!t.data_transferencia)
                    return false;
                return new Date(t.data_transferencia) >= new Date(filtros.dataInicio);
            });
        }
        if (filtros.dataFim) {
            filtradas = filtradas.filter((t) => {
                if (!t.data_transferencia)
                    return false;
                return new Date(t.data_transferencia) <= new Date(filtros.dataFim);
            });
        }
        // Aplicar ordenação
        filtradas.sort((a, b) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            let aVal;
            let bVal;
            switch (ordenacao.campo) {
                case 'patrimonio_nome':
                    aVal = ((_a = patrimonios.find((p) => p.id === a.patrimonio_id)) === null || _a === void 0 ? void 0 : _a.nome) || '';
                    bVal = ((_b = patrimonios.find((p) => p.id === b.patrimonio_id)) === null || _b === void 0 ? void 0 : _b.nome) || '';
                    break;
                case 'setor_origem_nome':
                    aVal = ((_c = setores.find((s) => s.id === a.setor_origem_id)) === null || _c === void 0 ? void 0 : _c.nome) || '';
                    bVal = ((_d = setores.find((s) => s.id === b.setor_origem_id)) === null || _d === void 0 ? void 0 : _d.nome) || '';
                    break;
                case 'setor_destino_nome':
                    aVal = ((_e = setores.find((s) => s.id === a.setor_destino_id)) === null || _e === void 0 ? void 0 : _e.nome) || '';
                    bVal = ((_f = setores.find((s) => s.id === b.setor_destino_id)) === null || _f === void 0 ? void 0 : _f.nome) || '';
                    break;
                case 'responsavel_origem_nome':
                    aVal =
                        ((_g = usuarios.find((u) => u.id === a.responsavel_origem_id)) === null || _g === void 0 ? void 0 : _g.username) ||
                            '';
                    bVal =
                        ((_h = usuarios.find((u) => u.id === b.responsavel_origem_id)) === null || _h === void 0 ? void 0 : _h.username) ||
                            '';
                    break;
                case 'responsavel_destino_nome':
                    aVal =
                        ((_j = usuarios.find((u) => u.id === a.responsavel_destino_id)) === null || _j === void 0 ? void 0 : _j.username) ||
                            '';
                    bVal =
                        ((_k = usuarios.find((u) => u.id === b.responsavel_destino_id)) === null || _k === void 0 ? void 0 : _k.username) ||
                            '';
                    break;
                case 'solicitante_nome': // 🆕 NOVO CAMPO
                    aVal = ((_l = usuarios.find((u) => u.id === a.solicitante_id)) === null || _l === void 0 ? void 0 : _l.username) || '';
                    bVal = ((_m = usuarios.find((u) => u.id === b.solicitante_id)) === null || _m === void 0 ? void 0 : _m.username) || '';
                    break;
                case 'aprovador_nome':
                    aVal = ((_o = usuarios.find((u) => u.id === a.aprovado_por)) === null || _o === void 0 ? void 0 : _o.username) || '';
                    bVal = ((_p = usuarios.find((u) => u.id === b.aprovado_por)) === null || _p === void 0 ? void 0 : _p.username) || '';
                    break;
                case 'status':
                    aVal = a.status;
                    bVal = b.status;
                    break;
                case 'data_aprovacao': // 🆕 NOVO CAMPO
                    aVal = a.data_aprovacao || '';
                    bVal = b.data_aprovacao || '';
                    break;
                case 'data_efetivacao': // 🆕 NOVO CAMPO
                    aVal = a.data_efetivacao || '';
                    bVal = b.data_efetivacao || '';
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
        return filtradas;
    }, [
        transferencias,
        patrimonios,
        setores,
        usuarios,
        filtros,
        ordenacao,
        getTransferenciaStatus,
    ]);
    // ========================================
    // CONTEXT VALUE
    // ========================================
    const contextValue = {
        // Dados
        transferencias,
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
        transferenciasFiltradas,
        kpis,
        // Funções CRUD
        createTransferencia,
        updateTransferencia,
        deleteTransferencia,
        // Funções especiais
        aprovarTransferencia,
        rejeitarTransferencia,
        efetivarTransferencia,
        // Funções de verificação
        getTransferenciaStatus,
        podeAprovar,
        podeEfetivar,
        verificarTransferenciaPendente,
        // Atualização
        refreshData: () => fetchData(true),
    };
    return (_jsx(TransferenciasContext.Provider, { value: contextValue, children: children }));
};
// ========================================
// HOOK CUSTOMIZADO
// ========================================
export const useTransferencias = () => {
    const context = useContext(TransferenciasContext);
    if (!context) {
        throw new Error('useTransferencias deve ser usado dentro de TransferenciasProvider');
    }
    return context;
};

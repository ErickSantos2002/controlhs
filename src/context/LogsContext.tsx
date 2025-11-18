import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  listLogs,
  listUsuarios,
} from '../services/controlapi';
import type {
  Log,
  FiltrosLog,
  LogPaginacao,
  LogsContextData,
} from '../types/logs.types';

// ========================================
// CONTEXT & PROVIDER
// ========================================

const LogsContext = createContext<LogsContextData | undefined>(undefined);

// Cache configuration
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos

export const LogsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [usuariosMap, setUsuariosMap] = useState<Map<number, string>>(new Map());

  // ========================================
  // FILTROS E PAGINAÇÃO
  // ========================================

  const [filtros, setFiltros] = useState<FiltrosLog>({
    busca: '',
    entidade: undefined,
    acao: undefined,
    usuario: undefined,
    dataInicio: undefined,
    dataFim: undefined,
  });

  const [paginacao, setPaginacaoState] = useState<LogPaginacao>({
    paginaAtual: 1,
    itensPorPagina: 10,
    totalPaginas: 1,
    totalRegistros: 0,
  });

  // ========================================
  // FUNÇÃO PARA CARREGAR USUÁRIOS
  // ========================================

  const carregarUsuarios = useCallback(async () => {
    try {
      const usuarios = await listUsuarios();
      const map = new Map<number, string>();

      usuarios.forEach((usuario: any) => {
        map.set(usuario.id, usuario.username || usuario.nome || `Usuário ${usuario.id}`);
      });

      setUsuariosMap(map);
      console.log('👥 Mapeamento de usuários criado:', Object.fromEntries(map));
    } catch (err) {
      console.error('Erro ao carregar usuários para logs:', err);
      // Não bloqueia o carregamento dos logs
    }
  }, []);

  // ========================================
  // FUNÇÃO PARA BUSCAR LOGS
  // ========================================

  const buscarLogs = useCallback(async (filtrosCustom?: FiltrosLog) => {
    try {
      setLoading(true);
      setError(null);

      const filtrosAplicar = filtrosCustom || filtros;

      // Prepara parâmetros para API
      const params: any = {
        skip: (paginacao.paginaAtual - 1) * paginacao.itensPorPagina,
        limit: paginacao.itensPorPagina,
      };

      // Adiciona filtros se existirem
      if (filtrosAplicar.busca) params.busca = filtrosAplicar.busca;
      if (filtrosAplicar.entidade) params.entidade = filtrosAplicar.entidade;
      if (filtrosAplicar.acao) params.acao = filtrosAplicar.acao;
      if (filtrosAplicar.usuario) params.usuario = filtrosAplicar.usuario;
      if (filtrosAplicar.dataInicio) params.dataInicio = filtrosAplicar.dataInicio;
      if (filtrosAplicar.dataFim) params.dataFim = filtrosAplicar.dataFim;

      const data = await listLogs(params);

      // 🔍 DEBUG: Log para ver estrutura dos dados
      console.log('📋 Dados recebidos da API de logs:', data);
      if (Array.isArray(data) && data.length > 0) {
        console.log('📋 Primeiro log (exemplo):', data[0]);
      } else if (data.logs && data.logs.length > 0) {
        console.log('📋 Primeiro log (exemplo):', data.logs[0]);
      }

      // 🔄 Função para normalizar os dados e mapear campo de usuário
      const normalizarLogs = (logs: any[]): Log[] => {
        return logs.map(log => {
          // Tenta obter o nome do usuário do mapa, se tiver usuario_id
          let nomeUsuario = 'Usuário Desconhecido';

          if (log.usuario_id && usuariosMap.has(log.usuario_id)) {
            nomeUsuario = usuariosMap.get(log.usuario_id)!;
          } else if (log.usuario) {
            nomeUsuario = log.usuario;
          } else if (log.usuario_nome) {
            nomeUsuario = log.usuario_nome;
          } else if (log.username) {
            nomeUsuario = log.username;
          } else if (log.created_by) {
            nomeUsuario = log.created_by;
          } else if (log.user) {
            if (typeof log.user === 'string') {
              nomeUsuario = log.user;
            } else if (log.user?.nome) {
              nomeUsuario = log.user.nome;
            } else if (log.user?.username) {
              nomeUsuario = log.user.username;
            }
          }

          return {
            ...log,
            usuario: nomeUsuario,
          };
        });
      };

      // Verifica se a API retorna um objeto com logs ou array direto
      if (Array.isArray(data)) {
        const logsNormalizados = normalizarLogs(data);
        setLogs(logsNormalizados);
        setPaginacaoState(prev => ({
          ...prev,
          totalRegistros: data.length,
          totalPaginas: Math.ceil(data.length / prev.itensPorPagina),
        }));
      } else if (data.logs && Array.isArray(data.logs)) {
        const logsNormalizados = normalizarLogs(data.logs);
        setLogs(logsNormalizados);
        setPaginacaoState(prev => ({
          ...prev,
          totalRegistros: data.total || data.logs.length,
          totalPaginas: Math.ceil((data.total || data.logs.length) / prev.itensPorPagina),
        }));
      } else {
        setLogs([]);
        setPaginacaoState(prev => ({
          ...prev,
          totalRegistros: 0,
          totalPaginas: 1,
        }));
      }

      setLastFetch(Date.now());
    } catch (err: any) {
      console.error('Erro ao buscar logs:', err);
      setError(err.message || 'Erro ao carregar logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filtros, paginacao.paginaAtual, paginacao.itensPorPagina, usuariosMap]);

  // ========================================
  // FUNÇÃO PARA REFRESH MANUAL
  // ========================================

  const refreshLogs = useCallback(async () => {
    setLastFetch(0); // Force refresh
    await buscarLogs();
  }, [buscarLogs]);

  // ========================================
  // EFEITO PARA CARREGAR LOGS INICIALMENTE
  // ========================================

  useEffect(() => {
    const now = Date.now();
    const shouldRefresh = now - lastFetch > CACHE_EXPIRY_TIME;

    if (shouldRefresh || lastFetch === 0) {
      buscarLogs();
    }
  }, [buscarLogs, lastFetch]);

  // ========================================
  // EFEITO PARA CARREGAR USUÁRIOS (UMA VEZ)
  // ========================================

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  // ========================================
  // FILTROS APLICADOS LOCALMENTE
  // ========================================

  const logsFiltrados = useMemo(() => {
    let resultado = [...logs];

    // Filtro de busca local (complementar ao da API)
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        log =>
          log.acao.toLowerCase().includes(termo) ||
          log.entidade.toLowerCase().includes(termo) ||
          log.usuario.toLowerCase().includes(termo) ||
          log.entidade_id.toString().includes(termo)
      );
    }

    // Filtro por entidade
    if (filtros.entidade && filtros.entidade !== 'todas') {
      resultado = resultado.filter(log => log.entidade === filtros.entidade);
    }

    // Filtro por ação
    if (filtros.acao && filtros.acao !== 'todas') {
      resultado = resultado.filter(log => log.acao === filtros.acao);
    }

    // Filtro por usuário
    if (filtros.usuario && filtros.usuario !== 'todos') {
      resultado = resultado.filter(log => log.usuario === filtros.usuario);
    }

    // Filtro por data de início
    if (filtros.dataInicio) {
      resultado = resultado.filter(
        log => new Date(log.criado_em) >= new Date(filtros.dataInicio!)
      );
    }

    // Filtro por data de fim
    if (filtros.dataFim) {
      resultado = resultado.filter(
        log => new Date(log.criado_em) <= new Date(filtros.dataFim!)
      );
    }

    return resultado;
  }, [logs, filtros]);

  // ========================================
  // FUNÇÃO PARA ATUALIZAR PAGINAÇÃO
  // ========================================

  const setPaginacao = useCallback((novaPaginacao: Partial<LogPaginacao>) => {
    setPaginacaoState(prev => {
      const updated = { ...prev, ...novaPaginacao };

      // Recalcula total de páginas se mudou itens por página
      if (novaPaginacao.itensPorPagina) {
        updated.totalPaginas = Math.ceil(prev.totalRegistros / novaPaginacao.itensPorPagina);
        updated.paginaAtual = 1; // Reset para primeira página
      }

      return updated;
    });
  }, []);

  // ========================================
  // EFEITO PARA RECARREGAR QUANDO MUDAR PÁGINA
  // ========================================

  useEffect(() => {
    if (lastFetch > 0) {
      buscarLogs();
    }
  }, [paginacao.paginaAtual]);

  // ========================================
  // CONTEXTO VALUE
  // ========================================

  const contextValue: LogsContextData = {
    logs,
    logsFiltrados,
    filtros,
    setFiltros,
    loading,
    error,
    paginacao,
    setPaginacao,
    refreshLogs,
    buscarLogs,
  };

  return (
    <LogsContext.Provider value={contextValue}>
      {children}
    </LogsContext.Provider>
  );
};

// ========================================
// HOOK CUSTOMIZADO
// ========================================

export function useLogs() {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error('useLogs deve ser usado dentro do LogsProvider');
  }
  return context;
}

export default LogsContext;

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  listBaixas,
  createBaixa as apiCreateBaixa,
  listPatrimonios,
  listCategorias,
  listSetores,
  listUsuarios,
  createLog,
} from '../services/controlapi';
import type {
  Baixa,
  BaixaCreate,
  BaixaUpdate,
  BaixaStatus,
  BaixaComStatus,
  BaixasKPIs,
  Patrimonio,
  Categoria,
  Setor,
  Usuario,
  FiltrosBaixa,
  OrdenacaoBaixa,
  BaixasContextData,
} from '../types/baixas.types';
import { calcularStatusBaixa } from '../types/baixas.types';

// ========================================
// CONTEXT & PROVIDER
// ========================================

const BaixasContext = createContext<BaixasContextData | undefined>(undefined);

// Cache configuration
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos

// Funções auxiliares para obter dados do localStorage
const getUserRoleFromStorage = (): string => {
  return localStorage.getItem('role')?.toLowerCase() || '';
};

const getUserIdFromStorage = (): string | null => {
  return localStorage.getItem('id');
};

// Inicializa filtros com base no usuário
const getInitialFilters = (): FiltrosBaixa => {
  const userRole = getUserRoleFromStorage();
  const userId = getUserIdFromStorage();

  // Administrador e Gerente: veem tudo
  if (['administrador', 'gerente'].includes(userRole)) {
    return {
      busca: '',
      status: 'todos',
      tipo: 'todos',
      patrimonio: 'todos',
      solicitante: 'todos',
      aprovador: 'todos',
      dataInicio: undefined,
      dataFim: undefined,
    };
  }

  // Gestor: vê todas as baixas
  if (userRole === 'gestor') {
    return {
      busca: '',
      status: 'todos',
      tipo: 'todos',
      patrimonio: 'todos',
      solicitante: 'todos',
      aprovador: 'todos',
      dataInicio: undefined,
      dataFim: undefined,
    };
  }

  // Usuario comum: vê apenas suas solicitações
  if (userId) {
    return {
      busca: '',
      status: 'todos',
      tipo: 'todos',
      patrimonio: 'todos',
      solicitante: userId,
      aprovador: 'todos',
      dataInicio: undefined,
      dataFim: undefined,
    };
  }

  // Fallback: sem filtro
  return {
    busca: '',
    status: 'todos',
    tipo: 'todos',
    patrimonio: 'todos',
    solicitante: 'todos',
    aprovador: 'todos',
    dataInicio: undefined,
    dataFim: undefined,
  };
};

export const BaixasProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================

  const [baixas, setBaixas] = useState<Baixa[]>([]);
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // ========================================
  // FILTROS E ORDENAÇÃO
  // ========================================

  const [filtros, setFiltros] = useState<FiltrosBaixa>(getInitialFilters());

  const [ordenacao, setOrdenacao] = useState<OrdenacaoBaixa>({
    campo: 'id',
    direcao: 'desc',
  });

  // ========================================
  // INFORMAÇÕES DO USUÁRIO LOGADO
  // ========================================

  const getUserInfo = useCallback(() => {
    const userId = parseInt(localStorage.getItem('id') || '0');
    const role = localStorage.getItem('role')?.toLowerCase() || '';
    const username = localStorage.getItem('username') || '';

    // Busca o usuário completo para pegar o setor_id
    const user = usuarios.find((u) => u.id === userId);

    return {
      id: userId,
      username,
      role,
      setor_id: user?.setor_id,
    };
  }, [usuarios]);

  // ========================================
  // CÁLCULO DE STATUS
  // ========================================

  const getBaixaStatus = useCallback((baixa: Baixa): BaixaStatus => {
    if (baixa.aprovado_por) {
      return 'aprovada';
    }
    return 'pendente';
  }, []);

  // ========================================
  // VERIFICAÇÕES DE PERMISSÃO
  // ========================================

  const podeAprovar = useCallback(
    (baixa: Baixa): boolean => {
      const { role } = getUserInfo();

      // Apenas administradores podem aprovar baixas
      return role === 'administrador';
    },
    [getUserInfo],
  );

  // ========================================
  // FETCH DE DADOS
  // ========================================

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      // Verifica se precisa atualizar (cache expirado ou forceRefresh)
      const now = Date.now();
      if (!forceRefresh && lastFetch && now - lastFetch < CACHE_EXPIRY_TIME) {
        return; // Usa cache existente
      }

      setLoading(true);
      setError(null);

      try {
        // Busca dados em paralelo para melhor performance
        const [
          baixasData,
          patrimoniosData,
          categoriasData,
          setoresData,
          usuariosData,
        ] = await Promise.all([
          listBaixas(),
          listPatrimonios(),
          listCategorias(),
          listSetores(),
          listUsuarios(),
        ]);

        setBaixas(baixasData || []);
        setPatrimonios(patrimoniosData || []);
        setCategorias(categoriasData || []);
        setSetores(setoresData || []);
        setUsuarios(usuariosData || []);
        setLastFetch(now);
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError(
          err.response?.data?.detail ||
            'Não foi possível carregar os dados. Verifique sua conexão.',
        );
      } finally {
        setLoading(false);
      }
    },
    [lastFetch],
  );

  // Carrega dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  // ========================================
  // FUNÇÕES CRUD
  // ========================================

  const createBaixa = useCallback(async (data: BaixaCreate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const novaBaixa = await apiCreateBaixa(data);
      setBaixas((prev) => [...prev, novaBaixa]);

      // Log de auditoria
      await createLog({
        acao: 'criar_baixa',
        entidade: 'baixa',
        entidade_id: novaBaixa.id,
        detalhes: {
          patrimonio_id: data.patrimonio_id,
          tipo_baixa: data.tipo_baixa,
          motivo: data.motivo,
        },
      });

      console.log('Baixa registrada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao criar baixa:', err);
      setError(err.response?.data?.detail || 'Erro ao registrar baixa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBaixa = useCallback(
    async (id: number, data: BaixaUpdate): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Atualiza localmente (API não implementada ainda)
        setBaixas((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...data } : b)),
        );

        console.log('Baixa atualizada com sucesso!');
      } catch (err: any) {
        console.error('Erro ao atualizar baixa:', err);
        setError(err.response?.data?.detail || 'Erro ao atualizar baixa');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteBaixa = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // API não implementada ainda - apenas remove localmente
      setBaixas((prev) => prev.filter((b) => b.id !== id));

      // Log de auditoria
      await createLog({
        acao: 'excluir_baixa',
        entidade: 'baixa',
        entidade_id: id,
        detalhes: {},
      });

      console.log('Baixa excluída com sucesso!');
    } catch (err: any) {
      console.error('Erro ao excluir baixa:', err);
      setError(err.response?.data?.detail || 'Erro ao excluir baixa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // FUNÇÕES ESPECIAIS DE APROVAÇÃO
  // ========================================

  const aprovarBaixa = useCallback(
    async (id: number, observacoes?: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const userId = parseInt(localStorage.getItem('id') || '0');
        const agora = new Date().toISOString();

        // Atualiza localmente (API não implementada ainda)
        setBaixas((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  aprovado_por: userId,
                  data_aprovacao: agora,
                  observacoes: observacoes || b.observacoes,
                }
              : b,
          ),
        );

        console.log('Baixa aprovada com sucesso!');
      } catch (err: any) {
        console.error('Erro ao aprovar baixa:', err);
        setError(err.response?.data?.detail || 'Erro ao aprovar baixa');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const rejeitarBaixa = useCallback(
    async (id: number, motivo: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // API não implementada - apenas remove localmente por enquanto
        setBaixas((prev) => prev.filter((b) => b.id !== id));

        console.log('Baixa rejeitada.');
      } catch (err: any) {
        console.error('Erro ao rejeitar baixa:', err);
        setError(err.response?.data?.detail || 'Erro ao rejeitar baixa');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ========================================
  // CÁLCULO DE KPIs
  // ========================================

  const kpis = useMemo((): BaixasKPIs => {
    const baixasComStatus = baixas.map((b) => ({
      ...b,
      status: getBaixaStatus(b),
    }));

    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const total = baixasComStatus.length;
    const pendentes = baixasComStatus.filter((b) => b.status === 'pendente')
      .length;

    const aprovadasMes = baixasComStatus.filter((b) => {
      if (b.status !== 'aprovada') return false;
      if (!b.data_baixa) return false;
      const data = new Date(b.data_baixa);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).length;

    const rejeitadasMes = 0; // Implementar quando houver rejeições

    const valorTotalMes = baixasComStatus
      .filter((b) => {
        if (b.status !== 'aprovada') return false;
        if (!b.data_baixa) return false;
        const data = new Date(b.data_baixa);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
      })
      .reduce((acc, b) => acc + (b.valor_baixa || 0), 0);

    return {
      total,
      pendentes,
      aprovadasMes,
      rejeitadasMes,
      valorTotalMes,
    };
  }, [baixas, getBaixaStatus]);

  // ========================================
  // FILTRAGEM E ORDENAÇÃO
  // ========================================

  const baixasFiltradas = useMemo((): BaixaComStatus[] => {
    let filtradas = baixas.map((b) => ({
      ...b,
      status: getBaixaStatus(b),
    }));

    // Filtro de busca geral
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      filtradas = filtradas.filter((b) => {
        const patrimonio = patrimonios.find((p) => p.id === b.patrimonio_id);
        const nomePatrimonio = patrimonio?.nome.toLowerCase() || '';
        const motivo = b.motivo?.toLowerCase() || '';

        return nomePatrimonio.includes(busca) || motivo.includes(busca);
      });
    }

    // Filtro por status
    if (filtros.status !== 'todos') {
      filtradas = filtradas.filter((b) => b.status === filtros.status);
    }

    // Filtro por tipo
    if (filtros.tipo !== 'todos') {
      filtradas = filtradas.filter((b) => b.tipo_baixa === filtros.tipo);
    }

    // Filtro por patrimônio
    if (filtros.patrimonio !== 'todos') {
      const patrimonioId = parseInt(filtros.patrimonio);
      if (!isNaN(patrimonioId)) {
        filtradas = filtradas.filter((b) => b.patrimonio_id === patrimonioId);
      }
    }

    // Filtro por solicitante
    if (filtros.solicitante !== 'todos') {
      const solicitanteId = parseInt(filtros.solicitante);
      if (!isNaN(solicitanteId)) {
        filtradas = filtradas.filter((b) => b.solicitante_id === solicitanteId);
      }
    }

    // Filtro por aprovador
    if (filtros.aprovador !== 'todos') {
      const aprovadorId = parseInt(filtros.aprovador);
      if (!isNaN(aprovadorId)) {
        filtradas = filtradas.filter((b) => b.aprovado_por === aprovadorId);
      }
    }

    // Filtro por período
    if (filtros.dataInicio) {
      filtradas = filtradas.filter((b) => {
        if (!b.data_baixa) return false;
        return new Date(b.data_baixa) >= new Date(filtros.dataInicio!);
      });
    }

    if (filtros.dataFim) {
      filtradas = filtradas.filter((b) => {
        if (!b.data_baixa) return false;
        return new Date(b.data_baixa) <= new Date(filtros.dataFim!);
      });
    }

    // Aplicar ordenação
    filtradas.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (ordenacao.campo) {
        case 'patrimonio_nome':
          aVal = patrimonios.find((p) => p.id === a.patrimonio_id)?.nome || '';
          bVal = patrimonios.find((p) => p.id === b.patrimonio_id)?.nome || '';
          break;
        case 'solicitante_nome':
          aVal = usuarios.find((u) => u.id === a.solicitante_id)?.username || '';
          bVal = usuarios.find((u) => u.id === b.solicitante_id)?.username || '';
          break;
        case 'aprovador_nome':
          aVal = usuarios.find((u) => u.id === a.aprovado_por)?.username || '';
          bVal = usuarios.find((u) => u.id === b.aprovado_por)?.username || '';
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a[ordenacao.campo as keyof BaixaComStatus];
          bVal = b[ordenacao.campo as keyof BaixaComStatus];
      }

      // Tratar valores nulos/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Comparação
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return ordenacao.direcao === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (ordenacao.direcao === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtradas;
  }, [
    baixas,
    patrimonios,
    setores,
    usuarios,
    filtros,
    ordenacao,
    getBaixaStatus,
  ]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: BaixasContextData = {
    // Dados
    baixas,
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
    baixasFiltradas,
    kpis,

    // Funções CRUD
    createBaixa,
    updateBaixa,
    deleteBaixa,

    // Funções especiais
    aprovarBaixa,
    rejeitarBaixa,

    // Funções de verificação
    getBaixaStatus,
    podeAprovar,

    // Atualização
    refreshData: () => fetchData(true),
  };

  return (
    <BaixasContext.Provider value={contextValue}>
      {children}
    </BaixasContext.Provider>
  );
};

// ========================================
// HOOK CUSTOMIZADO
// ========================================

export const useBaixas = () => {
  const context = useContext(BaixasContext);
  if (!context) {
    throw new Error('useBaixas deve ser usado dentro de BaixasProvider');
  }
  return context;
};

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  listInventarios,
  createInventario as apiCreateInventario,
  updateInventario as apiUpdateInventario,
  deleteInventario as apiDeleteInventario,
  listPatrimonios,
  listCategorias,
  listSetores,
  listUsuarios,
} from '../services/controlapi';
import type {
  Inventario,
  InventarioCreate,
  InventarioUpdate,
  FiltrosInventario,
  InventariosKPIs,
  SituacaoInventario,
} from '../types/inventarios.types';
import type {
  Patrimonio,
  Categoria,
  Setor,
  Usuario,
} from '../types/patrimonios.types';

// ========================================
// CONTEXT DATA TYPE
// ========================================

interface InventarioContextData {
  // Dados
  inventarios: Inventario[];
  patrimonios: Patrimonio[];
  categorias: Categoria[];
  setores: Setor[];
  usuarios: Usuario[];

  // Estados
  loading: boolean;
  error: string | null;

  // Filtros
  filtros: FiltrosInventario;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosInventario>>;

  // KPIs
  kpis: InventariosKPIs;

  // Dados filtrados
  inventariosFiltrados: Inventario[];

  // Funções CRUD
  createInventario: (data: InventarioCreate) => Promise<void>;
  updateInventario: (id: number, data: InventarioUpdate) => Promise<void>;
  deleteInventario: (id: number) => Promise<void>;

  // Refresh
  refreshData: () => Promise<void>;
}

// ========================================
// CONTEXT & PROVIDER
// ========================================

const InventarioContext = createContext<InventarioContextData | undefined>(
  undefined,
);

// Cache configuration
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos

export const InventarioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================

  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // ========================================
  // FILTROS
  // ========================================

  const [filtros, setFiltros] = useState<FiltrosInventario>({
    busca: '',
    situacao: 'todos',
    responsavel_id: 'todos',
    data_inicio: '',
    data_fim: '',
  });

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
          inventariosData,
          patrimoniosData,
          categoriasData,
          setoresData,
          usuariosData,
        ] = await Promise.all([
          listInventarios(),
          listPatrimonios(),
          listCategorias(),
          listSetores(),
          listUsuarios(),
        ]);

        setInventarios(inventariosData || []);
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

  const createInventario = useCallback(
    async (data: InventarioCreate): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const novoInventario = await apiCreateInventario(data);
        setInventarios((prev) => [...prev, novoInventario]);

        console.log('Registro de inventário criado com sucesso!');
      } catch (err: any) {
        console.error('Erro ao criar registro de inventário:', err);
        setError(
          err.response?.data?.detail || 'Erro ao criar registro de inventário',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateInventario = useCallback(
    async (id: number, data: InventarioUpdate): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const inventarioAtualizado = await apiUpdateInventario(id, data);
        setInventarios((prev) =>
          prev.map((inv) => (inv.id === id ? inventarioAtualizado : inv)),
        );

        console.log('Registro de inventário atualizado com sucesso!');
      } catch (err: any) {
        console.error('Erro ao atualizar registro de inventário:', err);
        setError(
          err.response?.data?.detail ||
            'Erro ao atualizar registro de inventário',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteInventario = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiDeleteInventario(id);
      setInventarios((prev) => prev.filter((inv) => inv.id !== id));

      console.log('Registro de inventário excluído com sucesso!');
    } catch (err: any) {
      console.error('Erro ao excluir registro de inventário:', err);
      setError(
        err.response?.data?.detail || 'Erro ao excluir registro de inventário',
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // ========================================
  // DADOS FILTRADOS
  // ========================================

  const inventariosFiltrados = useMemo(() => {
    let resultado = [...inventarios];

    // Filtro de busca (busca no patrimônio)
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase();
      resultado = resultado.filter((inv) => {
        const patrimonio = patrimonios.find((p) => p.id === inv.patrimonio_id);
        return (
          patrimonio?.nome?.toLowerCase().includes(buscaLower) ||
          patrimonio?.numero_serie?.toLowerCase().includes(buscaLower) ||
          inv.observacoes?.toLowerCase().includes(buscaLower)
        );
      });
    }

    // Filtro de situação
    if (filtros.situacao && filtros.situacao !== 'todos') {
      resultado = resultado.filter((inv) => inv.situacao === filtros.situacao);
    }

    // Filtro de responsável
    if (filtros.responsavel_id && filtros.responsavel_id !== 'todos') {
      resultado = resultado.filter(
        (inv) => inv.responsavel_id?.toString() === filtros.responsavel_id,
      );
    }

    // Filtro de data início
    if (filtros.data_inicio) {
      resultado = resultado.filter((inv) => {
        const dataVerificacao = inv.data_verificacao || inv.criado_em;
        if (!dataVerificacao) return false;
        return new Date(dataVerificacao) >= new Date(filtros.data_inicio);
      });
    }

    // Filtro de data fim
    if (filtros.data_fim) {
      resultado = resultado.filter((inv) => {
        const dataVerificacao = inv.data_verificacao || inv.criado_em;
        if (!dataVerificacao) return false;
        return new Date(dataVerificacao) <= new Date(filtros.data_fim);
      });
    }

    return resultado;
  }, [inventarios, patrimonios, filtros]);

  // ========================================
  // KPIS
  // ========================================

  const kpis = useMemo((): InventariosKPIs => {
    const total = inventariosFiltrados.length;
    const encontrados = inventariosFiltrados.filter(
      (inv) => inv.situacao === 'encontrado' || inv.situacao === 'conferido',
    ).length;
    const naoEncontrados = inventariosFiltrados.filter(
      (inv) => inv.situacao === 'nao_encontrado',
    ).length;
    const divergencias = inventariosFiltrados.filter(
      (inv) => inv.situacao === 'divergencia',
    ).length;
    const conferidos = inventariosFiltrados.filter(
      (inv) => inv.situacao === 'conferido',
    ).length;
    const pendentes = inventariosFiltrados.filter(
      (inv) => inv.situacao === 'pendente',
    ).length;

    const percentualConferido = total > 0 ? (conferidos / total) * 100 : 0;

    return {
      total,
      encontrados,
      naoEncontrados,
      divergencias,
      conferidos,
      pendentes,
      percentualConferido,
    };
  }, [inventariosFiltrados]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value: InventarioContextData = {
    inventarios,
    patrimonios,
    categorias,
    setores,
    usuarios,
    loading,
    error,
    filtros,
    setFiltros,
    kpis,
    inventariosFiltrados,
    createInventario,
    updateInventario,
    deleteInventario,
    refreshData,
  };

  return (
    <InventarioContext.Provider value={value}>
      {children}
    </InventarioContext.Provider>
  );
};

// ========================================
// HOOK
// ========================================

export const useInventario = (): InventarioContextData => {
  const context = useContext(InventarioContext);
  if (!context) {
    throw new Error('useInventario deve ser usado dentro de InventarioProvider');
  }
  return context;
};

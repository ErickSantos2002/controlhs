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
  listUsuarios,
  listSetores,
  listCategorias,
} from '../services/controlapi';
import type {
  Inventario,
  InventarioCreate,
  InventarioUpdate,
  FiltrosInventario,
  InventariosKPIs,
} from '../types/inventarios.types';
import type { Usuario, Setor, Categoria } from '../types/patrimonios.types';

// ========================================
// CONTEXT DATA TYPE
// ========================================

interface InventarioContextData {
  // Dados
  inventarios: Inventario[];
  usuarios: Usuario[];
  setores: Setor[];
  categorias: Categoria[];

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
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  // ========================================
  // FILTROS
  // ========================================

  const [filtros, setFiltros] = useState<FiltrosInventario>({
    busca: '',
    status: 'todos',
    tipo: 'todos',
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
        const [inventariosData, usuariosData, setoresData, categoriasData] =
          await Promise.all([
            listInventarios(),
            listUsuarios(),
            listSetores(),
            listCategorias(),
          ]);

        setInventarios(inventariosData || []);
        setUsuarios(usuariosData || []);
        setSetores(setoresData || []);
        setCategorias(categoriasData || []);
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
        setInventarios((prev) => [novoInventario, ...prev]);

        console.log('Sessão de inventário criada com sucesso!');
      } catch (err: any) {
        console.error('Erro ao criar sessão de inventário:', err);
        setError(
          err.response?.data?.detail ||
            'Erro ao criar sessão de inventário',
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

        console.log('Sessão de inventário atualizada com sucesso!');
      } catch (err: any) {
        console.error('Erro ao atualizar sessão de inventário:', err);
        setError(
          err.response?.data?.detail ||
            'Erro ao atualizar sessão de inventário',
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

      console.log('Sessão de inventário excluída com sucesso!');
    } catch (err: any) {
      console.error('Erro ao excluir sessão de inventário:', err);
      setError(
        err.response?.data?.detail || 'Erro ao excluir sessão de inventário',
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

    // Filtro de busca (título ou descrição)
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase();
      resultado = resultado.filter(
        (inv) =>
          inv.titulo?.toLowerCase().includes(buscaLower) ||
          inv.descricao?.toLowerCase().includes(buscaLower),
      );
    }

    // Filtro de status
    if (filtros.status && filtros.status !== 'todos') {
      resultado = resultado.filter((inv) => inv.status === filtros.status);
    }

    // Filtro de tipo
    if (filtros.tipo && filtros.tipo !== 'todos') {
      resultado = resultado.filter((inv) => inv.tipo === filtros.tipo);
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
        const dataInicio = inv.data_inicio;
        if (!dataInicio) return false;
        return new Date(dataInicio) >= new Date(filtros.data_inicio);
      });
    }

    // Filtro de data fim
    if (filtros.data_fim) {
      resultado = resultado.filter((inv) => {
        const dataFim = inv.data_fim || inv.data_inicio;
        if (!dataFim) return false;
        return new Date(dataFim) <= new Date(filtros.data_fim);
      });
    }

    return resultado;
  }, [inventarios, filtros]);

  // ========================================
  // KPIS
  // ========================================

  const kpis = useMemo((): InventariosKPIs => {
    const total = inventariosFiltrados.length;
    const em_andamento = inventariosFiltrados.filter(
      (inv) => inv.status === 'em_andamento',
    ).length;
    const concluidos = inventariosFiltrados.filter(
      (inv) => inv.status === 'concluido',
    ).length;
    const cancelados = inventariosFiltrados.filter(
      (inv) => inv.status === 'cancelado',
    ).length;

    return {
      total,
      em_andamento,
      concluidos,
      cancelados,
    };
  }, [inventariosFiltrados]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value: InventarioContextData = {
    inventarios,
    usuarios,
    setores,
    categorias,
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

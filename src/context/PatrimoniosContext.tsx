import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  listPatrimonios,
  createPatrimonio as apiCreatePatrimonio,
  updatePatrimonio as apiUpdatePatrimonio,
  deletePatrimonio as apiDeletePatrimonio,
  listCategorias,
  listSetores,
  listUsuarios,
} from '../services/controlapi';
import type {
  Patrimonio,
  PatrimonioCreate,
  PatrimonioUpdate,
  Categoria,
  Setor,
  Usuario,
  FiltrosPatrimonio,
  OrdenacaoPatrimonio,
  PatrimoniosContextData,
} from '../types/patrimonios.types';

// ========================================
// CONTEXT & PROVIDER
// ========================================

const PatrimoniosContext = createContext<PatrimoniosContextData | undefined>(
  undefined,
);

// Cache configuration
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos

export const PatrimoniosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================

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

  const [filtros, setFiltros] = useState<FiltrosPatrimonio>({
    busca: '',
    categoria: 'todas',
    setor: 'todos',
    status: 'todos',
    responsavel: 'todos',
    dataInicio: undefined,
    dataFim: undefined,
  });

  const [ordenacao, setOrdenacao] = useState<OrdenacaoPatrimonio>({
    campo: 'id',
    direcao: 'asc',
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
        const [patrimoniosData, categoriasData, setoresData, usuariosData] =
          await Promise.all([
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

  const createPatrimonio = useCallback(
    async (data: PatrimonioCreate): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const novoPatrimonio = await apiCreatePatrimonio(data);
        setPatrimonios((prev) => [...prev, novoPatrimonio]);

        // Toast de sucesso seria disparado aqui
        console.log('Patrimônio criado com sucesso!');
      } catch (err: any) {
        console.error('Erro ao criar patrimônio:', err);
        setError(err.response?.data?.detail || 'Erro ao criar patrimônio');
        throw err; // Re-throw para o componente tratar
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updatePatrimonio = useCallback(
    async (id: number, data: PatrimonioUpdate): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const patrimonioAtualizado = await apiUpdatePatrimonio(id, data);

        setPatrimonios((prev) =>
          prev.map((p) => (p.id === id ? patrimonioAtualizado : p)),
        );

        // Toast de sucesso seria disparado aqui
        console.log('Patrimônio atualizado com sucesso!');
      } catch (err: any) {
        console.error('Erro ao atualizar patrimônio:', err);
        setError(err.response?.data?.detail || 'Erro ao atualizar patrimônio');
        throw err; // Re-throw para o componente tratar
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deletePatrimonio = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await apiDeletePatrimonio(id);

      setPatrimonios((prev) => prev.filter((p) => p.id !== id));

      // Toast de sucesso seria disparado aqui
      console.log('Patrimônio excluído com sucesso!');
    } catch (err: any) {
      console.error('Erro ao excluir patrimônio:', err);
      setError(err.response?.data?.detail || 'Erro ao excluir patrimônio');
      throw err; // Re-throw para o componente tratar
    } finally {
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
      filtrados = filtrados.filter(
        (p) =>
          p.nome.toLowerCase().includes(busca) ||
          p.descricao?.toLowerCase().includes(busca) ||
          p.numero_serie?.toLowerCase().includes(busca),
      );
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
        if (!p.data_aquisicao) return false;
        return new Date(p.data_aquisicao) >= new Date(filtros.dataInicio!);
      });
    }

    if (filtros.dataFim) {
      filtrados = filtrados.filter((p) => {
        if (!p.data_aquisicao) return false;
        return new Date(p.data_aquisicao) <= new Date(filtros.dataFim!);
      });
    }

    // Aplicar ordenação
    filtrados.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      // Determinar valores para comparação baseado no campo
      switch (ordenacao.campo) {
        case 'categoria_nome':
          aVal = categorias.find((c) => c.id === a.categoria_id)?.nome || '';
          bVal = categorias.find((c) => c.id === b.categoria_id)?.nome || '';
          break;
        case 'setor_nome':
          aVal = setores.find((s) => s.id === a.setor_id)?.nome || '';
          bVal = setores.find((s) => s.id === b.setor_id)?.nome || '';
          break;
        case 'responsavel_nome':
          aVal =
            usuarios.find((u) => u.id === a.responsavel_id)?.username || '';
          bVal =
            usuarios.find((u) => u.id === b.responsavel_id)?.username || '';
          break;
        default:
          aVal = a[ordenacao.campo as keyof Patrimonio];
          bVal = b[ordenacao.campo as keyof Patrimonio];
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

    return filtrados;
  }, [patrimonios, categorias, setores, usuarios, filtros, ordenacao]);

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const contextValue: PatrimoniosContextData = {
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

  return (
    <PatrimoniosContext.Provider value={contextValue}>
      {children}
    </PatrimoniosContext.Provider>
  );
};

// ========================================
// HOOK CUSTOMIZADO
// ========================================

export const usePatrimonios = () => {
  const context = useContext(PatrimoniosContext);
  if (!context) {
    throw new Error(
      'usePatrimonios deve ser usado dentro de PatrimoniosProvider',
    );
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  listPatrimonios, 
  listCategorias, 
  listSetores, 
  listUsuarios 
} from '../services/controlapi';

// Types
interface Patrimonio {
  id: number;
  nome: string;
  descricao?: string;
  numero_serie?: string;
  valor_aquisicao: number;
  valor_atual: number;
  categoria_id: number;
  setor_id: number;
  responsavel_id: number;
  data_aquisicao: string;
  status: 'ativo' | 'manutencao' | 'baixado';
  criado_em: string;
}

interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
}

interface Setor {
  id: number;
  nome: string;
  descricao?: string;
}

interface Usuario {
  id: number;
  username: string;
  role_name?: string;
  setor_id?: number;
}

interface FiltrosDashboard {
  categoria: string;
  setor: string;
  situacao: string;
  responsavel: string;
  dataInicio?: string;
  dataFim?: string;
  filtroPersonalizado: string;
  busca: string;
}

interface DashboardContextData {
  // Dados
  patrimonios: Patrimonio[];
  categorias: Categoria[];
  setores: Setor[];
  usuarios: Usuario[];
  
  // Filtros
  filtros: FiltrosDashboard;
  setFiltros: (filtros: FiltrosDashboard) => void;
  
  // Estados
  loading: boolean;
  error: string | null;
  
  // Dados filtrados
  patrimoniosFiltrados: Patrimonio[];
  
  // Funções
  refreshData: () => Promise<void>;
  
  // KPIs calculados
  kpis: {
    totalItens: number;
    valorTotal: number;
    depreciacaoAcumulada: number;
    ativos: number;
    manutencao: number;
    baixados: number;
  };
}

const DashboardContext = createContext<DashboardContextData | undefined>(undefined);

const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados principais
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  // Filtros
  const [filtros, setFiltros] = useState<FiltrosDashboard>({
    categoria: 'todas',
    setor: 'todos',
    situacao: 'todas',
    responsavel: 'todos',
    dataInicio: undefined,
    dataFim: undefined,
    filtroPersonalizado: 'nenhum',
    busca: ''
  });

  // Função para buscar dados da API
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Verifica se precisa atualizar (cache expirado ou forceRefresh)
    const now = Date.now();
    if (!forceRefresh && lastFetch && (now - lastFetch) < CACHE_EXPIRY_TIME) {
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
        listUsuarios()
      ]);
      
      setPatrimonios(patrimoniosData || []);
      setCategorias(categoriasData || []);
      setSetores(setoresData || []);
      setUsuarios(usuariosData || []);
      setLastFetch(now);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível carregar os dados do patrimônio. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [lastFetch]);

  // Carrega dados iniciais
  useEffect(() => {
    fetchData();
  }, []);

  // Filtra patrimônios baseado nos filtros ativos
  const patrimoniosFiltrados = useMemo(() => {
    let filtrados = [...patrimonios];

    // Filtro por categoria
    if (filtros.categoria !== 'todas') {
      const categoriaId = categorias.find(c => 
        c.nome.toLowerCase() === filtros.categoria.toLowerCase()
      )?.id;
      if (categoriaId) {
        filtrados = filtrados.filter(p => p.categoria_id === categoriaId);
      }
    }

    // Filtro por setor
    if (filtros.setor !== 'todos') {
      const setorId = setores.find(s => 
        s.nome.toLowerCase() === filtros.setor.toLowerCase()
      )?.id;
      if (setorId) {
        filtrados = filtrados.filter(p => p.setor_id === setorId);
      }
    }

    // Filtro por situação/status
    if (filtros.situacao !== 'todas') {
      const statusMap: Record<string, string> = {
        'ativos': 'ativo',
        'manutencao': 'manutencao',
        'em manutenção': 'manutencao',
        'baixados': 'baixado'
      };
      const status = statusMap[filtros.situacao.toLowerCase()];
      if (status) {
        filtrados = filtrados.filter(p => p.status === status);
      }
    }

    // Filtro por responsável
    if (filtros.responsavel !== 'todos') {
      const usuarioId = usuarios.find(u => 
        u.username.toLowerCase() === filtros.responsavel.toLowerCase()
      )?.id;
      if (usuarioId) {
        filtrados = filtrados.filter(p => p.responsavel_id === usuarioId);
      }
    }

    // Filtro por período de aquisição
    if (filtros.dataInicio) {
      filtrados = filtrados.filter(p => 
        new Date(p.data_aquisicao) >= new Date(filtros.dataInicio!)
      );
    }
    if (filtros.dataFim) {
      filtrados = filtrados.filter(p => 
        new Date(p.data_aquisicao) <= new Date(filtros.dataFim!)
      );
    }

    // Filtros personalizados
    if (filtros.filtroPersonalizado !== 'nenhum') {
      const hoje = new Date();
      const cincoAnosAtras = new Date();
      cincoAnosAtras.setFullYear(hoje.getFullYear() - 5);
      
      switch (filtros.filtroPersonalizado) {
        case 'antigos':
          filtrados = filtrados.filter(p => 
            new Date(p.data_aquisicao) <= cincoAnosAtras
          );
          break;
        case 'depreciados':
          filtrados = filtrados.filter(p => 
            p.valor_atual <= p.valor_aquisicao * 0.1 // Menos de 10% do valor original
          );
          break;
        case 'em_alta':
          filtrados = filtrados.filter(p => 
            p.valor_atual >= p.valor_aquisicao * 0.7 // Mais de 70% do valor original
          );
          break;
      }
    }

    // Busca por texto
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      filtrados = filtrados.filter(p => 
        p.nome.toLowerCase().includes(busca) ||
        p.descricao?.toLowerCase().includes(busca) ||
        p.numero_serie?.toLowerCase().includes(busca)
      );
    }

    return filtrados;
  }, [patrimonios, categorias, setores, usuarios, filtros]);

  // Calcula KPIs baseado nos patrimônios filtrados
  const kpis = useMemo(() => {
    const totalItens = patrimoniosFiltrados.length;
    const valorTotal = patrimoniosFiltrados.reduce((sum, p) => sum + (p.valor_atual || 0), 0);
    const depreciacaoAcumulada = patrimoniosFiltrados.reduce(
      (sum, p) => sum + ((p.valor_aquisicao || 0) - (p.valor_atual || 0)), 
      0
    );
    const ativos = patrimoniosFiltrados.filter(p => p.status === 'ativo').length;
    const manutencao = patrimoniosFiltrados.filter(p => p.status === 'manutencao').length;
    const baixados = patrimoniosFiltrados.filter(p => p.status === 'baixado').length;

    return {
      totalItens,
      valorTotal,
      depreciacaoAcumulada,
      ativos,
      manutencao,
      baixados
    };
  }, [patrimoniosFiltrados]);

  const contextValue: DashboardContextData = {
    patrimonios,
    categorias,
    setores,
    usuarios,
    filtros,
    setFiltros,
    loading,
    error,
    patrimoniosFiltrados,
    refreshData: () => fetchData(true),
    kpis
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook customizado para usar o contexto
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard deve ser usado dentro de DashboardProvider');
  }
  return context;
};
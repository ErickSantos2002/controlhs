import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  listTransferencias,
  createTransferencia as apiCreateTransferencia,
  updateTransferencia as apiUpdateTransferencia,
  deleteTransferencia as apiDeleteTransferencia,
  listPatrimonios,
  updatePatrimonio as apiUpdatePatrimonio,
  listCategorias,
  listSetores,
  listUsuarios,
  createLog
} from '../services/controlapi';
import type {
  Transferencia,
  TransferenciaCreate,
  TransferenciaUpdate,
  TransferenciaStatus,
  TransferenciaComStatus,
  TransferenciasKPIs,
  Patrimonio,
  Categoria,
  Setor,
  Usuario,
  FiltrosTransferencia,
  OrdenacaoTransferencia,
  TransferenciasContextData
} from '../types/transferencias.types';

// ========================================
// CONTEXT & PROVIDER
// ========================================

const TransferenciasContext = createContext<TransferenciasContextData | undefined>(undefined);

// Cache configuration
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos

export const TransferenciasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ========================================
  // ESTADOS PRINCIPAIS
  // ========================================
  
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
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
  
  const [filtros, setFiltros] = useState<FiltrosTransferencia>({
    busca: '',
    status: 'todos',
    setorOrigem: 'todos',
    setorDestino: 'todos',
    patrimonio: 'todos',
    solicitante: 'todos',
    aprovador: 'todos',
    dataInicio: undefined,
    dataFim: undefined
  });

  const [ordenacao, setOrdenacao] = useState<OrdenacaoTransferencia>({
    campo: 'id',
    direcao: 'desc'
  });

  // ========================================
  // INFORMAÇÕES DO USUÁRIO LOGADO
  // ========================================
  
  const getUserInfo = useCallback(() => {
    const userId = parseInt(localStorage.getItem('id') || '0');
    const role = localStorage.getItem('role')?.toLowerCase() || '';
    const username = localStorage.getItem('username') || '';
    
    // Busca o usuário completo para pegar o setor_id
    const user = usuarios.find(u => u.id === userId);
    
    return {
      id: userId,
      username,
      role,
      setor_id: user?.setor_id
    };
  }, [usuarios]);

  // ========================================
  // CÁLCULO DE STATUS
  // ========================================
  
  const getTransferenciaStatus = useCallback((transferencia: Transferencia): TransferenciaStatus => {
    // Se foi rejeitada (assumindo que tem campo motivo_rejeicao ou similar)
    if ((transferencia as any).motivo_rejeicao) {
      return 'rejeitada';
    }
    
    // Se não tem aprovador → pendente
    if (!transferencia.aprovado_por) {
      return 'pendente';
    }
    
    // Se tem aprovador, verificar se patrimônio foi atualizado
    const patrimonio = patrimonios.find(p => p.id === transferencia.patrimonio_id);
    if (patrimonio) {
      const setorOk = patrimonio.setor_id === transferencia.setor_destino_id;
      const responsavelOk = patrimonio.responsavel_id === transferencia.responsavel_destino_id;
      
      if (setorOk && responsavelOk) {
        return 'concluida'; // Transferência efetivada
      }
    }
    
    return 'aprovada'; // Aprovada mas não efetivada
  }, [patrimonios]);

  // ========================================
  // VERIFICAÇÕES DE PERMISSÃO
  // ========================================
  
  const podeAprovar = useCallback((transferencia: Transferencia): boolean => {
    const { role, setor_id } = getUserInfo();
    
    if (role === 'administrador') return true;
    
    if (role === 'gestor') {
      // Gestor só aprova se for do setor origem ou destino
      return setor_id === transferencia.setor_origem_id ||
             setor_id === transferencia.setor_destino_id;
    }
    
    return false;
  }, [getUserInfo]);

  const podeEfetivar = useCallback((transferencia: Transferencia): boolean => {
    const { role } = getUserInfo();
    const status = getTransferenciaStatus(transferencia);
    
    // Só pode efetivar se estiver aprovada (não concluída)
    if (status !== 'aprovada') return false;
    
    return ['administrador', 'gestor'].includes(role);
  }, [getUserInfo, getTransferenciaStatus]);

  const verificarTransferenciaPendente = useCallback((patrimonio_id: number): boolean => {
    return transferencias.some(t => {
      const status = getTransferenciaStatus(t);
      return t.patrimonio_id === patrimonio_id && status === 'pendente';
    });
  }, [transferencias, getTransferenciaStatus]);

  // ========================================
  // FETCH DE DADOS
  // ========================================
  
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
      const [transferenciasData, patrimoniosData, categoriasData, setoresData, usuariosData] = await Promise.all([
        listTransferencias(),
        listPatrimonios(),
        listCategorias(),
        listSetores(),
        listUsuarios()
      ]);
      
      setTransferencias(transferenciasData || []);
      setPatrimonios(patrimoniosData || []);
      setCategorias(categoriasData || []);
      setSetores(setoresData || []);
      setUsuarios(usuariosData || []);
      setLastFetch(now);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.response?.data?.detail || 'Não foi possível carregar os dados. Verifique sua conexão.');
    } finally {
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
  
  const createTransferencia = useCallback(async (data: TransferenciaCreate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Adiciona o solicitante_id automaticamente
      const { id: solicitante_id } = getUserInfo();
      const payload = {
        ...data,
        solicitante_id,
        data_transferencia: new Date().toISOString().split('T')[0]
      };
      
      const novaTransferencia = await apiCreateTransferencia(payload);
      setTransferencias(prev => [...prev, novaTransferencia]);
      
      // Log de auditoria
      await createLog({
        acao: 'criar_transferencia',
        entidade: 'transferencia',
        entidade_id: novaTransferencia.id,
        detalhes: { patrimonio_id: data.patrimonio_id, motivo: data.motivo }
      });
      
      console.log('Transferência solicitada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao criar transferência:', err);
      setError(err.response?.data?.detail || 'Erro ao solicitar transferência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getUserInfo]);

  const updateTransferencia = useCallback(async (id: number, data: TransferenciaUpdate): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const transferenciaAtualizada = await apiUpdateTransferencia(id, data);
      
      setTransferencias(prev => 
        prev.map(t => t.id === id ? transferenciaAtualizada : t)
      );
      
      console.log('Transferência atualizada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar transferência:', err);
      setError(err.response?.data?.detail || 'Erro ao atualizar transferência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransferencia = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await apiDeleteTransferencia(id);
      
      setTransferencias(prev => prev.filter(t => t.id !== id));
      
      // Log de auditoria
      await createLog({
        acao: 'excluir_transferencia',
        entidade: 'transferencia',
        entidade_id: id,
        detalhes: {}
      });
      
      console.log('Transferência excluída com sucesso!');
    } catch (err: any) {
      console.error('Erro ao excluir transferência:', err);
      setError(err.response?.data?.detail || 'Erro ao excluir transferência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // FUNÇÕES ESPECIAIS DE APROVAÇÃO
  // ========================================
  
  const aprovarTransferencia = useCallback(async (
    id: number, 
    observacoes?: string, 
    efetivarAutomaticamente = false
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const { id: aprovador_id } = getUserInfo();
      
      // Atualiza a transferência com aprovação
      const updateData: TransferenciaUpdate = {
        aprovado_por: aprovador_id,
        observacoes,
        data_aprovacao: new Date().toISOString()
      };
      
      await updateTransferencia(id, updateData);
      
      // Log de auditoria
      await createLog({
        acao: 'aprovar_transferencia',
        entidade: 'transferencia',
        entidade_id: id,
        detalhes: { aprovador_id, observacoes }
      });
      
      // Se marcou para efetivar automaticamente
      if (efetivarAutomaticamente) {
        await efetivarTransferencia(id);
      }
      
      console.log('Transferência aprovada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao aprovar transferência:', err);
      throw err;
    }
  }, [getUserInfo, updateTransferencia]);

  const rejeitarTransferencia = useCallback(async (id: number, motivo: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const { id: rejeitador_id } = getUserInfo();
      
      // Atualiza a transferência com rejeição
      const updateData: any = {
        aprovado_por: rejeitador_id,
        motivo_rejeicao: motivo,
        data_aprovacao: new Date().toISOString()
      };
      
      await updateTransferencia(id, updateData);
      
      // Log de auditoria
      await createLog({
        acao: 'rejeitar_transferencia',
        entidade: 'transferencia',
        entidade_id: id,
        detalhes: { rejeitador_id, motivo }
      });
      
      console.log('Transferência rejeitada.');
    } catch (err: any) {
      console.error('Erro ao rejeitar transferência:', err);
      throw err;
    }
  }, [getUserInfo, updateTransferencia]);

  const efetivarTransferencia = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Busca a transferência
      const transferencia = transferencias.find(t => t.id === id);
      if (!transferencia) {
        throw new Error('Transferência não encontrada');
      }
      
      // Verifica se pode efetivar
      const status = getTransferenciaStatus(transferencia);
      if (status !== 'aprovada') {
        throw new Error('Apenas transferências aprovadas podem ser efetivadas');
      }
      
      // Atualiza o patrimônio com novo setor e responsável
      await apiUpdatePatrimonio(transferencia.patrimonio_id, {
        setor_id: transferencia.setor_destino_id,
        responsavel_id: transferencia.responsavel_destino_id
      });
      
      // Recarrega os patrimônios para refletir a mudança
      const patrimoniosAtualizados = await listPatrimonios();
      setPatrimonios(patrimoniosAtualizados || []);
      
      // Log de auditoria
      await createLog({
        acao: 'efetivar_transferencia',
        entidade: 'patrimonio',
        entidade_id: transferencia.patrimonio_id,
        detalhes: { 
          transferencia_id: id,
          novo_setor_id: transferencia.setor_destino_id,
          novo_responsavel_id: transferencia.responsavel_destino_id
        }
      });
      
      console.log('Transferência efetivada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao efetivar transferência:', err);
      setError(err.message || 'Erro ao efetivar transferência');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [transferencias, getTransferenciaStatus]);

  // ========================================
  // CÁLCULO DE KPIs
  // ========================================
  
  const kpis = useMemo((): TransferenciasKPIs => {
    const transferenciasComStatus = transferencias.map(t => ({
      ...t,
      status: getTransferenciaStatus(t)
    }));
    
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    const total = transferenciasComStatus.length;
    const pendentes = transferenciasComStatus.filter(t => t.status === 'pendente').length;
    
    const aprovadasMes = transferenciasComStatus.filter(t => {
      if (t.status !== 'aprovada' && t.status !== 'concluida') return false;
      if (!t.criado_em) return false;
      const data = new Date(t.criado_em);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).length;
    
    const rejeitadasMes = transferenciasComStatus.filter(t => {
      if (t.status !== 'rejeitada') return false;
      if (!t.criado_em) return false;
      const data = new Date(t.criado_em);
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    }).length;
    
    return {
      total,
      pendentes,
      aprovadasMes,
      rejeitadasMes
    };
  }, [transferencias, getTransferenciaStatus]);

  // ========================================
  // FILTRAGEM E ORDENAÇÃO
  // ========================================
  
  const transferenciasFiltradas = useMemo((): TransferenciaComStatus[] => {
    let filtradas = transferencias.map(t => ({
      ...t,
      status: getTransferenciaStatus(t)
    }));

    // Filtro de busca geral
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      filtradas = filtradas.filter(t => {
        const patrimonio = patrimonios.find(p => p.id === t.patrimonio_id);
        const nomePatrimonio = patrimonio?.nome.toLowerCase() || '';
        const motivo = t.motivo?.toLowerCase() || '';
        
        return nomePatrimonio.includes(busca) || motivo.includes(busca);
      });
    }

    // Filtro por status
    if (filtros.status !== 'todos') {
      filtradas = filtradas.filter(t => t.status === filtros.status);
    }

    // Filtro por setor origem
    if (filtros.setorOrigem !== 'todos') {
      const setorId = parseInt(filtros.setorOrigem);
      if (!isNaN(setorId)) {
        filtradas = filtradas.filter(t => t.setor_origem_id === setorId);
      }
    }

    // Filtro por setor destino
    if (filtros.setorDestino !== 'todos') {
      const setorId = parseInt(filtros.setorDestino);
      if (!isNaN(setorId)) {
        filtradas = filtradas.filter(t => t.setor_destino_id === setorId);
      }
    }

    // Filtro por patrimônio
    if (filtros.patrimonio !== 'todos') {
      const patrimonioId = parseInt(filtros.patrimonio);
      if (!isNaN(patrimonioId)) {
        filtradas = filtradas.filter(t => t.patrimonio_id === patrimonioId);
      }
    }

    // Filtro por solicitante
    if (filtros.solicitante !== 'todos') {
      const solicitanteId = parseInt(filtros.solicitante);
      if (!isNaN(solicitanteId)) {
        filtradas = filtradas.filter(t => t.solicitante_id === solicitanteId);
      }
    }

    // Filtro por aprovador
    if (filtros.aprovador !== 'todos') {
      const aprovadorId = parseInt(filtros.aprovador);
      if (!isNaN(aprovadorId)) {
        filtradas = filtradas.filter(t => t.aprovado_por === aprovadorId);
      }
    }

    // Filtro por período
    if (filtros.dataInicio) {
      filtradas = filtradas.filter(t => {
        if (!t.data_transferencia) return false;
        return new Date(t.data_transferencia) >= new Date(filtros.dataInicio!);
      });
    }
    
    if (filtros.dataFim) {
      filtradas = filtradas.filter(t => {
        if (!t.data_transferencia) return false;
        return new Date(t.data_transferencia) <= new Date(filtros.dataFim!);
      });
    }

    // Aplicar ordenação
    filtradas.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (ordenacao.campo) {
        case 'patrimonio_nome':
          aVal = patrimonios.find(p => p.id === a.patrimonio_id)?.nome || '';
          bVal = patrimonios.find(p => p.id === b.patrimonio_id)?.nome || '';
          break;
        case 'setor_origem_nome':
          aVal = setores.find(s => s.id === a.setor_origem_id)?.nome || '';
          bVal = setores.find(s => s.id === b.setor_origem_id)?.nome || '';
          break;
        case 'setor_destino_nome':
          aVal = setores.find(s => s.id === a.setor_destino_id)?.nome || '';
          bVal = setores.find(s => s.id === b.setor_destino_id)?.nome || '';
          break;
        case 'responsavel_origem_nome':
          aVal = usuarios.find(u => u.id === a.responsavel_origem_id)?.username || '';
          bVal = usuarios.find(u => u.id === b.responsavel_origem_id)?.username || '';
          break;
        case 'responsavel_destino_nome':
          aVal = usuarios.find(u => u.id === a.responsavel_destino_id)?.username || '';
          bVal = usuarios.find(u => u.id === b.responsavel_destino_id)?.username || '';
          break;
        case 'aprovador_nome':
          aVal = usuarios.find(u => u.id === a.aprovado_por)?.username || '';
          bVal = usuarios.find(u => u.id === b.aprovado_por)?.username || '';
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a[ordenacao.campo as keyof TransferenciaComStatus];
          bVal = b[ordenacao.campo as keyof TransferenciaComStatus];
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
  }, [transferencias, patrimonios, setores, usuarios, filtros, ordenacao, getTransferenciaStatus]);

  // ========================================
  // CONTEXT VALUE
  // ========================================
  
  const contextValue: TransferenciasContextData = {
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
    refreshData: () => fetchData(true)
  };

  return (
    <TransferenciasContext.Provider value={contextValue}>
      {children}
    </TransferenciasContext.Provider>
  );
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

/**
 * Tipos TypeScript para o módulo de Transferências
 * Sistema ControlHS
 */

// ========================================
// INTERFACES PRINCIPAIS
// ========================================

/**
 * Interface principal da Transferência
 * Representa uma movimentação de patrimônio entre setores/responsáveis
 */
export interface Transferencia {
  id: number;
  patrimonio_id: number;
  setor_origem_id?: number;
  setor_destino_id?: number;
  responsavel_origem_id?: number;
  responsavel_destino_id?: number;
  solicitante_id?: number;
  aprovado_por?: number;
  data_transferencia?: string;
  motivo?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Interface para criação de nova transferência
 * Payload enviado para POST /transferencias/
 */
export interface TransferenciaCreate {
  patrimonio_id: number;
  setor_origem_id?: number;
  setor_destino_id?: number;
  responsavel_origem_id?: number;
  responsavel_destino_id?: number;
  motivo: string;
  observacoes?: string;
}

/**
 * Interface para atualização de transferência
 * Payload enviado para PUT /transferencias/{id}
 */
export interface TransferenciaUpdate {
  aprovado_por?: number;
  observacoes?: string;
  data_aprovacao?: string;
  motivo_rejeicao?: string;
}

/**
 * Status calculado da transferência
 * NÃO existe na API - deve ser calculado no frontend
 */
export type TransferenciaStatus = 'pendente' | 'aprovada' | 'concluida' | 'rejeitada';

// ========================================
// INTERFACES DE APOIO
// ========================================

/**
 * Interface do Patrimônio (importada do módulo patrimônios)
 */
export interface Patrimonio {
  id: number;
  nome: string;
  descricao?: string;
  numero_serie?: string;
  categoria_id?: number;
  setor_id?: number;
  responsavel_id?: number;
  data_aquisicao?: string;
  valor_aquisicao?: number;
  valor_atual?: number;
  status?: 'ativo' | 'manutencao' | 'baixado';
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Interface da Categoria
 */
export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Interface do Setor
 */
export interface Setor {
  id: number;
  nome: string;
  descricao?: string;
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Interface do Usuário
 */
export interface Usuario {
  id: number;
  username: string;
  setor_id?: number;
  role?: {
    id: number;
    name: string;
  };
  role_name?: string;
  created_at?: string;
}

// ========================================
// INTERFACES DE FILTROS
// ========================================

/**
 * Interface para filtros da página de transferências
 */
export interface FiltrosTransferencia {
  busca: string;
  status: string; // 'todos' | 'pendente' | 'aprovada' | 'concluida' | 'rejeitada'
  setorOrigem: string;
  setorDestino: string;
  patrimonio: string;
  solicitante: string;
  aprovador: string;
  dataInicio?: string;
  dataFim?: string;
}

/**
 * Interface para ordenação da tabela
 */
export interface OrdenacaoTransferencia {
  campo: OrdenacaoCampo;
  direcao: 'asc' | 'desc';
}

/**
 * Type para campos de ordenação
 */
export type OrdenacaoCampo = 
  | 'id'
  | 'patrimonio_nome'
  | 'setor_origem_nome'
  | 'setor_destino_nome'
  | 'responsavel_origem_nome'
  | 'responsavel_destino_nome'
  | 'data_transferencia'
  | 'status'
  | 'aprovador_nome';

/**
 * Interface para paginação
 */
export interface Paginacao {
  paginaAtual: number;
  itensPorPagina: number;
  totalItens: number;
  totalPaginas: number;
}

// ========================================
// INTERFACES DO CONTEXT
// ========================================

/**
 * Interface do TransferenciasContext
 */
export interface TransferenciasContextData {
  // Dados principais
  transferencias: Transferencia[];
  patrimonios: Patrimonio[];
  categorias: Categoria[];
  setores: Setor[];
  usuarios: Usuario[];
  
  // Filtros
  filtros: FiltrosTransferencia;
  setFiltros: (filtros: FiltrosTransferencia) => void;
  
  // Ordenação
  ordenacao: OrdenacaoTransferencia;
  setOrdenacao: (ordenacao: OrdenacaoTransferencia) => void;
  
  // Estados
  loading: boolean;
  error: string | null;
  
  // Dados computados
  transferenciasFiltradas: TransferenciaComStatus[];
  
  // KPIs
  kpis: TransferenciasKPIs;
  
  // Funções CRUD
  createTransferencia: (data: TransferenciaCreate) => Promise<void>;
  updateTransferencia: (id: number, data: TransferenciaUpdate) => Promise<void>;
  deleteTransferencia: (id: number) => Promise<void>;
  
  // Funções especiais
  aprovarTransferencia: (id: number, observacoes?: string, efetivarAutomaticamente?: boolean) => Promise<void>;
  rejeitarTransferencia: (id: number, motivo: string) => Promise<void>;
  efetivarTransferencia: (id: number) => Promise<void>;
  
  // Funções de verificação
  getTransferenciaStatus: (transferencia: Transferencia) => TransferenciaStatus;
  podeAprovar: (transferencia: Transferencia) => boolean;
  podeEfetivar: (transferencia: Transferencia) => boolean;
  verificarTransferenciaPendente: (patrimonio_id: number) => boolean;
  
  // Atualização
  refreshData: () => Promise<void>;
}

// ========================================
// INTERFACES ESPECIAIS
// ========================================

/**
 * Interface para transferência com status calculado
 */
export interface TransferenciaComStatus extends Transferencia {
  status: TransferenciaStatus;
}

/**
 * Interface para KPIs de transferências
 */
export interface TransferenciasKPIs {
  total: number;
  pendentes: number;
  aprovadasMes: number;
  rejeitadasMes: number;
}

/**
 * Interface para dados do wizard de nova transferência
 */
export interface WizardTransferenciaData {
  // Step 1
  patrimonio_id?: number;
  patrimonio?: Patrimonio;
  
  // Step 2
  setor_destino_id?: number;
  responsavel_destino_id?: number;
  motivo?: string;
  
  // Dados automáticos
  setor_origem_id?: number;
  responsavel_origem_id?: number;
}

/**
 * Interface para exportação Excel
 */
export interface TransferenciaExportData {
  'ID': number;
  'Patrimônio': string;
  'Setor Origem': string;
  'Setor Destino': string;
  'Responsável Origem': string;
  'Responsável Destino': string;
  'Solicitante': string;
  'Data Solicitação': string;
  'Status': string;
  'Aprovador': string;
  'Data Aprovação': string;
  'Motivo': string;
}

// ========================================
// ENUMS E CONSTANTES
// ========================================

/**
 * Cores dos badges de status
 */
export const STATUS_COLORS: Record<TransferenciaStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
  aprovada: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
  concluida: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  rejeitada: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
};

/**
 * Labels para exibição dos status
 */
export const STATUS_LABELS: Record<TransferenciaStatus, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  concluida: 'Concluída',
  rejeitada: 'Rejeitada'
};

/**
 * Passos do wizard
 */
export enum WizardStep {
  SELECAO_PATRIMONIO = 1,
  DESTINO_TRANSFERENCIA = 2,
  CONFIRMACAO = 3
}

/**
 * Opções de itens por página
 */
export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// ========================================
// TYPES AUXILIARES
// ========================================

/**
 * Type para erros de validação
 */
export type ValidationErrors = Partial<Record<keyof TransferenciaCreate, string>>;

/**
 * Type para modo do modal
 */
export type ModalMode = 'create' | 'view' | 'approve' | 'reject' | null;

/**
 * Type para tipo de aprovação
 */
export type TipoAprovacao = 'aprovar' | 'rejeitar';

/**
 * Type para ação de confirmação
 */
export type ConfirmAction = {
  type: 'delete' | 'approve' | 'reject' | 'transfer';
  transferencia: Transferencia;
  callback?: () => void;
};

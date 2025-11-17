/**
 * Tipos TypeScript para o módulo de Baixas Patrimoniais
 * Sistema ControlHS
 *
 * Baixa = Registro de descarte, perda, venda ou doação de patrimônio
 */

// ========================================
// INTERFACES PRINCIPAIS
// ========================================

/**
 * Interface principal da Baixa
 * Representa uma baixa patrimonial (descarte, perda, venda, doação)
 */
export interface Baixa {
  id: number;
  patrimonio_id: number;
  tipo: TipoBaixa;
  motivo: string;
  aprovado_por?: number;
  data_aprovacao?: string;
  rejeitado_por?: number;
  data_rejeicao?: string;
  motivo_rejeicao?: string;
  observacoes?: string;
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Interface para criação de nova baixa
 * Payload enviado para POST /baixas/
 */
export interface BaixaCreate {
  patrimonio_id: number;
  tipo: string;
  motivo: string;
  aprovado_por?: number;
}

/**
 * Interface para anexo de baixa
 */
export interface AnexoBaixa {
  id: number;
  patrimonio_id: number;
  baixa_id: number;
  tipo: string;
  caminho_arquivo: string;
  descricao?: string;
  enviado_por: number;
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Interface para atualização de baixa
 * Payload enviado para PUT /baixas/{id}
 */
export interface BaixaUpdate {
  aprovado_por?: number;
  data_aprovacao?: string;
  observacoes?: string;
}

/**
 * Interface para aprovar baixa
 */
export interface BaixaAprovar {
  observacoes?: string;
}

/**
 * Interface para rejeitar baixa
 */
export interface BaixaRejeitar {
  motivo_rejeicao: string;
}

// ========================================
// ENUMS E TYPES
// ========================================

/**
 * Tipos de baixa possíveis
 */
export type TipoBaixa = 'descarte' | 'perda' | 'venda' | 'doacao';

/**
 * Status calculado da baixa
 */
export type BaixaStatus = 'pendente' | 'aprovada' | 'rejeitada';

// ========================================
// INTERFACES DE APOIO
// ========================================

/**
 * Interface do Patrimônio
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
 * Interface da Categoria
 */
export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  criado_em?: string;
  atualizado_em?: string;
}

// ========================================
// INTERFACES DE FILTROS
// ========================================

/**
 * Interface para filtros da página de baixas
 */
export interface FiltrosBaixa {
  busca: string;
  status: string; // 'todos' | 'pendente' | 'aprovada' | 'rejeitada'
  tipo: string; // 'todos' | 'descarte' | 'perda' | 'venda' | 'doacao'
  patrimonio: string;
  solicitante: string;
  aprovador: string;
  dataInicio?: string;
  dataFim?: string;
}

/**
 * Interface para ordenação da tabela
 */
export interface OrdenacaoBaixa {
  campo: OrdenacaoCampo;
  direcao: 'asc' | 'desc';
}

/**
 * Type para campos de ordenação
 */
export type OrdenacaoCampo =
  | 'id'
  | 'patrimonio_nome'
  | 'tipo_baixa'
  | 'data_baixa'
  | 'data_aprovacao'
  | 'status'
  | 'solicitante_nome'
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
 * Interface do BaixasContext
 */
export interface BaixasContextData {
  // Dados principais
  baixas: Baixa[];
  patrimonios: Patrimonio[];
  categorias: Categoria[];
  setores: Setor[];
  usuarios: Usuario[];

  // Filtros
  filtros: FiltrosBaixa;
  setFiltros: (filtros: FiltrosBaixa) => void;

  // Ordenação
  ordenacao: OrdenacaoBaixa;
  setOrdenacao: (ordenacao: OrdenacaoBaixa) => void;

  // Estados
  loading: boolean;
  error: string | null;

  // Dados computados
  baixasFiltradas: BaixaComStatus[];

  // KPIs
  kpis: BaixasKPIs;

  // Funções CRUD
  createBaixa: (data: BaixaCreate) => Promise<void>;
  updateBaixa: (id: number, data: BaixaUpdate) => Promise<void>;
  deleteBaixa: (id: number) => Promise<void>;

  // Funções especiais
  aprovarBaixa: (id: number, observacoes?: string) => Promise<void>;
  rejeitarBaixa: (id: number, motivo: string) => Promise<void>;

  // Funções de verificação
  getBaixaStatus: (baixa: Baixa) => BaixaStatus;
  podeAprovar: (baixa: Baixa) => boolean;

  // Atualização
  refreshData: () => Promise<void>;
}

// ========================================
// INTERFACES ESPECIAIS
// ========================================

/**
 * Interface para baixa com status calculado
 */
export interface BaixaComStatus extends Baixa {
  status: BaixaStatus;
}

/**
 * Interface para KPIs de baixas
 */
export interface BaixasKPIs {
  total: number;
  pendentes: number;
  aprovadasMes: number;
  rejeitadasMes: number;
  valorTotalMes: number;
}

/**
 * Interface para exportação Excel
 */
export interface BaixaExportData {
  ID: number;
  Patrimônio: string;
  'Tipo de Baixa': string;
  Motivo: string;
  Status: string;
  Aprovador: string;
}

// ========================================
// CONSTANTES E LABELS
// ========================================

/**
 * Cores dos badges de status
 */
export const STATUS_COLORS: Record<BaixaStatus, string> = {
  pendente:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
  aprovada:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  rejeitada: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
};

/**
 * Labels para exibição dos status
 */
export const STATUS_LABELS: Record<BaixaStatus, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
};

/**
 * Labels para tipos de baixa
 */
export const TIPO_BAIXA_LABELS: Record<TipoBaixa, string> = {
  descarte: 'Descarte',
  perda: 'Perda',
  venda: 'Venda',
  doacao: 'Doação',
};

/**
 * Cores para tipos de baixa
 */
export const TIPO_BAIXA_COLORS: Record<TipoBaixa, string> = {
  descarte: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-400',
  perda: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
  venda: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  doacao: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
};

/**
 * Opções de itens por página
 */
export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// ========================================
// HELPERS DE VALIDAÇÃO
// ========================================

/**
 * Helper: Verifica se baixa está pendente
 */
export function isBaixaPendente(b: Baixa): boolean {
  return !b.aprovado_por;
}

/**
 * Helper: Verifica se baixa está aprovada
 */
export function isBaixaAprovada(b: Baixa): boolean {
  return !!b.aprovado_por;
}

/**
 * Helper: Calcula status da baixa
 */
export function calcularStatusBaixa(b: Baixa): BaixaStatus {
  if (b.rejeitado_por || b.data_rejeicao) {
    return 'rejeitada';
  }
  if (b.aprovado_por || b.data_aprovacao) {
    return 'aprovada';
  }
  return 'pendente';
}

/**
 * Type para erros de validação
 */
export type ValidationErrors = Partial<Record<keyof BaixaCreate, string>>;

/**
 * Type para modo do modal
 */
export type ModalMode = 'create' | 'view' | 'approve' | 'reject' | null;

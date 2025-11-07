/**
 * Tipos TypeScript para o módulo de Patrimônios
 * Sistema ControlHS
 */

// ========================================
// INTERFACES PRINCIPAIS
// ========================================

/**
 * Interface principal do Patrimônio
 * Representa um bem patrimonial completo retornado pela API
 */
export interface Patrimonio {
  id: number;
  nome: string;
  descricao?: string;
  numero_serie?: string;
  categoria_id?: number;
  setor_id?: number;
  responsavel_id?: number;
  data_aquisicao?: string; // formato: YYYY-MM-DD
  valor_aquisicao?: number;
  valor_atual?: number;
  status?: 'ativo' | 'manutencao' | 'baixado';
  criado_em?: string;
  atualizado_em?: string;
}

/**
 * Interface para criação de novo patrimônio
 * Payload enviado para POST /patrimonios/
 */
export interface PatrimonioCreate {
  nome: string; // obrigatório
  descricao?: string;
  numero_serie?: string;
  categoria_id?: number;
  setor_id?: number;
  responsavel_id?: number;
  data_aquisicao?: string;
  valor_aquisicao?: number;
  valor_atual?: number;
  status?: 'ativo' | 'manutencao' | 'baixado';
}

/**
 * Interface para atualização de patrimônio
 * Payload enviado para PUT /patrimonios/{id}
 */
export interface PatrimonioUpdate {
  nome?: string;
  descricao?: string;
  numero_serie?: string;
  categoria_id?: number;
  setor_id?: number;
  responsavel_id?: number;
  data_aquisicao?: string;
  valor_aquisicao?: number;
  valor_atual?: number;
  status?: 'ativo' | 'manutencao' | 'baixado';
}

// ========================================
// INTERFACES DE APOIO
// ========================================

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
  role?: {
    id: number;
    name: string;
  };
  created_at?: string;
}

// ========================================
// INTERFACES DE FILTROS
// ========================================

/**
 * Interface para filtros da página de patrimônios
 */
export interface FiltrosPatrimonio {
  busca: string;
  categoria: string;
  setor: string;
  status: string;
  responsavel: string;
  dataInicio?: string;
  dataFim?: string;
}

/**
 * Interface para ordenação da tabela
 */
export interface OrdenacaoPatrimonio {
  campo: OrdenacaoCampo;
  direcao: 'asc' | 'desc';
}

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
 * Interface do PatrimoniosContext
 */
export interface PatrimoniosContextData {
  // Dados principais
  patrimonios: Patrimonio[];
  categorias: Categoria[];
  setores: Setor[];
  usuarios: Usuario[];

  // Filtros
  filtros: FiltrosPatrimonio;
  setFiltros: (filtros: FiltrosPatrimonio) => void;

  // Ordenação
  ordenacao: OrdenacaoPatrimonio;
  setOrdenacao: (ordenacao: OrdenacaoPatrimonio) => void;

  // Estados
  loading: boolean;
  error: string | null;

  // Dados computados
  patrimoniosFiltrados: Patrimonio[];

  // Funções CRUD
  createPatrimonio: (data: PatrimonioCreate) => Promise<void>;
  updatePatrimonio: (id: number, data: PatrimonioUpdate) => Promise<void>;
  deletePatrimonio: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

// ========================================
// ENUMS E CONSTANTES
// ========================================

/**
 * Status possíveis de um patrimônio
 */
export enum StatusPatrimonio {
  ATIVO = 'ativo',
  MANUTENCAO = 'manutencao',
  BAIXADO = 'baixado',
}

/**
 * Labels para exibição dos status
 */
export const STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativo',
  manutencao: 'Em Manutenção',
  baixado: 'Baixado',
};

/**
 * Cores dos badges de status
 */
export const STATUS_COLORS: Record<string, string> = {
  ativo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  manutencao:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  baixado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

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
export type ValidationErrors = Partial<Record<keyof PatrimonioCreate, string>>;

/**
 * Type para modo do modal
 */
export type ModalMode = 'create' | 'edit' | 'view' | null;

export type OrdenacaoCampo =
  | keyof Patrimonio
  | 'categoria_nome'
  | 'setor_nome'
  | 'responsavel_nome';

/**
 * Type para exportação Excel
 */
export interface PatrimonioExportData {
  ID: number;
  Nome: string;
  'Número de Série': string;
  Categoria: string;
  Setor: string;
  Responsável: string;
  'Data Aquisição': string;
  'Valor Aquisição': string;
  'Valor Atual': string;
  Depreciação: string;
  Status: string;
}

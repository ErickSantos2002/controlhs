// ========================================
// 📜 TYPES - LOGS
// ========================================

/**
 * Enum para tipos de ações em logs
 */
export enum LogAcao {
  CRIACAO = 'Criação',
  ATUALIZACAO = 'Atualização',
  EXCLUSAO = 'Exclusão',
  APROVACAO = 'Aprovação',
  REJEICAO = 'Rejeição',
  TRANSFERENCIA = 'Transferência',
  BAIXA = 'Baixa',
  ARQUIVAMENTO = 'Arquivamento',
  LOGIN = 'Login',
  LOGOUT = 'Logout',
}

/**
 * Enum para tipos de entidades
 */
export enum LogEntidade {
  PATRIMONIOS = 'patrimonios',
  USERS = 'users',
  TRANSFERENCIAS = 'transferencias',
  BAIXAS = 'baixas',
  INVENTARIOS = 'inventarios',
  CATEGORIAS = 'categorias',
  SETORES = 'setores',
  ANEXOS = 'anexos',
}

/**
 * Interface para detalhes do log (antes/depois das mudanças)
 */
export interface LogDetalhes {
  antes?: Record<string, any>;
  depois?: Record<string, any>;
  novo_registro?: Record<string, any>;
  registro_removido?: Record<string, any>;
  motivo?: string;
  observacoes?: string;
  ip?: string;
  user_agent?: string;
  patrimonio_id?: number;
  transferencia_id?: number;
  baixa_id?: number;
  [key: string]: any; // Permite campos adicionais
}

/**
 * Interface principal do Log
 */
export interface Log {
  id: number;
  acao: string;
  entidade: string;
  entidade_id: number;
  usuario_id: number;
  usuario: string;
  criado_em: string; // ISO datetime string
  detalhes: LogDetalhes;
}

/**
 * Interface para criar um novo log
 */
export interface LogCreate {
  acao: string;
  entidade: string;
  entidade_id: number;
  detalhes: LogDetalhes;
}

/**
 * Interface para filtros de logs
 */
export interface FiltrosLog {
  busca?: string;
  entidade?: string;
  acao?: string;
  usuario?: string;
  dataInicio?: string; // ISO date string
  dataFim?: string; // ISO date string
}

/**
 * Interface para resposta paginada da API
 */
export interface LogsPaginados {
  total: number;
  pagina: number;
  limite: number;
  logs: Log[];
}

/**
 * Interface para paginação local
 */
export interface LogPaginacao {
  paginaAtual: number;
  itensPorPagina: number;
  totalPaginas: number;
  totalRegistros: number;
}

/**
 * Interface do contexto de Logs
 */
export interface LogsContextData {
  logs: Log[];
  logsFiltrados: Log[];
  filtros: FiltrosLog;
  setFiltros: (filtros: FiltrosLog) => void;
  loading: boolean;
  error: string | null;
  paginacao: LogPaginacao;
  setPaginacao: (paginacao: Partial<LogPaginacao>) => void;
  refreshLogs: () => Promise<void>;
  buscarLogs: (filtros?: FiltrosLog) => Promise<void>;
}

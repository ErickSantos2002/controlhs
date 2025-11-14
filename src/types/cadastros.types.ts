/**
 * Tipos TypeScript para o módulo de Cadastros Básicos
 * Sistema ControlHS
 */

// ========================================
// INTERFACES PRINCIPAIS
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
 * Interface para criação de nova categoria
 */
export interface CategoriaCreate {
  nome: string;
  descricao?: string;
}

/**
 * Interface para atualização de categoria
 */
export interface CategoriaUpdate {
  nome?: string;
  descricao?: string;
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
 * Interface para criação de novo setor
 */
export interface SetorCreate {
  nome: string;
  descricao?: string;
}

/**
 * Interface para atualização de setor
 */
export interface SetorUpdate {
  nome?: string;
  descricao?: string;
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
 * Interface para criação de novo usuário
 */
export interface UsuarioCreate {
  username: string;
  password: string;
  role_name?: string;
  setor_id?: number;
}

/**
 * Interface para atualização de usuário
 */
export interface UsuarioUpdate {
  username?: string;
  password?: string;
  role_name?: string;
  setor_id?: number;
}

// ========================================
// INTERFACES DO CONTEXT
// ========================================

/**
 * Interface do CadastrosContext
 */
export interface CadastrosContextData {
  // Dados
  categorias: Categoria[];
  setores: Setor[];
  usuarios: Usuario[];

  // Estados
  loading: boolean;
  error: string | null;

  // Funções CRUD - Categorias
  createCategoria: (data: CategoriaCreate) => Promise<void>;
  updateCategoria: (id: number, data: CategoriaUpdate) => Promise<void>;
  deleteCategoria: (id: number) => Promise<void>;

  // Funções CRUD - Setores
  createSetor: (data: SetorCreate) => Promise<void>;
  updateSetor: (id: number, data: SetorUpdate) => Promise<void>;
  deleteSetor: (id: number) => Promise<void>;

  // Funções CRUD - Usuários
  createUsuario: (data: UsuarioCreate) => Promise<void>;
  updateUsuario: (id: number, data: UsuarioUpdate) => Promise<void>;
  deleteUsuario: (id: number) => Promise<void>;
  updateUsuarioPassword: (id: number, novaSenha: string) => Promise<void>;

  // Atualização
  refreshData: () => Promise<void>;
}

// ========================================
// TYPES AUXILIARES
// ========================================

/**
 * Type para modo do modal
 */
export type ModalMode = 'create' | 'edit' | 'view' | null;

/**
 * Type para identificar a aba ativa
 */
export type TipoAba = 'categorias' | 'setores' | 'usuarios';

/**
 * Interface para filtros de busca
 */
export interface FiltrosCadastros {
  busca: string;
}

/**
 * Type para campo de ordenação
 */
export type OrdenacaoCampo = 'id' | 'nome' | 'criado_em' | 'username' | 'created_at';

/**
 * Type para direção de ordenação
 */
export type OrdenacaoDirecao = 'asc' | 'desc';

/**
 * Interface para ordenação
 */
export interface Ordenacao {
  campo: OrdenacaoCampo;
  direcao: OrdenacaoDirecao;
}

// ========================================
// ENUMS E CONSTANTES
// ========================================

/**
 * Roles disponíveis no sistema
 */
export const ROLES = [
  'Administrador',
  'Gerente', 
  'Gestor',
  'Usuário'
] as const;

/**
 * Type para nome de role
 */
export type RoleName = typeof ROLES[number];

/**
 * Cores dos badges de role
 */
export const ROLE_COLORS: Record<RoleName, string> = {
  'Administrador': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400',
  'Gerente': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
  'Gestor': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  'Usuário': 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-400',
};

/**
 * Type para erros de validação
 */
export type ValidationErrors = Partial<Record<string, string>>;

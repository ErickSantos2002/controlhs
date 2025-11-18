// ========================================
// 📦 TIPOS DE INVENTÁRIO (Nova Estrutura)
// ========================================

/**
 * Status possíveis de uma sessão de inventário
 */
export type StatusInventario = 'em_andamento' | 'concluido' | 'cancelado';

/**
 * Tipo de inventário (filtros aplicados)
 */
export type TipoInventario = 'geral' | 'por_setor' | 'por_categoria';

/**
 * Situação de um item dentro do inventário
 */
export type SituacaoItem =
  | 'encontrado'
  | 'nao_encontrado'
  | 'divergencia'
  | 'conferido';

// ========================================
// SESSÃO DE INVENTÁRIO
// ========================================

/**
 * Representa uma sessão de inventário completa
 */
export interface Inventario {
  id: number;
  titulo: string;
  descricao?: string | null;
  tipo: TipoInventario;
  status: StatusInventario;
  responsavel_id?: number | null;
  filtro_setor_id?: number | null;
  filtro_categoria_id?: number | null;
  data_inicio: string;
  data_fim?: string | null;
  criado_em: string;
  atualizado_em: string;
}

/**
 * Payload para criar uma nova sessão de inventário
 */
export interface InventarioCreate {
  titulo: string;
  descricao?: string | null;
  tipo?: TipoInventario;
  filtro_setor_id?: number | null;
  filtro_categoria_id?: number | null;
  responsavel_id?: number | null;
}

/**
 * Payload para atualizar uma sessão de inventário
 */
export interface InventarioUpdate {
  titulo?: string | null;
  descricao?: string | null;
  status?: StatusInventario | null;
  responsavel_id?: number | null;
}

/**
 * Inventário com todos os itens incluídos
 */
export interface InventarioComItens extends Inventario {
  itens: ItemInventario[];
}

/**
 * Payload para finalizar inventário
 */
export interface InventarioFinalizar {
  observacoes_finais?: string | null;
}

// ========================================
// ITENS DO INVENTÁRIO
// ========================================

/**
 * Representa um item dentro de uma sessão de inventário
 */
export interface ItemInventario {
  id: number;
  inventario_id: number;
  patrimonio_id: number;
  situacao: SituacaoItem;
  observacoes?: string | null;
  conferido_por?: number | null;
  data_conferencia?: string | null;
  criado_em: string;
  atualizado_em: string;
}

/**
 * Payload para adicionar um item ao inventário
 */
export interface ItemInventarioCreate {
  patrimonio_id: number;
  observacoes?: string | null;
  situacao?: SituacaoItem;
}

/**
 * Payload para adicionar múltiplos itens de uma vez
 */
export interface ItemInventarioBulkCreate {
  patrimonio_ids: number[];
}

/**
 * Payload para atualizar (conferir) um item
 */
export interface ItemInventarioUpdate {
  situacao?: SituacaoItem | null;
  observacoes?: string | null;
}

// ========================================
// ESTATÍSTICAS E KPIs
// ========================================

/**
 * Estatísticas de progresso do inventário
 */
export interface InventarioStats {
  total_itens: number;
  encontrados: number;
  nao_encontrados: number;
  divergencias: number;
  conferidos: number;
  pendentes: number;
}

/**
 * KPIs calculados para o dashboard
 */
export interface InventariosKPIs {
  total: number;
  em_andamento: number;
  concluidos: number;
  cancelados: number;
}

// ========================================
// FILTROS
// ========================================

/**
 * Filtros disponíveis para listagem de inventários
 */
export interface FiltrosInventario {
  busca: string;
  status: string;
  tipo: string;
  responsavel_id: string;
  data_inicio: string;
  data_fim: string;
}

/**
 * Filtros para itens de um inventário
 */
export interface FiltrosItensInventario {
  busca: string;
  situacao: string;
}

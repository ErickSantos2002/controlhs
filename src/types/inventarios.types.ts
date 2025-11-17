// ========================================
// 📦 TIPOS DE INVENTÁRIO
// ========================================

/**
 * Representa um registro de inventário no sistema
 */
export interface Inventario {
  id: number;
  patrimonio_id: number;
  responsavel_id?: number | null;
  situacao: string; // Exemplos: "encontrado", "não encontrado", "divergência", "conferido"
  observacoes?: string | null;
  data_verificacao?: string | null;
  criado_em?: string | null;
  atualizado_em?: string | null;
}

/**
 * Payload para criar um novo registro de inventário
 */
export interface InventarioCreate {
  patrimonio_id: number;
  responsavel_id?: number | null;
  situacao: string;
  observacoes?: string | null;
}

/**
 * Payload para atualizar um registro de inventário
 */
export interface InventarioUpdate {
  situacao?: string | null;
  observacoes?: string | null;
  responsavel_id?: number | null;
}

/**
 * Filtros disponíveis para listagem de inventários
 */
export interface FiltrosInventario {
  busca: string;
  situacao: string;
  responsavel_id: string;
  data_inicio: string;
  data_fim: string;
}

/**
 * Status possíveis de um item no inventário
 */
export type SituacaoInventario =
  | 'encontrado'
  | 'nao_encontrado'
  | 'divergencia'
  | 'conferido'
  | 'pendente';

/**
 * KPIs calculados para o dashboard de inventários
 */
export interface InventariosKPIs {
  total: number;
  encontrados: number;
  naoEncontrados: number;
  divergencias: number;
  conferidos: number;
  pendentes: number;
  percentualConferido: number;
}

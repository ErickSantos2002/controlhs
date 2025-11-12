/**
 * Tipos TypeScript para o módulo de Patrimônios
 * Sistema ControlHS
 */
// ========================================
// ENUMS E CONSTANTES
// ========================================
/**
 * Status possíveis de um patrimônio
 */
export var StatusPatrimonio;
(function (StatusPatrimonio) {
    StatusPatrimonio["ATIVO"] = "ativo";
    StatusPatrimonio["MANUTENCAO"] = "manutencao";
    StatusPatrimonio["BAIXADO"] = "baixado";
})(StatusPatrimonio || (StatusPatrimonio = {}));
/**
 * Labels para exibição dos status
 */
export const STATUS_LABELS = {
    ativo: 'Ativo',
    manutencao: 'Em Manutenção',
    baixado: 'Baixado',
};
/**
 * Cores dos badges de status
 */
export const STATUS_COLORS = {
    ativo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    manutencao: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    baixado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};
/**
 * Opções de itens por página
 */
export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

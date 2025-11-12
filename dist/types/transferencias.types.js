/**
 * Tipos TypeScript para o módulo de Transferências
 * Sistema ControlHS
 *
 * 🆕 ATUALIZADO: Novos campos da API
 * - solicitante_id, efetivada, data_efetivacao
 * - motivo_rejeicao, data_aprovacao, observacoes
 */
// ========================================
// ENUMS E CONSTANTES
// ========================================
/**
 * Cores dos badges de status
 */
export const STATUS_COLORS = {
    pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
    aprovada: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    concluida: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
    rejeitada: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
};
/**
 * Labels para exibição dos status
 */
export const STATUS_LABELS = {
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    concluida: 'Concluída',
    rejeitada: 'Rejeitada',
};
/**
 * Passos do wizard
 */
export var WizardStep;
(function (WizardStep) {
    WizardStep[WizardStep["SELECAO_PATRIMONIO"] = 1] = "SELECAO_PATRIMONIO";
    WizardStep[WizardStep["DESTINO_TRANSFERENCIA"] = 2] = "DESTINO_TRANSFERENCIA";
    WizardStep[WizardStep["CONFIRMACAO"] = 3] = "CONFIRMACAO";
})(WizardStep || (WizardStep = {}));
/**
 * Opções de itens por página
 */
export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
// ========================================
// 🆕 HELPERS DE VALIDAÇÃO
// ========================================
/**
 * Helper: Verifica se transferência está pendente
 */
export function isTransferenciaPendente(t) {
    return !t.aprovado_por && !t.motivo_rejeicao && !t.efetivada;
}
/**
 * Helper: Verifica se transferência está aprovada (mas não efetivada)
 */
export function isTransferenciaAprovada(t) {
    return !!t.aprovado_por && !t.efetivada && !t.motivo_rejeicao;
}
/**
 * Helper: Verifica se transferência está concluída (efetivada)
 */
export function isTransferenciaConcluida(t) {
    return t.efetivada;
}
/**
 * Helper: Verifica se transferência está rejeitada
 */
export function isTransferenciaRejeitada(t) {
    return !!t.motivo_rejeicao;
}
/**
 * Helper: Calcula status da transferência
 * ✅ Nova lógica baseada em campos fixos
 */
export function calcularStatusTransferencia(t) {
    // 1. Rejeitada tem prioridade
    if (t.motivo_rejeicao) {
        return 'rejeitada';
    }
    // 2. Se foi efetivada, está concluída
    if (t.efetivada) {
        return 'concluida';
    }
    // 3. Se tem aprovador, está aprovada
    if (t.aprovado_por) {
        return 'aprovada';
    }
    // 4. Caso contrário, pendente
    return 'pendente';
}

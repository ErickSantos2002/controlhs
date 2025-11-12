import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X, Package, ArrowRight, Building, User, Calendar, FileText, CheckCircle, XCircle, Clock, Info, Check, ArrowRightLeft, Hash, } from 'lucide-react';
import { useTransferencias } from '../context/TransferenciasContext';
import { STATUS_LABELS, } from '../types/transferencias.types';
const TransferenciaDetalhes = ({ isOpen, onClose, transferencia, onAprovar, onRejeitar, onEfetivar, }) => {
    const { patrimonios, setores, usuarios, getTransferenciaStatus, podeAprovar, podeEfetivar, } = useTransferencias();
    if (!isOpen || !transferencia)
        return null;
    // ========================================
    // HELPERS
    // ========================================
    const status = getTransferenciaStatus(transferencia);
    const canApprove = status === 'pendente' && podeAprovar(transferencia);
    const canReject = status === 'pendente' && podeAprovar(transferencia);
    const canTransfer = podeEfetivar(transferencia);
    const formatDate = (date) => {
        if (!date)
            return 'N/A';
        return new Date(date).toLocaleDateString('pt-BR');
    };
    const formatDateTime = (date) => {
        if (!date)
            return 'N/A';
        return new Date(date).toLocaleString('pt-BR');
    };
    const getPatrimonioNome = () => {
        const patrimonio = patrimonios.find((p) => p.id === transferencia.patrimonio_id);
        return (patrimonio === null || patrimonio === void 0 ? void 0 : patrimonio.nome) || 'N/A';
    };
    const getPatrimonioNumeroSerie = () => {
        const patrimonio = patrimonios.find((p) => p.id === transferencia.patrimonio_id);
        return (patrimonio === null || patrimonio === void 0 ? void 0 : patrimonio.numero_serie) || '';
    };
    const getPatrimonioValor = () => {
        const patrimonio = patrimonios.find((p) => p.id === transferencia.patrimonio_id);
        const valor = (patrimonio === null || patrimonio === void 0 ? void 0 : patrimonio.valor_atual) || 0;
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };
    const getSetorOrigemNome = () => {
        const setor = setores.find((s) => s.id === transferencia.setor_origem_id);
        return (setor === null || setor === void 0 ? void 0 : setor.nome) || 'N/A';
    };
    const getSetorDestinoNome = () => {
        const setor = setores.find((s) => s.id === transferencia.setor_destino_id);
        return (setor === null || setor === void 0 ? void 0 : setor.nome) || 'N/A';
    };
    const getResponsavelOrigemNome = () => {
        const user = usuarios.find((u) => u.id === transferencia.responsavel_origem_id);
        return (user === null || user === void 0 ? void 0 : user.username) || 'N/A';
    };
    const getResponsavelDestinoNome = () => {
        const user = usuarios.find((u) => u.id === transferencia.responsavel_destino_id);
        return (user === null || user === void 0 ? void 0 : user.username) || 'N/A';
    };
    const getSolicitanteNome = () => {
        const user = usuarios.find((u) => u.id === transferencia.solicitante_id);
        return (user === null || user === void 0 ? void 0 : user.username) || 'N/A';
    };
    const getAprovadorNome = () => {
        if (!transferencia.aprovado_por)
            return 'N/A';
        const user = usuarios.find((u) => u.id === transferencia.aprovado_por);
        return (user === null || user === void 0 ? void 0 : user.username) || 'N/A';
    };
    const getStatusIcon = () => {
        switch (status) {
            case 'pendente':
                return _jsx(Clock, { className: "w-5 h-5 text-yellow-500" });
            case 'aprovada':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-blue-500" });
            case 'concluida':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-green-500" });
            case 'rejeitada':
                return _jsx(XCircle, { className: "w-5 h-5 text-red-500" });
            default:
                return null;
        }
    };
    // ========================================
    // RENDER
    // ========================================
    return (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity", onClick: onClose }), _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsxs("div", { className: "relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: ["Detalhes da Transfer\u00EAncia #", transferencia.id] }), _jsxs("span", { className: `inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${status === 'pendente'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                                                : status === 'aprovada'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400'
                                                    : status === 'concluida'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'}`, children: [getStatusIcon(), STATUS_LABELS[status]] })] }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", children: _jsx(X, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" }) })] }), _jsxs("div", { className: "p-6 max-h-[calc(100vh-200px)] overflow-y-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Package, { className: "w-5 h-5 text-blue-600 dark:text-blue-400" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200", children: "Patrim\u00F4nio" })] }), _jsx("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Nome" }), _jsx("p", { className: "text-lg font-medium text-gray-900 dark:text-gray-100", children: getPatrimonioNome() })] }), getPatrimonioNumeroSerie() && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Hash, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "NS:" }), _jsx("span", { className: "text-gray-900 dark:text-gray-100", children: getPatrimonioNumeroSerie() })] })), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Valor Atual" }), _jsx("p", { className: "text-base font-medium text-gray-900 dark:text-gray-100", children: getPatrimonioValor() })] })] }) })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(ArrowRightLeft, { className: "w-5 h-5 text-purple-600 dark:text-purple-400" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200", children: "Movimenta\u00E7\u00E3o" })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-4", children: [(transferencia.setor_origem_id ||
                                                    transferencia.setor_destino_id) && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Building, { className: "w-4 h-4 text-gray-400" }), _jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Setor" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex-1 text-center", children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: "Origem" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: getSetorOrigemNome() })] }), _jsx(ArrowRight, { className: "w-5 h-5 text-blue-500 dark:text-blue-400" }), _jsxs("div", { className: "flex-1 text-center", children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: "Destino" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: getSetorDestinoNome() })] })] })] })), (transferencia.responsavel_origem_id ||
                                                    transferencia.responsavel_destino_id) && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(User, { className: "w-4 h-4 text-gray-400" }), _jsx("p", { className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Respons\u00E1vel" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex-1 text-center", children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: "Origem" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: getResponsavelOrigemNome() })] }), _jsx(ArrowRight, { className: "w-5 h-5 text-blue-500 dark:text-blue-400" }), _jsxs("div", { className: "flex-1 text-center", children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: "Destino" }), _jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: getResponsavelDestinoNome() })] })] })] }))] })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(FileText, { className: "w-5 h-5 text-orange-600 dark:text-orange-400" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200", children: "Solicita\u00E7\u00E3o" })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Solicitante" }), _jsx("p", { className: "text-base font-medium text-gray-900 dark:text-gray-100", children: getSolicitanteNome() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Data da Solicita\u00E7\u00E3o" }), _jsx("p", { className: "text-base text-gray-700 dark:text-gray-300", children: formatDateTime(transferencia.criado_em) })] })] }), transferencia.motivo && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Motivo" }), _jsx("p", { className: "text-base text-gray-700 dark:text-gray-300 mt-1", children: transferencia.motivo })] }))] })] }), transferencia.aprovado_por && (_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [status === 'rejeitada' ? (_jsx(XCircle, { className: "w-5 h-5 text-red-600 dark:text-red-400" })) : (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 dark:text-green-400" })), _jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200", children: status === 'rejeitada' ? 'Rejeição' : 'Aprovação' })] }), _jsxs("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: status === 'rejeitada'
                                                                        ? 'Rejeitado por'
                                                                        : 'Aprovado por' }), _jsx("p", { className: "text-base font-medium text-gray-900 dark:text-gray-100", children: getAprovadorNome() })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Data da", ' ', status === 'rejeitada' ? 'Rejeição' : 'Aprovação'] }), _jsx("p", { className: "text-base text-gray-700 dark:text-gray-300", children: formatDateTime(transferencia.data_aprovacao) })] })] }), transferencia.observacoes && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Observa\u00E7\u00F5es" }), _jsx("p", { className: "text-base text-gray-700 dark:text-gray-300 mt-1", children: transferencia.observacoes })] })), status === 'rejeitada' && transferencia.motivo_rejeicao && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Motivo da Rejei\u00E7\u00E3o" }), _jsx("p", { className: "text-base text-gray-700 dark:text-gray-300 mt-1", children: transferencia.motivo_rejeicao })] }))] })] })), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(Calendar, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 dark:text-gray-200", children: "Hist\u00F3rico" })] }), _jsx("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-1", children: _jsx("div", { className: "w-2 h-2 rounded-full bg-gray-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Solicita\u00E7\u00E3o Criada" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: formatDateTime(transferencia.criado_em) })] })] }), transferencia.data_aprovacao && (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-1", children: _jsx("div", { className: `w-2 h-2 rounded-full ${status === 'rejeitada'
                                                                        ? 'bg-red-500'
                                                                        : 'bg-blue-500'}` }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: status === 'rejeitada'
                                                                            ? 'Transferência Rejeitada'
                                                                            : 'Transferência Aprovada' }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: formatDateTime(transferencia.data_aprovacao) })] })] })), transferencia.data_efetivacao && (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-1", children: _jsx("div", { className: "w-2 h-2 rounded-full bg-green-500" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "Transfer\u00EAncia Efetivada" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: formatDateTime(transferencia.data_efetivacao) })] })] })), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-1", children: _jsx("div", { className: "w-2 h-2 rounded-full bg-gray-300" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: "\u00DAltima Atualiza\u00E7\u00E3o" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: formatDateTime(transferencia.atualizado_em) })] })] })] }) })] }), status === 'aprovada' && (_jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Info, { className: "w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-800 dark:text-blue-200", children: "Transfer\u00EAncia Aprovada" }), _jsx("p", { className: "text-sm text-blue-600 dark:text-blue-400 mt-1", children: "Esta transfer\u00EAncia foi aprovada e est\u00E1 aguardando efetiva\u00E7\u00E3o. Ap\u00F3s efetivada, o patrim\u00F4nio ser\u00E1 atualizado com o novo setor e respons\u00E1vel." })] })] }) })), status === 'concluida' && (_jsx("div", { className: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-green-800 dark:text-green-200", children: "Transfer\u00EAncia Conclu\u00EDda" }), _jsx("p", { className: "text-sm text-green-600 dark:text-green-400 mt-1", children: "Esta transfer\u00EAncia foi efetivada com sucesso. O patrim\u00F4nio j\u00E1 est\u00E1 atualizado com o novo setor e respons\u00E1vel." }), transferencia.data_efetivacao && (_jsxs("p", { className: "text-sm text-green-700 dark:text-green-300 mt-2 font-medium", children: ["\uD83D\uDCC5 Efetivada em:", ' ', formatDateTime(transferencia.data_efetivacao)] }))] })] }) })), status === 'pendente' && (_jsx("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Clock, { className: "w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-yellow-800 dark:text-yellow-200", children: "Aguardando Aprova\u00E7\u00E3o" }), _jsx("p", { className: "text-sm text-yellow-600 dark:text-yellow-400 mt-1", children: "Esta transfer\u00EAncia est\u00E1 aguardando an\u00E1lise de um gestor ou administrador." })] })] }) }))] }), _jsxs("div", { className: "flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300\r\n                bg-white dark:bg-[#2a2a2a]\r\n                border border-gray-300 dark:border-gray-600\r\n                rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]\r\n                transition-colors", children: "Fechar" }), _jsxs("div", { className: "flex gap-2", children: [canApprove && onAprovar && (_jsxs("button", { onClick: () => {
                                                onAprovar(transferencia);
                                                onClose();
                                            }, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white\r\n                    bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600\r\n                    rounded-lg shadow-sm hover:shadow-md\r\n                    transition-all duration-200", children: [_jsx(Check, { className: "w-4 h-4" }), "Aprovar"] })), canReject && onRejeitar && (_jsxs("button", { onClick: () => {
                                                onRejeitar(transferencia);
                                                onClose();
                                            }, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white\r\n                    bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600\r\n                    rounded-lg shadow-sm hover:shadow-md\r\n                    transition-all duration-200", children: [_jsx(X, { className: "w-4 h-4" }), "Rejeitar"] })), canTransfer && onEfetivar && (_jsxs("button", { onClick: () => {
                                                onEfetivar(transferencia);
                                                onClose();
                                            }, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white\r\n                    bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600\r\n                    rounded-lg shadow-sm hover:shadow-md\r\n                    transition-all duration-200", children: [_jsx(ArrowRightLeft, { className: "w-4 h-4" }), "Efetivar Transfer\u00EAncia"] }))] })] })] }) })] }));
};
export default TransferenciaDetalhes;

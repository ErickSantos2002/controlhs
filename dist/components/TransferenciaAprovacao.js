import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Loader2, FileText, ArrowRightLeft, } from 'lucide-react';
import { useTransferencias } from '../context/TransferenciasContext';
const TransferenciaAprovacao = ({ isOpen, onClose, transferencia, tipo, onSuccess, }) => {
    const { patrimonios, setores, usuarios, aprovarTransferencia, rejeitarTransferencia, } = useTransferencias();
    // ========================================
    // ESTADOS
    // ========================================
    const [observacoes, setObservacoes] = useState('');
    const [motivo, setMotivo] = useState('');
    const [efetivarAutomaticamente, setEfetivarAutomaticamente] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    // ========================================
    // HELPERS
    // ========================================
    const getPatrimonioNome = () => {
        if (!transferencia)
            return 'N/A';
        const patrimonio = patrimonios.find((p) => p.id === transferencia.patrimonio_id);
        return (patrimonio === null || patrimonio === void 0 ? void 0 : patrimonio.nome) || 'N/A';
    };
    const getSetorOrigemNome = () => {
        if (!transferencia)
            return 'N/A';
        const setor = setores.find((s) => s.id === transferencia.setor_origem_id);
        return (setor === null || setor === void 0 ? void 0 : setor.nome) || 'N/A';
    };
    const getSetorDestinoNome = () => {
        if (!transferencia)
            return 'N/A';
        const setor = setores.find((s) => s.id === transferencia.setor_destino_id);
        return (setor === null || setor === void 0 ? void 0 : setor.nome) || 'N/A';
    };
    const getResponsavelOrigemNome = () => {
        if (!transferencia)
            return 'N/A';
        const user = usuarios.find((u) => u.id === transferencia.responsavel_origem_id);
        return (user === null || user === void 0 ? void 0 : user.username) || 'N/A';
    };
    const getResponsavelDestinoNome = () => {
        if (!transferencia)
            return 'N/A';
        const user = usuarios.find((u) => u.id === transferencia.responsavel_destino_id);
        return (user === null || user === void 0 ? void 0 : user.username) || 'N/A';
    };
    // ========================================
    // HANDLERS
    // ========================================
    const handleSubmit = async () => {
        var _a, _b;
        if (!transferencia)
            return;
        if (tipo === 'rejeitar' && !motivo.trim()) {
            setError('O motivo da rejeição é obrigatório');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            if (tipo === 'aprovar') {
                await aprovarTransferencia(transferencia.id, observacoes || undefined, efetivarAutomaticamente);
            }
            else {
                await rejeitarTransferencia(transferencia.id, motivo);
            }
            if (onSuccess) {
                onSuccess();
            }
            // Reset form
            setObservacoes('');
            setMotivo('');
            setEfetivarAutomaticamente(false);
            onClose();
        }
        catch (err) {
            console.error(`Erro ao ${tipo} transferência:`, err);
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || `Erro ao ${tipo} transferência`);
        }
        finally {
            setSaving(false);
        }
    };
    if (!isOpen || !transferencia)
        return null;
    // ========================================
    // RENDER
    // ========================================
    return (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity", onClick: onClose }), _jsx("div", { className: "flex min-h-full items-center justify-center", children: _jsxs("div", { className: "relative w-full max-w-lg bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2", children: tipo === 'aprovar' ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 dark:text-green-400" }), "Aprovar Transfer\u00EAncia #", transferencia.id] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { className: "w-5 h-5 text-red-600 dark:text-red-400" }), "Rejeitar Transfer\u00EAncia #", transferencia.id] })) }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", disabled: saving, children: _jsx(X, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" }) })] }), _jsxs("div", { className: "p-6", children: [error && (_jsx("div", { className: "mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-red-800 dark:text-red-200", children: "Erro ao processar" }), _jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: error })] })] }) })), _jsxs("div", { className: "mb-4 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-800 dark:text-gray-200 mb-3", children: "Resumo da Transfer\u00EAncia" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Patrim\u00F4nio:" }), _jsx("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: getPatrimonioNome() })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Setor:" }), _jsxs("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: [getSetorOrigemNome(), " \u2192 ", getSetorDestinoNome()] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Respons\u00E1vel:" }), _jsxs("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: [getResponsavelOrigemNome(), " \u2192 ", getResponsavelDestinoNome()] })] }), transferencia.motivo && (_jsxs("div", { className: "pt-2 border-t border-gray-200 dark:border-gray-600", children: [_jsx("span", { className: "text-gray-500 dark:text-gray-400", children: "Motivo:" }), _jsx("p", { className: "text-gray-700 dark:text-gray-300 mt-1", children: transferencia.motivo })] }))] })] }), tipo === 'aprovar' ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [_jsx(FileText, { className: "w-4 h-4 inline mr-1" }), "Observa\u00E7\u00F5es da Aprova\u00E7\u00E3o (Opcional)"] }), _jsx("textarea", { value: observacoes, onChange: (e) => setObservacoes(e.target.value), rows: 3, placeholder: "Adicione observa\u00E7\u00F5es sobre a aprova\u00E7\u00E3o...", className: "w-full px-3 py-2 border rounded-lg\r\n                      bg-white dark:bg-[#2a2a2a]\r\n                      text-gray-900 dark:text-gray-100\r\n                      border-gray-300 dark:border-gray-600\r\n                      focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400\r\n                      focus:border-transparent transition-colors" })] }), _jsxs("div", { className: "flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800", children: [_jsx("input", { type: "checkbox", id: "efetivar", checked: efetivarAutomaticamente, onChange: (e) => setEfetivarAutomaticamente(e.target.checked), className: "mt-1 w-4 h-4 text-blue-600 dark:text-blue-400 \r\n                      bg-white dark:bg-[#2a2a2a]\r\n                      border-gray-300 dark:border-gray-600\r\n                      rounded focus:ring-blue-500 dark:focus:ring-blue-400" }), _jsxs("label", { htmlFor: "efetivar", className: "flex-1 cursor-pointer", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: [_jsx(ArrowRightLeft, { className: "w-4 h-4 inline mr-1" }), "Efetivar automaticamente ap\u00F3s aprova\u00E7\u00E3o"] }), _jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-1", children: "Ao marcar esta op\u00E7\u00E3o, o patrim\u00F4nio ser\u00E1 imediatamente transferido para o novo setor e respons\u00E1vel." })] })] }), _jsx("div", { className: "p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800", children: _jsxs("p", { className: "text-sm text-green-700 dark:text-green-300", children: ["Ao aprovar, voc\u00EA autoriza a transfer\u00EAncia deste patrim\u00F4nio.", efetivarAutomaticamente
                                                        ? ' A transferência será efetivada imediatamente.'
                                                        : ' A transferência ficará aguardando efetivação.'] }) })] })) : (
                                /* Formulário de Rejeição */
                                _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [_jsx(FileText, { className: "w-4 h-4 inline mr-1" }), "Motivo da Rejei\u00E7\u00E3o *"] }), _jsx("textarea", { value: motivo, onChange: (e) => setMotivo(e.target.value), rows: 4, placeholder: "Explique o motivo da rejei\u00E7\u00E3o (obrigat\u00F3rio)...", className: `w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${error && !motivo.trim()
                                                        ? 'border-red-500 dark:border-red-400'
                                                        : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400
                      focus:border-transparent transition-colors` }), error && !motivo.trim() && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: "O motivo da rejei\u00E7\u00E3o \u00E9 obrigat\u00F3rio" }))] }), _jsx("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800", children: _jsxs("p", { className: "text-sm text-red-700 dark:text-red-300", children: [_jsx(AlertTriangle, { className: "w-4 h-4 inline mr-1" }), "Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita. A transfer\u00EAncia ser\u00E1 rejeitada e o solicitante ser\u00E1 notificado."] }) })] }))] }), _jsxs("div", { className: "flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700", children: [_jsx("button", { onClick: onClose, disabled: saving, className: "px-4 py-2 text-sm font-medium\r\n                text-gray-700 dark:text-gray-300\r\n                bg-white dark:bg-[#2a2a2a]\r\n                border border-gray-300 dark:border-gray-600\r\n                rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]\r\n                disabled:opacity-50 disabled:cursor-not-allowed\r\n                transition-colors", children: "Cancelar" }), _jsx("button", { onClick: handleSubmit, disabled: saving || (tipo === 'rejeitar' && !motivo.trim()), className: `flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                ${tipo === 'aprovar'
                                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                                        : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'}
                rounded-lg shadow-sm hover:shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200`, children: saving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Processando..."] })) : tipo === 'aprovar' ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Confirmar Aprova\u00E7\u00E3o"] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { className: "w-4 h-4" }), "Confirmar Rejei\u00E7\u00E3o"] })) })] })] }) })] }));
};
export default TransferenciaAprovacao;

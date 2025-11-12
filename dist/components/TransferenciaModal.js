import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Package, Building, User, Hash, FileText, AlertCircle, Loader2, ArrowRightLeft, } from 'lucide-react';
import { useTransferencias } from '../context/TransferenciasContext';
import { WizardStep, } from '../types/transferencias.types';
const TransferenciaModal = ({ isOpen, onClose, onSuccess, }) => {
    var _a;
    const { patrimonios, setores, usuarios, createTransferencia, verificarTransferenciaPendente, loading, } = useTransferencias();
    // ========================================
    // ESTADOS DO WIZARD
    // ========================================
    const [currentStep, setCurrentStep] = useState(WizardStep.SELECAO_PATRIMONIO);
    const [wizardData, setWizardData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    // ========================================
    // 🆕 OBTER DADOS DO USUÁRIO LOGADO
    // ========================================
    const getUserId = () => {
        const id = localStorage.getItem('id');
        return id ? parseInt(id) : 0;
    };
    const getUserRole = () => {
        const role = localStorage.getItem('role');
        return role || 'Usuário';
    };
    // ========================================
    // 🆕 FILTRAR PATRIMÔNIOS DO USUÁRIO
    // ========================================
    // ✅ PROBLEMA 1: Filtrar patrimônios baseado na role
    // - Administrador e Gestor: veem TODOS os patrimônios ativos
    // - Usuário comum: vê apenas patrimônios sob sua responsabilidade
    const patrimoniosDoUsuario = patrimonios.filter((p) => {
        // Remove patrimônios baixados para todos
        if (p.status === 'baixado') {
            return false;
        }
        const userRole = getUserRole();
        const userId = getUserId();
        // Administrador e Gestor veem todos os patrimônios ativos
        if (userRole === 'Administrador' || userRole === 'Gestor') {
            return true;
        }
        // Usuário comum vê apenas seus patrimônios
        return p.responsavel_id === userId;
    });
    // ========================================
    // RESET DO MODAL
    // ========================================
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(WizardStep.SELECAO_PATRIMONIO);
            setWizardData({});
            setErrors({});
            setSaveError(null);
        }
    }, [isOpen]);
    // ========================================
    // BUSCA DADOS DO PATRIMÔNIO SELECIONADO
    // ========================================
    useEffect(() => {
        if (wizardData.patrimonio_id) {
            const patrimonio = patrimonios.find((p) => p.id === wizardData.patrimonio_id);
            if (patrimonio) {
                setWizardData((prev) => (Object.assign(Object.assign({}, prev), { patrimonio, setor_origem_id: patrimonio.setor_id, responsavel_origem_id: patrimonio.responsavel_id })));
            }
        }
    }, [wizardData.patrimonio_id, patrimonios]);
    // ========================================
    // VALIDAÇÕES POR ETAPA
    // ========================================
    const validateStep1 = () => {
        const newErrors = {};
        if (!wizardData.patrimonio_id) {
            newErrors.patrimonio = 'Selecione um patrimônio';
        }
        else {
            const patrimonio = patrimonios.find((p) => p.id === wizardData.patrimonio_id);
            // ✅ Verifica permissão baseada na role
            const userId = getUserId();
            const userRole = getUserRole();
            // Usuário comum só pode transferir patrimônios sob sua responsabilidade
            if (userRole === 'Usuário' && patrimonio && patrimonio.responsavel_id !== userId) {
                newErrors.patrimonio =
                    'Você não tem permissão para transferir este patrimônio';
            }
            // Verifica se o patrimônio está ativo
            if ((patrimonio === null || patrimonio === void 0 ? void 0 : patrimonio.status) === 'baixado') {
                newErrors.patrimonio =
                    'Este patrimônio foi baixado e não pode ser transferido';
            }
            // Verifica se já existe transferência pendente
            if (verificarTransferenciaPendente(wizardData.patrimonio_id)) {
                newErrors.patrimonio =
                    'Este patrimônio já possui uma transferência pendente';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // ✅ PROBLEMA 3: Nova validação - permite apenas setor OU responsável mudar
    const validateStep2 = () => {
        const newErrors = {};
        // Verifica se pelo menos um campo foi preenchido
        const temSetorDestino = !!wizardData.setor_destino_id;
        const temResponsavelDestino = !!wizardData.responsavel_destino_id;
        if (!temSetorDestino && !temResponsavelDestino) {
            newErrors.geral = 'Selecione pelo menos um destino: setor ou responsável';
        }
        // Se setor foi informado, valida se é diferente do atual
        if (temSetorDestino) {
            if (wizardData.setor_destino_id === wizardData.setor_origem_id) {
                newErrors.setor = 'O setor de destino deve ser diferente do setor atual';
            }
        }
        // Se responsável foi informado, valida se é diferente do atual
        if (temResponsavelDestino) {
            if (wizardData.responsavel_destino_id === wizardData.responsavel_origem_id) {
                newErrors.responsavel =
                    'O responsável de destino deve ser diferente do atual';
            }
        }
        // Valida que pelo menos algo está mudando
        const setorMudou = temSetorDestino && wizardData.setor_destino_id !== wizardData.setor_origem_id;
        const responsavelMudou = temResponsavelDestino && wizardData.responsavel_destino_id !== wizardData.responsavel_origem_id;
        if (!setorMudou && !responsavelMudou) {
            newErrors.geral = 'É necessário alterar pelo menos o setor ou o responsável';
        }
        // Valida motivo
        if (!wizardData.motivo || wizardData.motivo.length < 10) {
            newErrors.motivo = 'O motivo deve ter pelo menos 10 caracteres';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // ========================================
    // NAVEGAÇÃO DO WIZARD
    // ========================================
    const handleNext = () => {
        if (currentStep === WizardStep.SELECAO_PATRIMONIO) {
            if (validateStep1()) {
                setCurrentStep(WizardStep.DESTINO_TRANSFERENCIA);
            }
        }
        else if (currentStep === WizardStep.DESTINO_TRANSFERENCIA) {
            if (validateStep2()) {
                setCurrentStep(WizardStep.CONFIRMACAO);
            }
        }
    };
    const handleBack = () => {
        if (currentStep === WizardStep.DESTINO_TRANSFERENCIA) {
            setCurrentStep(WizardStep.SELECAO_PATRIMONIO);
        }
        else if (currentStep === WizardStep.CONFIRMACAO) {
            setCurrentStep(WizardStep.DESTINO_TRANSFERENCIA);
        }
    };
    // ========================================
    // SUBMIT DA TRANSFERÊNCIA
    // ========================================
    const handleSubmit = async () => {
        var _a, _b;
        setSaving(true);
        setSaveError(null);
        try {
            const data = {
                patrimonio_id: wizardData.patrimonio_id,
                setor_origem_id: wizardData.setor_origem_id,
                setor_destino_id: wizardData.setor_destino_id,
                responsavel_origem_id: wizardData.responsavel_origem_id,
                responsavel_destino_id: wizardData.responsavel_destino_id,
                motivo: wizardData.motivo,
            };
            await createTransferencia(data);
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        }
        catch (err) {
            console.error('Erro ao criar transferência:', err);
            setSaveError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) || 'Erro ao solicitar transferência');
        }
        finally {
            setSaving(false);
        }
    };
    // ========================================
    // HELPERS
    // ========================================
    const getNomePatrimonio = () => {
        var _a;
        return ((_a = wizardData.patrimonio) === null || _a === void 0 ? void 0 : _a.nome) || 'N/A';
    };
    const getNomeSetorOrigem = () => {
        const setor = setores.find((s) => s.id === wizardData.setor_origem_id);
        return (setor === null || setor === void 0 ? void 0 : setor.nome) || 'N/A';
    };
    const getNomeSetorDestino = () => {
        const setor = setores.find((s) => s.id === wizardData.setor_destino_id);
        return (setor === null || setor === void 0 ? void 0 : setor.nome) || 'Manter atual';
    };
    const getNomeResponsavelOrigem = () => {
        const user = usuarios.find((u) => u.id === wizardData.responsavel_origem_id);
        return (user === null || user === void 0 ? void 0 : user.username) || 'N/A';
    };
    const getNomeResponsavelDestino = () => {
        const user = usuarios.find((u) => u.id === wizardData.responsavel_destino_id);
        return (user === null || user === void 0 ? void 0 : user.username) || 'Manter atual';
    };
    // ========================================
    // RENDERIZAÇÃO CONDICIONAL
    // ========================================
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity", onClick: onClose }), _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsxs("div", { className: "relative bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg", children: _jsx(ArrowRightLeft, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: "Nova Transfer\u00EAncia" }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Passo ", currentStep, " de 3"] })] })] }), _jsx("button", { onClick: onClose, disabled: saving, className: "p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200\r\n                rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700\r\n                transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "w-full h-1 bg-gray-200 dark:bg-gray-700", children: _jsx("div", { className: "h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300", style: { width: `${(currentStep / 3) * 100}%` } }) }), saveError && (_jsx("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-red-800 dark:text-red-200", children: "Erro ao criar transfer\u00EAncia" }), _jsx("p", { className: "text-sm text-red-600 dark:text-red-400 mt-1", children: saveError })] })] }) })), _jsxs("div", { className: "p-6", children: [currentStep === WizardStep.SELECAO_PATRIMONIO && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Package, { className: "w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-800 dark:text-blue-200", children: "Selecione o patrim\u00F4nio" }), _jsx("p", { className: "text-sm text-blue-600 dark:text-blue-400 mt-1", children: getUserRole() === 'Usuário'
                                                                    ? 'Escolha o patrimônio que deseja transferir. Apenas patrimônios ativos dos quais você é responsável podem ser transferidos.'
                                                                    : 'Escolha o patrimônio que deseja transferir. Apenas patrimônios ativos podem ser transferidos.' })] })] }) }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [_jsx(Package, { className: "w-4 h-4 inline mr-1" }), "Patrim\u00F4nio *"] }), _jsxs("select", { value: wizardData.patrimonio_id || '', onChange: (e) => setWizardData((prev) => (Object.assign(Object.assign({}, prev), { patrimonio_id: e.target.value
                                                            ? parseInt(e.target.value)
                                                            : undefined }))), className: `w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.patrimonio
                                                        ? 'border-red-500 dark:border-red-400'
                                                        : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      focus:border-transparent transition-colors`, children: [_jsx("option", { value: "", children: "Selecione um patrim\u00F4nio" }), patrimoniosDoUsuario.map((p) => (_jsxs("option", { value: p.id, children: [p.nome, p.numero_serie && ` (NS: ${p.numero_serie})`] }, p.id)))] }), errors.patrimonio && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.patrimonio })), patrimoniosDoUsuario.length === 0 && (_jsxs("p", { className: "mt-2 text-sm text-amber-600 dark:text-amber-400", children: ["\u26A0\uFE0F ", getUserRole() === 'Usuário'
                                                            ? 'Você não possui patrimônios ativos sob sua responsabilidade.'
                                                            : 'Não há patrimônios ativos disponíveis no sistema.'] }))] }), wizardData.patrimonio && (_jsxs("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-2", children: [_jsx("h3", { className: "font-medium text-gray-800 dark:text-gray-200 mb-3", children: "Detalhes do Patrim\u00F4nio" }), wizardData.patrimonio.numero_serie && (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Hash, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "NS:" }), _jsx("span", { className: "text-gray-900 dark:text-gray-100", children: wizardData.patrimonio.numero_serie })] })), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Building, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Setor Atual:" }), _jsx("span", { className: "text-gray-900 dark:text-gray-100", children: getNomeSetorOrigem() })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(User, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Respons\u00E1vel Atual:" }), _jsx("span", { className: "text-gray-900 dark:text-gray-100", children: getNomeResponsavelOrigem() })] })] }))] })), currentStep === WizardStep.DESTINO_TRANSFERENCIA && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(ArrowRightLeft, { className: "w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-800 dark:text-blue-200", children: "Defina o destino da transfer\u00EAncia" }), _jsx("p", { className: "text-sm text-blue-600 dark:text-blue-400 mt-1", children: "Voc\u00EA pode transferir apenas o setor, apenas o respons\u00E1vel, ou ambos. Pelo menos um deve ser alterado." })] })] }) }), errors.geral && (_jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3", children: _jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: errors.geral }) })), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [_jsx(Building, { className: "w-4 h-4 inline mr-1" }), "Setor de Destino (opcional)"] }), _jsxs("select", { value: wizardData.setor_destino_id || '', onChange: (e) => setWizardData((prev) => (Object.assign(Object.assign({}, prev), { setor_destino_id: e.target.value
                                                            ? parseInt(e.target.value)
                                                            : undefined }))), className: `w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.setor
                                                        ? 'border-red-500 dark:border-red-400'
                                                        : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      focus:border-transparent transition-colors`, children: [_jsx("option", { value: "", children: "Manter setor atual" }), setores
                                                            .filter((s) => s.id !== wizardData.setor_origem_id)
                                                            .map((s) => (_jsx("option", { value: s.id, children: s.nome }, s.id)))] }), errors.setor && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.setor }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [_jsx(User, { className: "w-4 h-4 inline mr-1" }), "Respons\u00E1vel de Destino (opcional)"] }), _jsxs("select", { value: wizardData.responsavel_destino_id || '', onChange: (e) => setWizardData((prev) => (Object.assign(Object.assign({}, prev), { responsavel_destino_id: e.target.value
                                                            ? parseInt(e.target.value)
                                                            : undefined }))), className: `w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.responsavel
                                                        ? 'border-red-500 dark:border-red-400'
                                                        : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      focus:border-transparent transition-colors`, children: [_jsx("option", { value: "", children: "Manter respons\u00E1vel atual" }), usuarios
                                                            .filter((u) => u.id !== wizardData.responsavel_origem_id)
                                                            .map((u) => (_jsx("option", { value: u.id, children: u.username }, u.id)))] }), errors.responsavel && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.responsavel }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [_jsx(FileText, { className: "w-4 h-4 inline mr-1" }), "Motivo da Transfer\u00EAncia *"] }), _jsx("textarea", { value: wizardData.motivo || '', onChange: (e) => setWizardData((prev) => (Object.assign(Object.assign({}, prev), { motivo: e.target.value }))), rows: 3, placeholder: "Descreva o motivo da transfer\u00EAncia (m\u00EDnimo 10 caracteres)", className: `w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.motivo
                                                        ? 'border-red-500 dark:border-red-400'
                                                        : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      focus:border-transparent transition-colors` }), errors.motivo && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.motivo }))] })] })), currentStep === WizardStep.CONFIRMACAO && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-800 dark:text-blue-200", children: "Confirma\u00E7\u00E3o da Transfer\u00EAncia" }), _jsx("p", { className: "text-sm text-blue-600 dark:text-blue-400 mt-1", children: "Esta solicita\u00E7\u00E3o ser\u00E1 enviada para aprova\u00E7\u00E3o. Ap\u00F3s aprovada, o patrim\u00F4nio poder\u00E1 ser transferido." })] })] }) }), _jsxs("div", { className: "bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3", children: [_jsx("h3", { className: "font-medium text-gray-800 dark:text-gray-200 mb-3", children: "Resumo da Transfer\u00EAncia" }), _jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Patrim\u00F4nio:" }), _jsxs("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: [getNomePatrimonio(), ((_a = wizardData.patrimonio) === null || _a === void 0 ? void 0 : _a.numero_serie) && (_jsxs("span", { className: "text-sm text-gray-500 dark:text-gray-400 ml-2", children: ["(NS: ", wizardData.patrimonio.numero_serie, ")"] }))] })] }), wizardData.setor_destino_id && (_jsxs("div", { className: "flex items-center gap-3 py-2", children: [_jsxs("div", { className: "text-center flex-1", children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Setor Atual" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: getNomeSetorOrigem() })] }), _jsx(ArrowRight, { className: "w-5 h-5 text-blue-500 dark:text-blue-400" }), _jsxs("div", { className: "text-center flex-1", children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Novo Setor" }), _jsx("p", { className: "font-medium text-green-600 dark:text-green-400", children: getNomeSetorDestino() })] })] })), wizardData.responsavel_destino_id && (_jsxs("div", { className: "flex items-center gap-3 py-2", children: [_jsxs("div", { className: "text-center flex-1", children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Respons\u00E1vel Atual" }), _jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100", children: getNomeResponsavelOrigem() })] }), _jsx(ArrowRight, { className: "w-5 h-5 text-blue-500 dark:text-blue-400" }), _jsxs("div", { className: "text-center flex-1", children: [_jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Novo Respons\u00E1vel" }), _jsx("p", { className: "font-medium text-green-600 dark:text-green-400", children: getNomeResponsavelDestino() })] })] })), !wizardData.setor_destino_id && (_jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400 italic", children: ["\u2022 Setor: mant\u00E9m atual (", getNomeSetorOrigem(), ")"] })), !wizardData.responsavel_destino_id && (_jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400 italic", children: ["\u2022 Respons\u00E1vel: mant\u00E9m atual (", getNomeResponsavelOrigem(), ")"] })), _jsxs("div", { className: "pt-2 border-t border-gray-200 dark:border-gray-600", children: [_jsx("span", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Motivo:" }), _jsx("p", { className: "text-sm text-gray-700 dark:text-gray-300 mt-1", children: wizardData.motivo })] })] })] }))] }), _jsxs("div", { className: "flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex gap-2", children: [currentStep > 1 && (_jsxs("button", { onClick: handleBack, disabled: saving, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium\r\n                    text-gray-700 dark:text-gray-300\r\n                    bg-white dark:bg-[#2a2a2a]\r\n                    border border-gray-300 dark:border-gray-600\r\n                    rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]\r\n                    disabled:opacity-50 disabled:cursor-not-allowed\r\n                    transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Voltar"] })), _jsx("button", { onClick: onClose, disabled: saving, className: "px-4 py-2 text-sm font-medium\r\n                  text-gray-700 dark:text-gray-300\r\n                  bg-white dark:bg-[#2a2a2a]\r\n                  border border-gray-300 dark:border-gray-600\r\n                  rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]\r\n                  disabled:opacity-50 disabled:cursor-not-allowed\r\n                  transition-colors", children: "Cancelar" })] }), _jsx("div", { children: currentStep < 3 ? (_jsxs("button", { onClick: handleNext, disabled: saving, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white\r\n                    bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600\r\n                    rounded-lg shadow-sm hover:shadow-md\r\n                    disabled:opacity-50 disabled:cursor-not-allowed\r\n                    transition-all duration-200", children: ["Pr\u00F3ximo", _jsx(ArrowRight, { className: "w-4 h-4" })] })) : (_jsx("button", { onClick: handleSubmit, disabled: saving, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white\r\n                    bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600\r\n                    rounded-lg shadow-sm hover:shadow-md\r\n                    disabled:opacity-50 disabled:cursor-not-allowed\r\n                    transition-all duration-200", children: saving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Solicitando..."] })) : (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Confirmar Transfer\u00EAncia"] })) })) })] })] }) })] }));
};
export default TransferenciaModal;

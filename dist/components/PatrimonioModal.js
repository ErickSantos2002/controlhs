import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { X, Save, Loader2, DollarSign, Calendar, Hash, FileText, Tag, AlertCircle, } from 'lucide-react';
import { usePatrimonios } from '../context/PatrimoniosContext';
const PatrimonioModal = ({ isOpen, onClose, patrimonio, onSuccess, }) => {
    const { categorias, setores, usuarios, createPatrimonio, updatePatrimonio, loading, } = usePatrimonios();
    const isEdit = !!patrimonio;
    // ========================================
    // ESTADOS DO FORMULÁRIO
    // ========================================
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        numero_serie: '',
        categoria_id: undefined,
        setor_id: undefined,
        responsavel_id: undefined,
        data_aquisicao: '',
        valor_aquisicao: 0,
        valor_atual: 0,
        status: 'ativo',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    // ========================================
    // INICIALIZAÇÃO DO FORMULÁRIO
    // ========================================
    useEffect(() => {
        if (isOpen) {
            if (patrimonio) {
                // Modo edição: preenche com dados existentes
                setFormData({
                    nome: patrimonio.nome || '',
                    descricao: patrimonio.descricao || '',
                    numero_serie: patrimonio.numero_serie || '',
                    categoria_id: patrimonio.categoria_id || undefined,
                    setor_id: patrimonio.setor_id || undefined,
                    responsavel_id: patrimonio.responsavel_id || undefined,
                    data_aquisicao: patrimonio.data_aquisicao || '',
                    valor_aquisicao: patrimonio.valor_aquisicao || 0,
                    valor_atual: patrimonio.valor_atual || 0,
                    status: patrimonio.status || 'ativo',
                });
            }
            else {
                // Modo criação: limpa o formulário
                setFormData({
                    nome: '',
                    descricao: '',
                    numero_serie: '',
                    categoria_id: undefined,
                    setor_id: undefined,
                    responsavel_id: undefined,
                    data_aquisicao: '',
                    valor_aquisicao: 0,
                    valor_atual: 0,
                    status: 'ativo',
                });
            }
            setErrors({});
            setSaveError(null);
        }
    }, [isOpen, patrimonio]);
    // ========================================
    // HANDLERS
    // ========================================
    const handleChange = useCallback((field, value) => {
        setFormData((prev) => (Object.assign(Object.assign({}, prev), { [field]: value })));
        // Limpa erro do campo quando usuário começa a digitar
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = Object.assign({}, prev);
                delete newErrors[field];
                return newErrors;
            });
        }
        // Validação especial para valor_atual
        if (field === 'valor_atual' && formData.valor_aquisicao) {
            if (Number(value) > Number(formData.valor_aquisicao)) {
                setErrors((prev) => (Object.assign(Object.assign({}, prev), { valor_atual: 'Valor atual não pode ser maior que o valor de aquisição' })));
            }
        }
        // Validação especial para valor_aquisicao
        if (field === 'valor_aquisicao' && formData.valor_atual) {
            if (Number(formData.valor_atual) > Number(value)) {
                setErrors((prev) => (Object.assign(Object.assign({}, prev), { valor_atual: 'Valor atual não pode ser maior que o valor de aquisição' })));
            }
            else {
                setErrors((prev) => {
                    const newErrors = Object.assign({}, prev);
                    delete newErrors.valor_atual;
                    return newErrors;
                });
            }
        }
    }, [formData, errors]);
    // ========================================
    // VALIDAÇÃO
    // ========================================
    const validate = useCallback(() => {
        const newErrors = {};
        // Nome obrigatório e mínimo 3 caracteres
        if (!formData.nome) {
            newErrors.nome = 'Nome é obrigatório';
        }
        else if (formData.nome.length < 3) {
            newErrors.nome = 'Nome deve ter no mínimo 3 caracteres';
        }
        // Categoria obrigatória
        if (!formData.categoria_id) {
            newErrors.categoria_id = 'Categoria é obrigatória';
        }
        // Setor obrigatório
        if (!formData.setor_id) {
            newErrors.setor_id = 'Setor é obrigatório';
        }
        // Responsável obrigatório
        if (!formData.responsavel_id) {
            newErrors.responsavel_id = 'Responsável é obrigatório';
        }
        // Data de aquisição obrigatória e não pode ser futura
        if (!formData.data_aquisicao) {
            newErrors.data_aquisicao = 'Data de aquisição é obrigatória';
        }
        else {
            const dataAquisicao = new Date(formData.data_aquisicao);
            const hoje = new Date();
            hoje.setHours(23, 59, 59, 999);
            if (dataAquisicao > hoje) {
                newErrors.data_aquisicao = 'Data de aquisição não pode ser futura';
            }
        }
        // Valores obrigatórios e validações
        if (!formData.valor_aquisicao || formData.valor_aquisicao <= 0) {
            newErrors.valor_aquisicao = 'Valor de aquisição deve ser maior que zero';
        }
        if (!formData.valor_atual || formData.valor_atual < 0) {
            newErrors.valor_atual =
                'Valor atual é obrigatório e deve ser maior ou igual a zero';
        }
        if (formData.valor_atual && formData.valor_aquisicao) {
            if (formData.valor_atual > formData.valor_aquisicao) {
                newErrors.valor_atual =
                    'Valor atual não pode ser maior que o valor de aquisição';
            }
        }
        // Descrição máximo 500 caracteres
        if (formData.descricao && formData.descricao.length > 500) {
            newErrors.descricao = 'Descrição deve ter no máximo 500 caracteres';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);
    // ========================================
    // SUBMIT
    // ========================================
    const handleSubmit = useCallback(async (e) => {
        var _a, _b;
        e.preventDefault();
        if (!validate()) {
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            if (isEdit && patrimonio) {
                // Atualização
                const updateData = Object.assign({}, formData);
                await updatePatrimonio(patrimonio.id, updateData);
            }
            else {
                // Criação
                await createPatrimonio(formData);
            }
            // Sucesso
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
            onClose();
        }
        catch (err) {
            console.error('Erro ao salvar patrimônio:', err);
            setSaveError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.detail) ||
                `Erro ao ${isEdit ? 'atualizar' : 'criar'} patrimônio. Tente novamente.`);
        }
        finally {
            setSaving(false);
        }
    }, [
        formData,
        isEdit,
        patrimonio,
        validate,
        createPatrimonio,
        updatePatrimonio,
        onSuccess,
        onClose,
    ]);
    // ========================================
    // RENDER
    // ========================================
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity", onClick: onClose }), _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsxs("div", { className: "relative w-full max-w-3xl bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-gray-100", children: isEdit
                                        ? `Editar Patrimônio - ${patrimonio === null || patrimonio === void 0 ? void 0 : patrimonio.nome}`
                                        : 'Cadastrar Novo Patrimônio' }), _jsx("button", { onClick: onClose, className: "p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", children: _jsx(X, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6", children: [saveError && (_jsx("div", { className: "mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" }), _jsx("p", { className: "text-sm text-red-700 dark:text-red-300", children: saveError })] }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Nome *" }), _jsxs("div", { className: "relative", children: [_jsx(Tag, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", value: formData.nome, onChange: (e) => handleChange('nome', e.target.value), className: `w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.nome
                                                                ? 'border-red-500 dark:border-red-400'
                                                                : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`, placeholder: "Digite o nome do patrim\u00F4nio" })] }), errors.nome && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.nome }))] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Descri\u00E7\u00E3o" }), _jsxs("div", { className: "relative", children: [_jsx(FileText, { className: "absolute left-3 top-3 w-4 h-4 text-gray-400" }), _jsx("textarea", { value: formData.descricao, onChange: (e) => handleChange('descricao', e.target.value), rows: 3, className: `w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.descricao
                                                                ? 'border-red-500 dark:border-red-400'
                                                                : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`, placeholder: "Digite uma descri\u00E7\u00E3o detalhada (opcional)" })] }), errors.descricao && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.descricao }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "N\u00FAmero de S\u00E9rie" }), _jsxs("div", { className: "relative", children: [_jsx(Hash, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", value: formData.numero_serie, onChange: (e) => handleChange('numero_serie', e.target.value), className: "w-full pl-10 pr-3 py-2 border rounded-lg\r\n                      bg-white dark:bg-[#2a2a2a]\r\n                      text-gray-900 dark:text-gray-100\r\n                      border-gray-300 dark:border-gray-600\r\n                      focus:ring-2 focus:ring-blue-500 focus:border-transparent\r\n                      transition-colors", placeholder: "Ex: SN123456" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Status *" }), _jsxs("select", { value: formData.status, onChange: (e) => handleChange('status', e.target.value), className: "w-full px-3 py-2 border rounded-lg\r\n                    bg-white dark:bg-[#2a2a2a]\r\n                    text-gray-900 dark:text-gray-100\r\n                    border-gray-300 dark:border-gray-600\r\n                    focus:ring-2 focus:ring-blue-500 focus:border-transparent\r\n                    transition-colors", children: [_jsx("option", { value: "ativo", children: "Ativo" }), _jsx("option", { value: "manutencao", children: "Em Manuten\u00E7\u00E3o" }), _jsx("option", { value: "baixado", children: "Baixado" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Categoria *" }), _jsxs("select", { value: formData.categoria_id || '', onChange: (e) => handleChange('categoria_id', e.target.value ? Number(e.target.value) : undefined), className: `w-full px-3 py-2 border rounded-lg
                    bg-white dark:bg-[#2a2a2a]
                    text-gray-900 dark:text-gray-100
                    ${errors.categoria_id
                                                        ? 'border-red-500 dark:border-red-400'
                                                        : 'border-gray-300 dark:border-gray-600'}
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors`, children: [_jsx("option", { value: "", children: "Selecione uma categoria" }), categorias.map((cat) => (_jsx("option", { value: cat.id, children: cat.nome }, cat.id)))] }), errors.categoria_id && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.categoria_id }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Setor *" }), _jsxs("select", { value: formData.setor_id || '', onChange: (e) => handleChange('setor_id', e.target.value ? Number(e.target.value) : undefined), className: `w-full px-3 py-2 border rounded-lg
                    bg-white dark:bg-[#2a2a2a]
                    text-gray-900 dark:text-gray-100
                    ${errors.setor_id
                                                        ? 'border-red-500 dark:border-red-400'
                                                        : 'border-gray-300 dark:border-gray-600'}
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors`, children: [_jsx("option", { value: "", children: "Selecione um setor" }), setores.map((setor) => (_jsx("option", { value: setor.id, children: setor.nome }, setor.id)))] }), errors.setor_id && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.setor_id }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Respons\u00E1vel *" }), _jsxs("select", { value: formData.responsavel_id || '', onChange: (e) => handleChange('responsavel_id', e.target.value ? Number(e.target.value) : undefined), className: `w-full px-3 py-2 border rounded-lg
                    bg-white dark:bg-[#2a2a2a]
                    text-gray-900 dark:text-gray-100
                    ${errors.responsavel_id
                                                        ? 'border-red-500 dark:border-red-400'
                                                        : 'border-gray-300 dark:border-gray-600'}
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors`, children: [_jsx("option", { value: "", children: "Selecione um respons\u00E1vel" }), usuarios.map((user) => (_jsx("option", { value: user.id, children: user.username }, user.id)))] }), errors.responsavel_id && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.responsavel_id }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Data de Aquisi\u00E7\u00E3o *" }), _jsxs("div", { className: "relative", children: [_jsx(Calendar, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "date", value: formData.data_aquisicao, onChange: (e) => handleChange('data_aquisicao', e.target.value), className: `w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.data_aquisicao
                                                                ? 'border-red-500 dark:border-red-400'
                                                                : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`, max: new Date().toISOString().split('T')[0] })] }), errors.data_aquisicao && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.data_aquisicao }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Valor de Aquisi\u00E7\u00E3o (R$) *" }), _jsxs("div", { className: "relative", children: [_jsx(DollarSign, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "number", value: formData.valor_aquisicao, onChange: (e) => handleChange('valor_aquisicao', Number(e.target.value)), step: "0.01", min: "0", className: `w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.valor_aquisicao
                                                                ? 'border-red-500 dark:border-red-400'
                                                                : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`, placeholder: "0.00" })] }), errors.valor_aquisicao && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.valor_aquisicao }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Valor Atual (R$) *" }), _jsxs("div", { className: "relative", children: [_jsx(DollarSign, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "number", value: formData.valor_atual, onChange: (e) => handleChange('valor_atual', Number(e.target.value)), step: "0.01", min: "0", max: formData.valor_aquisicao || undefined, className: `w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.valor_atual
                                                                ? 'border-red-500 dark:border-red-400'
                                                                : 'border-gray-300 dark:border-gray-600'}
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`, placeholder: "0.00" })] }), errors.valor_atual && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.valor_atual }))] })] }), _jsxs("div", { className: "flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700", children: [_jsx("button", { type: "button", onClick: onClose, disabled: saving, className: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300\r\n                  bg-white dark:bg-[#2a2a2a]\r\n                  border border-gray-300 dark:border-gray-600\r\n                  rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]\r\n                  disabled:opacity-50 disabled:cursor-not-allowed\r\n                  transition-colors", children: "Cancelar" }), _jsx("button", { type: "submit", disabled: saving, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white\r\n                  bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600\r\n                  rounded-lg shadow-sm hover:shadow-md\r\n                  disabled:opacity-50 disabled:cursor-not-allowed\r\n                  transition-all duration-200", children: saving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Salvando..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4" }), isEdit ? 'Atualizar' : 'Cadastrar', " Patrim\u00F4nio"] })) })] })] })] }) })] }));
};
export default PatrimonioModal;

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Save, 
  Loader2,
  DollarSign,
  Calendar,
  Hash,
  FileText,
  Building,
  User,
  Tag,
  AlertCircle
} from 'lucide-react';
import { usePatrimonios } from '../context/PatrimoniosContext';
import type {
  Patrimonio,
  PatrimonioCreate,
  PatrimonioUpdate,
  ValidationErrors,
  STATUS_LABELS,
  STATUS_COLORS
} from '../types/patrimonios.types';

interface PatrimonioModalProps {
  isOpen: boolean;
  onClose: () => void;
  patrimonio?: Patrimonio | null; // null para criar, Patrimonio para editar
  onSuccess?: () => void;
}

const PatrimonioModal: React.FC<PatrimonioModalProps> = ({
  isOpen,
  onClose,
  patrimonio,
  onSuccess
}) => {
  const { 
    categorias, 
    setores, 
    usuarios,
    createPatrimonio,
    updatePatrimonio,
    loading 
  } = usePatrimonios();

  const isEdit = !!patrimonio;
  
  // ========================================
  // ESTADOS DO FORMULÁRIO
  // ========================================
  
  const [formData, setFormData] = useState<PatrimonioCreate>({
    nome: '',
    descricao: '',
    numero_serie: '',
    categoria_id: undefined,
    setor_id: undefined,
    responsavel_id: undefined,
    data_aquisicao: '',
    valor_aquisicao: 0,
    valor_atual: 0,
    status: 'ativo'
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
          status: patrimonio.status || 'ativo'
        });
      } else {
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
          status: 'ativo'
        });
      }
      setErrors({});
      setSaveError(null);
    }
  }, [isOpen, patrimonio]);

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleChange = useCallback((
    field: keyof PatrimonioCreate,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpa erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validação especial para valor_atual
    if (field === 'valor_atual' && formData.valor_aquisicao) {
      if (Number(value) > Number(formData.valor_aquisicao)) {
        setErrors(prev => ({
          ...prev,
          valor_atual: 'Valor atual não pode ser maior que o valor de aquisição'
        }));
      }
    }

    // Validação especial para valor_aquisicao
    if (field === 'valor_aquisicao' && formData.valor_atual) {
      if (Number(formData.valor_atual) > Number(value)) {
        setErrors(prev => ({
          ...prev,
          valor_atual: 'Valor atual não pode ser maior que o valor de aquisição'
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.valor_atual;
          return newErrors;
        });
      }
    }
  }, [formData, errors]);

  // ========================================
  // VALIDAÇÃO
  // ========================================
  
  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Nome obrigatório e mínimo 3 caracteres
    if (!formData.nome) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 3) {
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
    } else {
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
      newErrors.valor_atual = 'Valor atual é obrigatório e deve ser maior ou igual a zero';
    }

    if (formData.valor_atual && formData.valor_aquisicao) {
      if (formData.valor_atual > formData.valor_aquisicao) {
        newErrors.valor_atual = 'Valor atual não pode ser maior que o valor de aquisição';
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
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      if (isEdit && patrimonio) {
        // Atualização
        const updateData: PatrimonioUpdate = { ...formData };
        await updatePatrimonio(patrimonio.id, updateData);
      } else {
        // Criação
        await createPatrimonio(formData);
      }

      // Sucesso
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar patrimônio:', err);
      setSaveError(
        err.response?.data?.detail || 
        `Erro ao ${isEdit ? 'atualizar' : 'criar'} patrimônio. Tente novamente.`
      );
    } finally {
      setSaving(false);
    }
  }, [formData, isEdit, patrimonio, validate, createPatrimonio, updatePatrimonio, onSuccess, onClose]);

  // ========================================
  // RENDER
  // ========================================
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {isEdit ? `Editar Patrimônio - ${patrimonio?.nome}` : 'Cadastrar Novo Patrimônio'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Erro geral */}
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{saveError}</p>
                </div>
              </div>
            )}

            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.nome 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`}
                    placeholder="Digite o nome do patrimônio"
                  />
                </div>
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nome}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => handleChange('descricao', e.target.value)}
                    rows={3}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.descricao 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`}
                    placeholder="Digite uma descrição detalhada (opcional)"
                  />
                </div>
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.descricao}</p>
                )}
              </div>

              {/* Número de Série */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Número de Série
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.numero_serie}
                    onChange={(e) => handleChange('numero_serie', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      border-gray-300 dark:border-gray-600
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors"
                    placeholder="Ex: SN123456"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg
                    bg-white dark:bg-[#2a2a2a]
                    text-gray-900 dark:text-gray-100
                    border-gray-300 dark:border-gray-600
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors"
                >
                  <option value="ativo">Ativo</option>
                  <option value="manutencao">Em Manutenção</option>
                  <option value="baixado">Baixado</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoria *
                </label>
                <select
                  value={formData.categoria_id || ''}
                  onChange={(e) => handleChange('categoria_id', e.target.value ? Number(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg
                    bg-white dark:bg-[#2a2a2a]
                    text-gray-900 dark:text-gray-100
                    ${errors.categoria_id 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors`}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
                {errors.categoria_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoria_id}</p>
                )}
              </div>

              {/* Setor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Setor *
                </label>
                <select
                  value={formData.setor_id || ''}
                  onChange={(e) => handleChange('setor_id', e.target.value ? Number(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg
                    bg-white dark:bg-[#2a2a2a]
                    text-gray-900 dark:text-gray-100
                    ${errors.setor_id 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors`}
                >
                  <option value="">Selecione um setor</option>
                  {setores.map(setor => (
                    <option key={setor.id} value={setor.id}>
                      {setor.nome}
                    </option>
                  ))}
                </select>
                {errors.setor_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.setor_id}</p>
                )}
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Responsável *
                </label>
                <select
                  value={formData.responsavel_id || ''}
                  onChange={(e) => handleChange('responsavel_id', e.target.value ? Number(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg
                    bg-white dark:bg-[#2a2a2a]
                    text-gray-900 dark:text-gray-100
                    ${errors.responsavel_id 
                      ? 'border-red-500 dark:border-red-400' 
                      : 'border-gray-300 dark:border-gray-600'
                    }
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors`}
                >
                  <option value="">Selecione um responsável</option>
                  {usuarios.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
                {errors.responsavel_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.responsavel_id}</p>
                )}
              </div>

              {/* Data de Aquisição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data de Aquisição *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.data_aquisicao}
                    onChange={(e) => handleChange('data_aquisicao', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.data_aquisicao 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.data_aquisicao && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.data_aquisicao}</p>
                )}
              </div>

              {/* Valor de Aquisição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor de Aquisição (R$) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.valor_aquisicao}
                    onChange={(e) => handleChange('valor_aquisicao', Number(e.target.value))}
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.valor_aquisicao 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`}
                    placeholder="0.00"
                  />
                </div>
                {errors.valor_aquisicao && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.valor_aquisicao}</p>
                )}
              </div>

              {/* Valor Atual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor Atual (R$) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.valor_atual}
                    onChange={(e) => handleChange('valor_atual', Number(e.target.value))}
                    step="0.01"
                    min="0"
                    max={formData.valor_aquisicao || undefined}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${errors.valor_atual 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      transition-colors`}
                    placeholder="0.00"
                  />
                </div>
                {errors.valor_atual && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.valor_atual}</p>
                )}
              </div>
            </div>

            {/* Footer com botões */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                  bg-white dark:bg-[#2a2a2a]
                  border border-gray-300 dark:border-gray-600
                  rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                  rounded-lg shadow-sm hover:shadow-md
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? 'Atualizar' : 'Cadastrar'} Patrimônio
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatrimonioModal;

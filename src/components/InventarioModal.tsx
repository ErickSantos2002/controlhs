import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import type {
  Inventario,
  InventarioCreate,
  InventarioUpdate,
} from '../types/inventarios.types';

interface InventarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  inventario?: Inventario | null;
  onSuccess?: () => void;
}

const InventarioModal: React.FC<InventarioModalProps> = ({
  isOpen,
  onClose,
  mode,
  inventario,
  onSuccess,
}) => {
  const { createInventario, updateInventario, patrimonios, usuarios } =
    useInventario();

  const [formData, setFormData] = useState<InventarioCreate>({
    patrimonio_id: 0,
    responsavel_id: null,
    situacao: 'pendente',
    observacoes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Preenche o formulário quando for edição
  useEffect(() => {
    if (mode === 'edit' && inventario) {
      setFormData({
        patrimonio_id: inventario.patrimonio_id,
        responsavel_id: inventario.responsavel_id || null,
        situacao: inventario.situacao,
        observacoes: inventario.observacoes || '',
      });
    } else {
      setFormData({
        patrimonio_id: 0,
        responsavel_id: null,
        situacao: 'pendente',
        observacoes: '',
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [mode, inventario, isOpen]);

  // Validação
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.patrimonio_id || formData.patrimonio_id === 0) {
      newErrors.patrimonio_id = 'Patrimônio é obrigatório';
    }

    if (!formData.situacao) {
      newErrors.situacao = 'Situação é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      if (mode === 'create') {
        await createInventario(formData);
      } else if (mode === 'edit' && inventario) {
        const updateData: InventarioUpdate = {
          situacao: formData.situacao,
          observacoes: formData.observacoes,
          responsavel_id: formData.responsavel_id,
        };
        await updateInventario(inventario.id, updateData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar inventário:', err);
      setSubmitError(
        err.response?.data?.detail ||
          'Erro ao salvar registro. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2d2d2d]">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {mode === 'create' ? 'Nova Verificação' : 'Editar Verificação'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Erro de Submit */}
          {submitError && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {submitError}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patrimônio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Patrimônio <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.patrimonio_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    patrimonio_id: parseInt(e.target.value),
                  })
                }
                disabled={mode === 'edit' || loading}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.patrimonio_id
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-[#2d2d2d]'
                }`}
              >
                <option value={0}>Selecione um patrimônio</option>
                {patrimonios
                  .filter((p) => p.status !== 'baixado')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.numero_serie ? `(${p.numero_serie})` : ''}
                    </option>
                  ))}
              </select>
              {errors.patrimonio_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.patrimonio_id}
                </p>
              )}
            </div>

            {/* Situação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Situação <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.situacao}
                onChange={(e) =>
                  setFormData({ ...formData, situacao: e.target.value })
                }
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.situacao
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-[#2d2d2d]'
                }`}
              >
                <option value="pendente">Pendente</option>
                <option value="conferido">Conferido</option>
                <option value="encontrado">Encontrado</option>
                <option value="nao_encontrado">Não Encontrado</option>
                <option value="divergencia">Divergência</option>
              </select>
              {errors.situacao && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.situacao}
                </p>
              )}
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Responsável
              </label>
              <select
                value={formData.responsavel_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsavel_id: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Nenhum</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observacoes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                disabled={loading}
                rows={4}
                placeholder="Adicione observações sobre a verificação..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200 dark:border-[#2d2d2d]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === 'create' ? 'Criar' : 'Salvar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventarioModal;

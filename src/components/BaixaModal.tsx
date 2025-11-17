import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useBaixas } from '../context/BaixasContext';
import type { BaixaCreate } from '../types/baixas.types';

interface BaixaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BaixaModal: React.FC<BaixaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { patrimonios, createBaixa } = useBaixas();

  const [formData, setFormData] = useState<BaixaCreate>({
    patrimonio_id: 0,
    tipo: 'descarte',
    motivo: '',
    documento_anexo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form quando abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        patrimonio_id: 0,
        tipo: 'descarte',
        motivo: '',
        documento_anexo: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.patrimonio_id || formData.patrimonio_id === 0) {
      newErrors.patrimonio_id = 'Selecione um patrimônio';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Selecione o tipo de baixa';
    }

    if (!formData.motivo?.trim()) {
      newErrors.motivo = 'O motivo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      await createBaixa(formData);
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar baixa:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-[#1e1e1e] rounded-xl max-w-2xl w-full mx-4 shadow-2xl border border-gray-200 dark:border-[#2d2d2d]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2d2d2d]">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[#facc15]">
              Registrar Baixa Patrimonial
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Patrimônio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Patrimônio *
              </label>
              <select
                value={formData.patrimonio_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    patrimonio_id: parseInt(e.target.value),
                  })
                }
                className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 border ${
                  errors.patrimonio_id
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-[#3a3a3a]'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value={0}>Selecione um patrimônio</option>
                {patrimonios
                  .filter((p) => p.status !== 'baixado')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                      {p.numero_serie ? ` (${p.numero_serie})` : ''}
                    </option>
                  ))}
              </select>
              {errors.patrimonio_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.patrimonio_id}
                </p>
              )}
            </div>

            {/* Tipo de Baixa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Baixa *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-[#3a3a3a] focus:ring-2 focus:ring-blue-500"
              >
                <option value="descarte">Descarte</option>
                <option value="perda">Perda</option>
                <option value="venda">Venda</option>
                <option value="doacao">Doação</option>
              </select>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motivo *
              </label>
              <textarea
                value={formData.motivo}
                onChange={(e) =>
                  setFormData({ ...formData, motivo: e.target.value })
                }
                rows={3}
                placeholder="Descreva o motivo da baixa..."
                className={`w-full px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 border ${
                  errors.motivo
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-[#3a3a3a]'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.motivo && (
                <p className="text-red-500 text-sm mt-1">{errors.motivo}</p>
              )}
            </div>

            {/* Documento Anexo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Documento Anexo (URL)
              </label>
              <input
                type="text"
                value={formData.documento_anexo}
                onChange={(e) =>
                  setFormData({ ...formData, documento_anexo: e.target.value })
                }
                placeholder="URL do documento (opcional)..."
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-[#3a3a3a] focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Registrando...' : 'Registrar Baixa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BaixaModal;

import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { useInventario } from '../context/InventarioContext';
import type {
  Inventario,
  InventarioCreate,
  InventarioUpdate,
  TipoInventario,
  StatusInventario,
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
  const { createInventario, updateInventario, usuarios, setores, categorias } =
    useInventario();

  const [formData, setFormData] = useState<{
    titulo: string;
    descricao: string;
    tipo: TipoInventario;
    filtro_setor_id: number | null;
    filtro_categoria_id: number | null;
    responsavel_id: number | null;
    status?: StatusInventario;
  }>({
    titulo: '',
    descricao: '',
    tipo: 'geral',
    filtro_setor_id: null,
    filtro_categoria_id: null,
    responsavel_id: null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Preenche o formulário quando for edição
  useEffect(() => {
    if (mode === 'edit' && inventario) {
      setFormData({
        titulo: inventario.titulo,
        descricao: inventario.descricao || '',
        tipo: inventario.tipo,
        filtro_setor_id: inventario.filtro_setor_id || null,
        filtro_categoria_id: inventario.filtro_categoria_id || null,
        responsavel_id: inventario.responsavel_id || null,
        status: inventario.status,
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        tipo: 'geral',
        filtro_setor_id: null,
        filtro_categoria_id: null,
        responsavel_id: null,
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [mode, inventario, isOpen]);

  // Validação
  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (formData.tipo === 'por_setor' && !formData.filtro_setor_id) {
      newErrors.filtro_setor_id = 'Selecione um setor';
    }

    if (formData.tipo === 'por_categoria' && !formData.filtro_categoria_id) {
      newErrors.filtro_categoria_id = 'Selecione uma categoria';
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
        const createData: InventarioCreate = {
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim() || null,
          tipo: formData.tipo,
          filtro_setor_id:
            formData.tipo === 'por_setor' ? formData.filtro_setor_id : null,
          filtro_categoria_id:
            formData.tipo === 'por_categoria'
              ? formData.filtro_categoria_id
              : null,
          responsavel_id: formData.responsavel_id,
        };
        await createInventario(createData);
      } else if (mode === 'edit' && inventario) {
        const updateData: InventarioUpdate = {
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim() || null,
          responsavel_id: formData.responsavel_id,
          status: formData.status,
        };
        await updateInventario(inventario.id, updateData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar sessão de inventário:', err);
      setSubmitError(
        err.response?.data?.detail ||
          'Erro ao salvar sessão. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Limpar filtros quando tipo mudar
  useEffect(() => {
    if (mode === 'create') {
      if (formData.tipo !== 'por_setor') {
        setFormData((prev) => ({ ...prev, filtro_setor_id: null }));
      }
      if (formData.tipo !== 'por_categoria') {
        setFormData((prev) => ({ ...prev, filtro_categoria_id: null }));
      }
    }
  }, [formData.tipo, mode]);

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
            {mode === 'create' ? 'Nova Sessão de Inventário' : 'Editar Sessão'}
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

          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                disabled={loading}
                placeholder="Ex: Inventário Anual 2024"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.titulo
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-[#2d2d2d]'
                }`}
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.titulo}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                disabled={loading}
                rows={3}
                placeholder="Adicione detalhes sobre esta sessão de inventário..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Tipo (somente na criação) */}
            {mode === 'create' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Inventário
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo: e.target.value as TipoInventario,
                      })
                    }
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="geral">Geral (todos os patrimônios)</option>
                    <option value="por_setor">Por Setor</option>
                    <option value="por_categoria">Por Categoria</option>
                  </select>
                </div>

                {/* Filtro de Setor */}
                {formData.tipo === 'por_setor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Setor <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.filtro_setor_id || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          filtro_setor_id: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      disabled={loading}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.filtro_setor_id
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-[#2d2d2d]'
                      }`}
                    >
                      <option value="">Selecione um setor</option>
                      {setores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                    </select>
                    {errors.filtro_setor_id && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.filtro_setor_id}
                      </p>
                    )}
                  </div>
                )}

                {/* Filtro de Categoria */}
                {formData.tipo === 'por_categoria' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.filtro_categoria_id || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          filtro_categoria_id: e.target.value
                            ? parseInt(e.target.value)
                            : null,
                        })
                      }
                      disabled={loading}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.filtro_categoria_id
                          ? 'border-red-500'
                          : 'border-gray-300 dark:border-[#2d2d2d]'
                      }`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                    {errors.filtro_categoria_id && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.filtro_categoria_id}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Status (somente na edição) */}
            {mode === 'edit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || 'em_andamento'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as StatusInventario,
                    })
                  }
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d2d2d] rounded-lg bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            )}

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
                  {mode === 'create' ? 'Criar Sessão' : 'Salvar Alterações'}
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

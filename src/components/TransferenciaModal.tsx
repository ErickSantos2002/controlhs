import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Package,
  Building,
  User,
  Hash,
  FileText,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
} from 'lucide-react';
import { useTransferencias } from '../context/TransferenciasContext';
import {
  TransferenciaCreate,
  WizardTransferenciaData,
  WizardStep,
  Patrimonio,
} from '../types/transferencias.types';

interface TransferenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TransferenciaModal: React.FC<TransferenciaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    patrimonios,
    setores,
    usuarios,
    createTransferencia,
    verificarTransferenciaPendente,
    loading,
  } = useTransferencias();

  // ========================================
  // ESTADOS DO WIZARD
  // ========================================

  const [currentStep, setCurrentStep] = useState<WizardStep>(
    WizardStep.SELECAO_PATRIMONIO,
  );
  const [wizardData, setWizardData] = useState<WizardTransferenciaData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      const patrimonio = patrimonios.find(
        (p) => p.id === wizardData.patrimonio_id,
      );
      if (patrimonio) {
        setWizardData((prev) => ({
          ...prev,
          patrimonio,
          setor_origem_id: patrimonio.setor_id,
          responsavel_origem_id: patrimonio.responsavel_id,
        }));
      }
    }
  }, [wizardData.patrimonio_id, patrimonios]);

  // ========================================
  // VALIDAÇÕES POR ETAPA
  // ========================================

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!wizardData.patrimonio_id) {
      newErrors.patrimonio = 'Selecione um patrimônio';
    } else {
      // Verifica se o patrimônio está ativo
      const patrimonio = patrimonios.find(
        (p) => p.id === wizardData.patrimonio_id,
      );
      if (patrimonio?.status === 'baixado') {
        newErrors.patrimonio =
          'Este patrimônio foi baixado e não pode ser transferido';
      }

      // Verifica se já existe transferência pendente
      if (verificarTransferenciaPendente(wizardData.patrimonio_id!)) {
        newErrors.patrimonio =
          'Este patrimônio já possui uma transferência pendente';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!wizardData.setor_destino_id) {
      newErrors.setor = 'Selecione o setor de destino';
    } else if (wizardData.setor_destino_id === wizardData.setor_origem_id) {
      newErrors.setor = 'O setor de destino deve ser diferente do setor atual';
    }

    if (!wizardData.responsavel_destino_id) {
      newErrors.responsavel = 'Selecione o responsável de destino';
    } else if (
      wizardData.responsavel_destino_id === wizardData.responsavel_origem_id
    ) {
      newErrors.responsavel =
        'O responsável de destino deve ser diferente do atual';
    }

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
    } else if (currentStep === WizardStep.DESTINO_TRANSFERENCIA) {
      if (validateStep2()) {
        setCurrentStep(WizardStep.CONFIRMACAO);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === WizardStep.DESTINO_TRANSFERENCIA) {
      setCurrentStep(WizardStep.SELECAO_PATRIMONIO);
    } else if (currentStep === WizardStep.CONFIRMACAO) {
      setCurrentStep(WizardStep.DESTINO_TRANSFERENCIA);
    }
  };

  // ========================================
  // SUBMIT DA TRANSFERÊNCIA
  // ========================================

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      const data: TransferenciaCreate = {
        patrimonio_id: wizardData.patrimonio_id!,
        setor_origem_id: wizardData.setor_origem_id,
        setor_destino_id: wizardData.setor_destino_id,
        responsavel_origem_id: wizardData.responsavel_origem_id,
        responsavel_destino_id: wizardData.responsavel_destino_id,
        motivo: wizardData.motivo!,
      };

      await createTransferencia(data);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err: any) {
      console.error('Erro ao criar transferência:', err);
      setSaveError(
        err.response?.data?.detail || 'Erro ao solicitar transferência',
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const getNomePatrimonio = () => {
    return wizardData.patrimonio?.nome || 'N/A';
  };

  const getNomeSetorOrigem = () => {
    const setor = setores.find((s) => s.id === wizardData.setor_origem_id);
    return setor?.nome || 'N/A';
  };

  const getNomeSetorDestino = () => {
    const setor = setores.find((s) => s.id === wizardData.setor_destino_id);
    return setor?.nome || 'N/A';
  };

  const getNomeResponsavelOrigem = () => {
    const user = usuarios.find(
      (u) => u.id === wizardData.responsavel_origem_id,
    );
    return user?.username || 'N/A';
  };

  const getNomeResponsavelDestino = () => {
    const user = usuarios.find(
      (u) => u.id === wizardData.responsavel_destino_id,
    );
    return user?.username || 'N/A';
  };

  if (!isOpen) return null;

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center">
        <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Solicitar Transferência de Patrimônio
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={saving}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-center mb-6">
              {/* Step 1 */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  currentStep >= 1
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                1
              </div>

              {/* Line 1-2 */}
              <div
                className={`h-1 w-16 transition-all ${
                  currentStep >= 2
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />

              {/* Step 2 */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  currentStep >= 2
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                2
              </div>

              {/* Line 2-3 */}
              <div
                className={`h-1 w-16 transition-all ${
                  currentStep >= 3
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />

              {/* Step 3 */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  currentStep >= 3
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                3
              </div>
            </div>

            {/* Step Titles */}
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
              <span
                className={
                  currentStep === 1
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : ''
                }
              >
                Patrimônio
              </span>
              <span
                className={
                  currentStep === 2
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : ''
                }
              >
                Destino
              </span>
              <span
                className={
                  currentStep === 3
                    ? 'font-semibold text-blue-600 dark:text-blue-400'
                    : ''
                }
              >
                Confirmação
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Mensagem de erro */}
            {saveError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Erro ao solicitar transferência
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {saveError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Seleção do Patrimônio */}
            {currentStep === WizardStep.SELECAO_PATRIMONIO && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    Selecione o Patrimônio *
                  </label>
                  <select
                    value={wizardData.patrimonio_id || ''}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        patrimonio_id: parseInt(e.target.value),
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${
                        errors.patrimonio
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      focus:border-transparent transition-colors`}
                  >
                    <option value="">Selecione um patrimônio...</option>
                    {patrimonios
                      .filter((p) => p.status !== 'baixado')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} {p.numero_serie ? `(${p.numero_serie})` : ''}
                        </option>
                      ))}
                  </select>
                  {errors.patrimonio && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.patrimonio}
                    </p>
                  )}
                </div>

                {/* Informações do Patrimônio Selecionado */}
                {wizardData.patrimonio && (
                  <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      Informações Atuais do Patrimônio
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Categoria:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {wizardData.patrimonio?.categoria_id
                            ? patrimonios.find(
                                (p) => p.id === wizardData.patrimonio?.id,
                              )?.nome
                            : 'N/A'}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Status:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {wizardData.patrimonio.status === 'ativo'
                            ? 'Ativo'
                            : wizardData.patrimonio.status === 'manutencao'
                              ? 'Em Manutenção'
                              : 'Baixado'}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Setor Atual:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {getNomeSetorOrigem()}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Responsável Atual:
                        </span>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {getNomeResponsavelOrigem()}
                        </p>
                      </div>
                    </div>

                    {wizardData.patrimonio.descricao && (
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Descrição:
                        </span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {wizardData.patrimonio.descricao}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Destino da Transferência */}
            {currentStep === WizardStep.DESTINO_TRANSFERENCIA && (
              <div className="space-y-4">
                {/* Informação de Origem (ReadOnly) */}
                <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Origem
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Setor:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getNomeSetorOrigem()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Responsável:
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getNomeResponsavelOrigem()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Novo Setor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Novo Setor *
                  </label>
                  <select
                    value={wizardData.setor_destino_id || ''}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        setor_destino_id: parseInt(e.target.value),
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${
                        errors.setor
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      focus:border-transparent transition-colors`}
                  >
                    <option value="">Selecione o setor de destino...</option>
                    {setores
                      .filter((s) => s.id !== wizardData.setor_origem_id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                  </select>
                  {errors.setor && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.setor}
                    </p>
                  )}
                </div>

                {/* Novo Responsável */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Novo Responsável *
                  </label>
                  <select
                    value={wizardData.responsavel_destino_id || ''}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        responsavel_destino_id: parseInt(e.target.value),
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${
                        errors.responsavel
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      focus:border-transparent transition-colors`}
                  >
                    <option value="">
                      Selecione o responsável de destino...
                    </option>
                    {usuarios
                      .filter((u) => u.id !== wizardData.responsavel_origem_id)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username}
                        </option>
                      ))}
                  </select>
                  {errors.responsavel && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.responsavel}
                    </p>
                  )}
                </div>

                {/* Motivo da Transferência */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Motivo da Transferência *
                  </label>
                  <textarea
                    value={wizardData.motivo || ''}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        motivo: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Descreva o motivo da transferência (mínimo 10 caracteres)"
                    className={`w-full px-3 py-2 border rounded-lg
                      bg-white dark:bg-[#2a2a2a]
                      text-gray-900 dark:text-gray-100
                      ${
                        errors.motivo
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      focus:border-transparent transition-colors`}
                  />
                  {errors.motivo && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.motivo}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Confirmação */}
            {currentStep === WizardStep.CONFIRMACAO && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Confirmação da Transferência
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Esta solicitação será enviada para aprovação. Após
                        aprovada, o patrimônio poderá ser transferido.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resumo da Transferência */}
                <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Resumo da Transferência
                  </h3>

                  {/* Patrimônio */}
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Patrimônio:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {getNomePatrimonio()}
                      {wizardData.patrimonio?.numero_serie && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          (NS: {wizardData.patrimonio.numero_serie})
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Transferência de Setor */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        De
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getNomeSetorOrigem()}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Para
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getNomeSetorDestino()}
                      </p>
                    </div>
                  </div>

                  {/* Transferência de Responsável */}
                  <div className="flex items-center gap-3 py-2">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        De
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getNomeResponsavelOrigem()}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Para
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {getNomeResponsavelDestino()}
                      </p>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Motivo:
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {wizardData.motivo}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer com botões */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                    text-gray-700 dark:text-gray-300
                    bg-white dark:bg-[#2a2a2a]
                    border border-gray-300 dark:border-gray-600
                    rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}

              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium
                  text-gray-700 dark:text-gray-300
                  bg-white dark:bg-[#2a2a2a]
                  border border-gray-300 dark:border-gray-600
                  rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors"
              >
                Cancelar
              </button>
            </div>

            <div>
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                    rounded-lg shadow-sm hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                    bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600
                    rounded-lg shadow-sm hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Solicitando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirmar Transferência
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferenciaModal;

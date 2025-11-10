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
  // 🆕 OBTER DADOS DO USUÁRIO LOGADO
  // ========================================

  const getUserId = (): number => {
    const id = localStorage.getItem('id');
    return id ? parseInt(id) : 0;
  };

  const getUserRole = (): string => {
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
      const patrimonio = patrimonios.find(
        (p) => p.id === wizardData.patrimonio_id,
      );
      
      // ✅ Verifica permissão baseada na role
      const userId = getUserId();
      const userRole = getUserRole();
      
      // Usuário comum só pode transferir patrimônios sob sua responsabilidade
      if (userRole === 'Usuário' && patrimonio && patrimonio.responsavel_id !== userId) {
        newErrors.patrimonio =
          'Você não tem permissão para transferir este patrimônio';
      }

      // Verifica se o patrimônio está ativo
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

  // ✅ PROBLEMA 3: Nova validação - permite apenas setor OU responsável mudar
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

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
      if (
        wizardData.responsavel_destino_id === wizardData.responsavel_origem_id
      ) {
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
    return setor?.nome || 'Manter atual';
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
    return user?.username || 'Manter atual';
  };

  // ========================================
  // RENDERIZAÇÃO CONDICIONAL
  // ========================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <ArrowRightLeft className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Nova Transferência
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Passo {currentStep} de 3
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Erro ao criar transferência
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {saveError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* STEP 1: Seleção de Patrimônio */}
            {currentStep === WizardStep.SELECAO_PATRIMONIO && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Selecione o patrimônio
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {getUserRole() === 'Usuário'
                          ? 'Escolha o patrimônio que deseja transferir. Apenas patrimônios ativos dos quais você é responsável podem ser transferidos.'
                          : 'Escolha o patrimônio que deseja transferir. Apenas patrimônios ativos podem ser transferidos.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Select de Patrimônio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    Patrimônio *
                  </label>
                  <select
                    value={wizardData.patrimonio_id || ''}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        patrimonio_id: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
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
                    <option value="">Selecione um patrimônio</option>
                    {patrimoniosDoUsuario.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                        {p.numero_serie && ` (NS: ${p.numero_serie})`}
                      </option>
                    ))}
                  </select>
                  {errors.patrimonio && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.patrimonio}
                    </p>
                  )}
                  
                  {/* 🆕 Mensagem quando não há patrimônios disponíveis */}
                  {patrimoniosDoUsuario.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                      ⚠️ {getUserRole() === 'Usuário' 
                        ? 'Você não possui patrimônios ativos sob sua responsabilidade.'
                        : 'Não há patrimônios ativos disponíveis no sistema.'}
                    </p>
                  )}
                </div>

                {/* Detalhes do Patrimônio Selecionado */}
                {wizardData.patrimonio && (
                  <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-2">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                      Detalhes do Patrimônio
                    </h3>

                    {wizardData.patrimonio.numero_serie && (
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          NS:
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">
                          {wizardData.patrimonio.numero_serie}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Setor Atual:
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {getNomeSetorOrigem()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Responsável Atual:
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {getNomeResponsavelOrigem()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Destino da Transferência */}
            {currentStep === WizardStep.DESTINO_TRANSFERENCIA && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Defina o destino da transferência
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        Você pode transferir apenas o setor, apenas o responsável, ou ambos. Pelo menos um deve ser alterado.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🆕 Erro geral (quando nenhum campo foi preenchido) */}
                {errors.geral && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.geral}
                    </p>
                  </div>
                )}

                {/* Setor de Destino */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Setor de Destino (opcional)
                  </label>
                  <select
                    value={wizardData.setor_destino_id || ''}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        setor_destino_id: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
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
                    <option value="">Manter setor atual</option>
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

                {/* Responsável de Destino */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Responsável de Destino (opcional)
                  </label>
                  <select
                    value={wizardData.responsavel_destino_id || ''}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        responsavel_destino_id: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
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
                    <option value="">Manter responsável atual</option>
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

                  {/* Transferência de Setor (só mostra se mudou) */}
                  {wizardData.setor_destino_id && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="text-center flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Setor Atual
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {getNomeSetorOrigem()}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <div className="text-center flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Novo Setor
                        </p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {getNomeSetorDestino()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Transferência de Responsável (só mostra se mudou) */}
                  {wizardData.responsavel_destino_id && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="text-center flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Responsável Atual
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {getNomeResponsavelOrigem()}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <div className="text-center flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Novo Responsável
                        </p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {getNomeResponsavelDestino()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 🆕 Indicadores de "mantém atual" */}
                  {!wizardData.setor_destino_id && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      • Setor: mantém atual ({getNomeSetorOrigem()})
                    </div>
                  )}
                  {!wizardData.responsavel_destino_id && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      • Responsável: mantém atual ({getNomeResponsavelOrigem()})
                    </div>
                  )}

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
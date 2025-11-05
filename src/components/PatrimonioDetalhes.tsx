import React from 'react';
import { 
  X,
  Edit,
  FileText,
  Hash,
  Calendar,
  DollarSign,
  TrendingDown,
  MapPin,
  Building,
  User,
  Tag,
  Clock,
  Info
} from 'lucide-react';
import { usePatrimonios } from '../context/PatrimoniosContext';
import type { Patrimonio, STATUS_LABELS, STATUS_COLORS } from '../types/patrimonios.types';

interface PatrimonioDetalhesProps {
  isOpen: boolean;
  onClose: () => void;
  patrimonio: Patrimonio | null;
  onEdit?: (patrimonio: Patrimonio) => void;
}

const PatrimonioDetalhes: React.FC<PatrimonioDetalhesProps> = ({
  isOpen,
  onClose,
  patrimonio,
  onEdit
}) => {
  const { categorias, setores, usuarios } = usePatrimonios();

  if (!isOpen || !patrimonio) return null;

  // ========================================
  // HELPERS
  // ========================================

  const formatCurrency = (value?: number): string => {
    if (value == null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (date?: string): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date?: string): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('pt-BR');
  };

  const getCategoriaNome = (): string => {
    const categoria = categorias.find(c => c.id === patrimonio.categoria_id);
    return categoria?.nome || 'N/A';
  };

  const getSetorNome = (): string => {
    const setor = setores.find(s => s.id === patrimonio.setor_id);
    return setor?.nome || 'N/A';
  };

  const getResponsavelNome = (): string => {
    const responsavel = usuarios.find(u => u.id === patrimonio.responsavel_id);
    return responsavel?.username || 'N/A';
  };

  const calcularDepreciacao = (): {
    valor: number;
    percentual: number;
  } => {
    const valorAquisicao = patrimonio.valor_aquisicao || 0;
    const valorAtual = patrimonio.valor_atual || 0;
    const depreciacao = valorAquisicao - valorAtual;
    const percentual = valorAquisicao > 0 
      ? ((depreciacao / valorAquisicao) * 100)
      : 0;

    return {
      valor: depreciacao,
      percentual
    };
  };

  const depreciacao = calcularDepreciacao();

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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Detalhes do Patrimônio
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Seção: Informações Básicas */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Informações Básicas
                </h3>
              </div>
              
              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3">
                {/* Nome e Status */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nome</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {patrimonio.nome}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      patrimonio.status === 'ativo'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                        : patrimonio.status === 'manutencao'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                    }`}>
                      {patrimonio.status === 'ativo' ? 'Ativo' 
                        : patrimonio.status === 'manutencao' ? 'Em Manutenção' 
                        : 'Baixado'}
                    </span>
                  </div>
                </div>

                {/* Descrição */}
                {patrimonio.descricao && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Descrição</p>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      {patrimonio.descricao}
                    </p>
                  </div>
                )}

                {/* Número de Série */}
                {patrimonio.numero_serie && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Número de Série</p>
                    <p className="text-base font-mono text-gray-700 dark:text-gray-300">
                      {patrimonio.numero_serie}
                    </p>
                  </div>
                )}

                {/* ID */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID do Patrimônio</p>
                  <p className="text-base font-mono text-gray-700 dark:text-gray-300">
                    #{patrimonio.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Seção: Dados Financeiros */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Dados Financeiros
                </h3>
              </div>
              
              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Valor de Aquisição */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor de Aquisição</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(patrimonio.valor_aquisicao)}
                    </p>
                  </div>

                  {/* Valor Atual */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor Atual</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(patrimonio.valor_atual)}
                    </p>
                  </div>

                  {/* Depreciação */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Depreciação</p>
                    <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {formatCurrency(depreciacao.valor)}
                    </p>
                  </div>

                  {/* % de Depreciação */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">% de Depreciação</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {depreciacao.percentual.toFixed(1)}%
                      </p>
                      <TrendingDown className="w-4 h-4 text-orange-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Localização e Responsabilidade */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Localização e Responsabilidade
                </h3>
              </div>
              
              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Categoria */}
                  <div className="flex items-start gap-2">
                    <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Categoria</p>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                        {getCategoriaNome()}
                      </p>
                    </div>
                  </div>

                  {/* Setor */}
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Setor</p>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                        {getSetorNome()}
                      </p>
                    </div>
                  </div>

                  {/* Responsável */}
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Responsável</p>
                      <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                        {getResponsavelNome()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Datas */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Datas
                </h3>
              </div>
              
              <div className="bg-gray-50 dark:bg-[#2a2a2a] rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Data de Aquisição */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Data de Aquisição</p>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {formatDate(patrimonio.data_aquisicao)}
                    </p>
                  </div>

                  {/* Data de Cadastro */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Data de Cadastro</p>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {formatDateTime(patrimonio.criado_em)}
                    </p>
                  </div>

                  {/* Última Atualização */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Última Atualização</p>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {formatDateTime(patrimonio.atualizado_em)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer com botões */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                bg-white dark:bg-[#2a2a2a]
                border border-gray-300 dark:border-gray-600
                rounded-lg hover:bg-gray-50 dark:hover:bg-[#333333]
                transition-colors"
            >
              Fechar
            </button>
            
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(patrimonio);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                  rounded-lg shadow-sm hover:shadow-md
                  transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
                Editar Patrimônio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatrimonioDetalhes;

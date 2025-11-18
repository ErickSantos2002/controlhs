import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar erros em componentes React
 * Previne que um erro em um componente quebre toda a aplicação
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de fallback
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para monitoramento
    logger.error('Error Boundary capturou um erro:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0f0f0f] dark:to-[#1a1a1a] px-4">
          <div className="max-w-md w-full bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl p-8 border border-gray-200 dark:border-[#2d2d2d]">
            {/* Ícone de Erro */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4">
                <svg
                  className="w-12 h-12 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Ops! Algo deu errado
            </h1>

            {/* Descrição */}
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Encontramos um problema inesperado. Não se preocupe, seus dados estão seguros.
            </p>

            {/* Detalhes do Erro (apenas em desenvolvimento) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                  Detalhes do erro (dev):
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white
                          rounded-lg transition-colors font-medium shadow-sm"
              >
                Voltar ao Dashboard
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300
                          dark:bg-[#2a2a2a] dark:hover:bg-[#333333]
                          text-gray-700 dark:text-gray-200
                          rounded-lg transition-colors font-medium"
              >
                Recarregar Página
              </button>
            </div>

            {/* Informação Adicional */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

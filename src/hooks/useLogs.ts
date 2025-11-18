import { useContext } from 'react';
import LogsContext from '../context/LogsContext';

/**
 * Hook customizado para acessar o contexto de Logs
 * @returns Contexto de logs com estados e funções
 * @throws Error se usado fora do LogsProvider
 */
export function useLogs() {
  const context = useContext(LogsContext);

  if (!context) {
    throw new Error('useLogs deve ser usado dentro do LogsProvider');
  }

  return context;
}

/**
 * Sistema de logging condicional
 * Em produção, apenas erros são exibidos
 * Em desenvolvimento, todos os logs são exibidos
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log de informação (apenas em desenvolvimento)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log de aviso (apenas em desenvolvimento)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log de erro (sempre exibido)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log de informação (sempre exibido)
   */
  info: (...args: any[]) => {
    console.info(...args);
  },
};

export default logger;

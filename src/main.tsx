// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardProvider } from './context/DashboardContext';
import { TransferenciasProvider } from './context/TransferenciasContext';
import { PatrimoniosProvider } from './context/PatrimoniosContext';
import { CadastrosProvider } from './context/CadastrosContext';
import { InventarioProvider } from './context/InventarioContext';
import { LogsProvider } from './context/LogsContext';
import './styles/index.css'; // Importa o Tailwind e estilos globais

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TransferenciasProvider>
            <PatrimoniosProvider>
              <CadastrosProvider>
                <InventarioProvider>
                  <DashboardProvider>
                    <LogsProvider>
                      <BrowserRouter>
                        <App />
                      </BrowserRouter>
                    </LogsProvider>
                  </DashboardProvider>
                </InventarioProvider>
              </CadastrosProvider>
            </PatrimoniosProvider>
          </TransferenciasProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

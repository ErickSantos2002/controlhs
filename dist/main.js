import { jsx as _jsx } from "react/jsx-runtime";
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardProvider } from './context/DashboardContext';
import { TransferenciasProvider } from './context/TransferenciasContext';
import { PatrimoniosProvider } from './context/PatrimoniosContext';
import './styles/index.css'; // Importa o Tailwind e estilos globais
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(ThemeProvider, { children: _jsx(AuthProvider, { children: _jsx(TransferenciasProvider, { children: _jsx(PatrimoniosProvider, { children: _jsx(DashboardProvider, { children: _jsx(BrowserRouter, { children: _jsx(App, {}) }) }) }) }) }) }) }));

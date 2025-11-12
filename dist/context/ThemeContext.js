import { jsx as _jsx } from "react/jsx-runtime";
// src/context/ThemeContext.tsx
import { createContext, useContext, useState, useEffect, } from 'react';
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    // 🔹 Estado inicial com persistência
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });
    // 🔹 Sincroniza com <html> e localStorage sempre que darkMode mudar
    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);
    // 🔹 Alterna o modo escuro manualmente (botão)
    const toggleDarkMode = () => setDarkMode((prev) => !prev);
    // 🔹 Ativa o modo escuro automaticamente no login
    const setDarkModeOnLogin = () => setDarkMode(true);
    return (_jsx(ThemeContext.Provider, { value: { darkMode, toggleDarkMode, setDarkModeOnLogin }, children: _jsx("div", { className: darkMode
                ? 'dark bg-darkGray text-lightGray min-h-screen' // 🎨 novo tema cinza
                : 'bg-gray-100 text-black min-h-screen', children: children }) }));
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error('useTheme deve ser usado dentro de ThemeProvider');
    return context;
};

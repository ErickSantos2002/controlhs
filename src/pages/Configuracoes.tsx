import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

const Configuracoes: React.FC = () => {
  const { user, loading } = useAuth();
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [novoValor, setNovoValor] = useState<string>("");

  const iniciarEdicao = (id: number, valorAtual: string) => {
    setEditandoId(id);
    setNovoValor(valorAtual);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNovoValor("");
  };

  // Se ainda está carregando auth
  if (loading) {
    return <div className="p-6 text-gray-500 dark:text-gray-300">Verificando permissões...</div>;
  }

  // Se não for admin
  if (!user || user.role !== "admin") {
    return (
      <div className="p-6 text-red-600 dark:text-red-400 text-center font-semibold">
        Acesso negado. Esta página é restrita a administradores.
      </div>
    );

    // Ou, se preferir redirecionar:
    // return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6">
      {/* Card de título e descrição */}
      <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl p-6 mb-6 transition-colors">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-400 mb-2">
          Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gerencie os parâmetros utilizados no Dashboard.
        </p>
      </div>

      {/* Lista de configurações */}
      <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow p-4 transition-colors">
      
      </div>
    </div>
  );
};

export default Configuracoes;

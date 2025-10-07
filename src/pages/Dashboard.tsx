import React from "react";
import { useAuth } from "../hooks/useAuth";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // ---------- COMPONENTE VELOCÍMETRO ----------
  const Speedometer = ({
    progress = 0,
    color,
    value = 0,
    goal,
    bonusLabel,
  }: {
    progress?: number;
    color: string;
    value?: number;
    goal: number;
    bonusLabel: string;
  }) => {
    const safeProgress = isNaN(progress)
      ? 0
      : Math.min(Math.max(progress, 0), 100);

    const radius = 60;
    const circumference = Math.PI * radius;
    const dash = (safeProgress / 100) * circumference;

    return (
      <div className="flex flex-col items-center p-2 w-full">
        <svg width="180" height="100" viewBox="0 0 160 100">
          <path
            d="M20 80 A60 60 0 0 1 140 80"
            fill="none"
            stroke="#3a3a3a" // 🎨 tom de cinza para o modo escuro
            strokeWidth="12"
          />
          <path
            d="M20 80 A60 60 0 0 1 140 80"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={`${dash}, ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">Progresso</p>
          <p className="text-xl font-bold text-blue-600 dark:text-lightGray">
            {safeProgress.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Valor Atual:{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              R$ {value.toLocaleString("pt-BR")}
            </span>
          </p>
          {goal - value > 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Diferença até a meta:{" "}
              <span className="text-red-600 dark:text-red-400">
                R$
                {(goal - value).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          ) : (
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
              Meta atingida! 🎉
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {bonusLabel}
        </p>
      </div>
    );
  };

  // ---------- MAIN ----------
  return (
    <div className="p-6 bg-gray-100 dark:bg-darkGray transition-colors min-h-screen md:min-h-0 md:h-full">
      {/* Cabeçalho */}
      <div className="bg-white dark:bg-mediumGray shadow-sm rounded-xl border border-gray-200 dark:border-accentGray">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-lightGray">
            Meta Quadrimestral - Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Bem-vindo,{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {user?.username}
            </span>{" "}
            ({user?.role})
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Acompanhe o quanto falta para a empresa atingir a meta.
          </p>
        </div>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="bg-white dark:bg-mediumGray rounded-xl shadow p-8 mt-6 w-full max-w-[1600px] mx-auto transition-colors border border-gray-200 dark:border-accentGray">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-lightGray">
              Relatório de Faturamento e Bonificação
            </h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-sm text-justify">
              Esta página exibe o{" "}
              <strong className="text-gray-900 dark:text-lightGray">
                faturamento total do quadrimestre atual
              </strong>
              , considerando as Notas Fiscais de Venda e Serviço. Ao lado, temos
              um{" "}
              <strong className="dark:text-lightGray">gráfico velocímetro</strong>{" "}
              com faixas de bonificação. Ao atingir cada marcação, a equipe
              receberá um{" "}
              <strong className="dark:text-lightGray">PL proporcional</strong>{" "}
              à porcentagem alcançada da meta.
            </p>
          </div>

          {/* COLUNA DIREITA */}
          <div className="lg:col-span-3 flex flex-col w-full">
            <div className="flex justify-center lg:justify-end">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-lightGray">
                Quadrimestre Atual
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-8 w-full">
              {/* Lista à esquerda */}
              <div className="md:w-1/3">
                <ul className="text-gray-700 dark:text-gray-200 space-y-4 text-left">
                  {/* Inserir conteúdo da lista aqui */}
                </ul>
              </div>

              {/* Velocímetros à direita */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {/* Exemplo: <Speedometer progress={75} color="#2563eb" value={75000} goal={100000} bonusLabel="Meta 1"/> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

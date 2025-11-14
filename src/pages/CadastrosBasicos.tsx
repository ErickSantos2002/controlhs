import React, { useState } from 'react';
import { Settings, Tag, Building, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CadastrosProvider } from '../context/CadastrosContext';
import CategoriasTab from '../components/cadastros/CategoriasTab';
import SetoresTab from '../components/cadastros/SetoresTab';
import UsuariosTab from '../components/cadastros/UsuariosTab';
import type { TipoAba } from '../types/cadastros.types';

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const CadastrosBasicos: React.FC = () => {
  const { user } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState<TipoAba>('categorias');

  // ========================================
  // VERIFICAÇÃO DE PERMISSÕES
  // ========================================

  const podeVerUsuarios = user?.role === 'Administrador';

  // ========================================
  // CONFIGURAÇÃO DAS ABAS
  // ========================================

  interface AbaConfig {
    id: TipoAba;
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
    visible: boolean;
  }

  const abas: AbaConfig[] = [
    {
      id: 'categorias',
      label: 'Categorias',
      icon: <Tag className="w-4 h-4" />,
      component: <CategoriasTab />,
      visible: true,
    },
    {
      id: 'setores',
      label: 'Setores',
      icon: <Building className="w-4 h-4" />,
      component: <SetoresTab />,
      visible: true,
    },
    {
      id: 'usuarios',
      label: 'Usuários',
      icon: <Users className="w-4 h-4" />,
      component: <UsuariosTab />,
      visible: podeVerUsuarios,
    },
  ];

  // Filtra abas visíveis
  const abasVisiveis = abas.filter(aba => aba.visible);

  // Se a aba ativa não está visível, muda para a primeira aba visível
  React.useEffect(() => {
    if (!abasVisiveis.find(aba => aba.id === abaAtiva)) {
      setAbaAtiva(abasVisiveis[0]?.id || 'categorias');
    }
  }, [podeVerUsuarios, abaAtiva, abasVisiveis]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <CadastrosProvider>
      <div className="h-full flex flex-col p-6 bg-gray-100 dark:bg-[#121212]">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Cadastros Básicos
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie categorias, setores e usuários do sistema
          </p>
        </div>

        {/* Container Principal */}
        <div className="flex-1 bg-white dark:bg-[#1e1e1e] rounded-lg shadow overflow-hidden">
          {/* Sistema de Abas */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              {abasVisiveis.map((aba) => (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 
                    font-medium text-sm
                    border-b-2 transition-all duration-200
                    ${
                      abaAtiva === aba.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                  aria-current={abaAtiva === aba.id ? 'page' : undefined}
                  aria-label={`Aba ${aba.label}`}
                >
                  {aba.icon}
                  <span>{aba.label}</span>
                  {/* Badge para usuários (apenas admin) */}
                  {aba.id === 'usuarios' && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400 rounded-full">
                      Admin
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="flex-1 overflow-hidden">
            {abasVisiveis.map((aba) => (
              <div
                key={aba.id}
                className={`h-full ${abaAtiva === aba.id ? 'block' : 'hidden'}`}
              >
                {aba.component}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info - só para admin */}
        {user?.role === 'Administrador' && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Você tem acesso completo a todos os cadastros básicos do sistema
          </div>
        )}

        {/* Footer Info - para outros */}
        {user?.role !== 'Administrador' && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            {user?.role === 'Gerente' 
              ? 'Você pode gerenciar categorias e setores'
              : 'Você tem acesso de visualização aos cadastros básicos'
            }
          </div>
        )}
      </div>
    </CadastrosProvider>
  );
};

export default CadastrosBasicos;

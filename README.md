# 🏢 ControlHS - Sistema de Controle de Patrimônio

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)]()

> Interface web moderna para gestão e controle de patrimônio organizacional

## 📋 Sobre o Projeto

O **ControlHS** é uma aplicação frontend desenvolvida em React + TypeScript que oferece uma interface completa e intuitiva para controle patrimonial. O sistema permite gerenciar todo o ciclo de vida dos ativos organizacionais, desde o cadastro até as baixas, com controle de transferências, aprovações, anexos e auditoria completa.

### 🎯 Principais Diferenciais

- ✅ Interface moderna e responsiva com dark mode
- ✅ Gestão de estado eficiente com React Context API
- ✅ Autenticação JWT com controle de sessão automático
- ✅ Upload e download de anexos (notas fiscais, fotos)
- ✅ Controle de permissões por perfil (Administrador, Gestor, Colaborador)
- ✅ Exportação de relatórios em PDF e Excel
- ✅ Dashboard com métricas em tempo real

## 🚀 Funcionalidades

### 📦 Gestão de Patrimônios
- Cadastro completo com categorias e setores
- Listagem com filtros avançados
- Visualização detalhada com histórico
- Upload de anexos (notas fiscais, fotos, documentos)

### 🔄 Transferências
- Solicitação de transferência entre setores/responsáveis
- Fluxo de aprovação eletrônica
- Notificações de status
- Efetivação automática após aprovação

### 📉 Baixas Patrimoniais
- Registro de descarte, perda, venda ou doação
- Fluxo de aprovação multinível
- Anexação de documentos comprobatórios

### 👥 Gestão de Usuários
- 3 perfis com permissões diferenciadas:
  - **Administrador**: Acesso total, gestão de usuários, logs de auditoria
  - **Gestor**: Cadastro de bens, aprovação de transferências
  - **Colaborador**: Consulta e solicitação de transferências

### 📊 Relatórios e Dashboard
- Dashboard com métricas em tempo real
- Gráficos interativos (Recharts)
- Exportação em PDF (jsPDF) e Excel (XLSX)
- Filtros por categoria, setor, status

### 🔍 Auditoria
- Logs completos de todas as operações (admin only)
- Rastreabilidade: quem, quando, o quê

## 🛠️ Stack Tecnológico

### Core
- **[React 19](https://react.dev/)** - Biblioteca para construção de interfaces
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Vite 7](https://vitejs.dev/)** - Build tool moderno e ultra-rápido

### Estilização
- **[TailwindCSS 3.4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[PostCSS](https://postcss.org/)** - Transformações CSS
- **Dark Mode** - Suporte nativo com TailwindCSS

### Roteamento & Estado
- **[React Router v6](https://reactrouter.com/)** - Roteamento client-side
- **[React Context API](https://react.dev/learn/passing-data-deeply-with-context)** - Gestão de estado global

### HTTP & API
- **[Axios](https://axios-http.com/)** - Cliente HTTP com interceptors
- **API Backend**: FastAPI (repositório separado)

### Bibliotecas Auxiliares
- **[Recharts](https://recharts.org/)** - Gráficos e visualizações
- **[jsPDF](https://github.com/parallax/jsPDF)** + **jsPDF-AutoTable** - Geração de PDFs
- **[XLSX](https://sheetjs.com/)** - Exportação para Excel
- **[Lucide React](https://lucide.dev/)** - Ícones modernos
- **[File Saver](https://github.com/eligrey/FileSaver.js/)** - Download de arquivos

### Dev Tools
- **[Prettier](https://prettier.io/)** - Formatação de código
- **ESLint** (via Vite plugin) - Linting
- **TypeScript Strict Mode** - Verificação de tipos rigorosa

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **[Node.js](https://nodejs.org/)** 18+
- **[npm](https://www.npmjs.com/)** 9+ ou **[yarn](https://yarnpkg.com/)** 1.22+
- **[Git](https://git-scm.com/)**

## 🚀 Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/controlhs.git
cd controlhs
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (opcional, pois já há proxy configurado):

```env
VITE_API_URL=https://authapicontrolhs.healthsafetytech.com
```

> **Nota**: O Vite já está configurado com proxy para `/api` apontando para o backend em produção. Você pode usar o proxy ou definir a variável de ambiente.

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em: **http://localhost:5173**

### 5. Build para produção

```bash
npm run build
# ou
yarn build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### 6. Preview da build de produção

```bash
npm run preview
# ou
yarn preview
```

## 📁 Estrutura do Projeto

```
controlhs/
├── public/                  # Arquivos estáticos públicos
├── src/
│   ├── assets/             # Imagens, ícones, fontes
│   │   ├── fundo.png
│   │   ├── logo.png
│   │   └── HS2.ico
│   │
│   ├── components/         # Componentes reutilizáveis
│   │   ├── cadastros/     # Modais de cadastro (usuários, setores, categorias)
│   │   ├── Header.tsx     # Cabeçalho com menu de usuário
│   │   ├── Sidebar.tsx    # Menu lateral de navegação
│   │   ├── ProtectedRoute.tsx  # Guard de autenticação
│   │   ├── Patrimonio*.tsx     # Componentes de patrimônios
│   │   ├── Transferencia*.tsx  # Componentes de transferências
│   │   └── Anexo*.tsx         # Componentes de anexos
│   │
│   ├── context/           # Contextos globais (estado)
│   │   ├── AuthContext.tsx         # Autenticação e sessão
│   │   ├── ThemeContext.tsx        # Dark/light mode
│   │   ├── PatrimoniosContext.tsx  # Estado de patrimônios
│   │   ├── TransferenciasContext.tsx # Estado de transferências
│   │   ├── DashboardContext.tsx    # Métricas do dashboard
│   │   └── CadastrosContext.tsx    # Usuários, setores, categorias
│   │
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.ts    # Hook de autenticação
│   │
│   ├── pages/            # Páginas/rotas
│   │   ├── Login.tsx          # Página de login
│   │   ├── Dashboard.tsx      # Dashboard principal
│   │   ├── Patrimonios.tsx    # Listagem de patrimônios
│   │   ├── Transferencias.tsx # Gestão de transferências
│   │   ├── CadastrosBasicos.tsx # Gestão de cadastros
│   │   ├── Logs.tsx          # Logs de auditoria (admin)
│   │   └── NotFound.tsx      # Página 404
│   │
│   ├── services/         # Serviços e API
│   │   └── controlapi.ts # Cliente API com Axios
│   │
│   ├── types/            # Definições TypeScript
│   │   ├── patrimonios.types.ts
│   │   ├── transferencias.types.ts
│   │   ├── anexos.types.ts
│   │   └── cadastros.types.ts
│   │
│   ├── styles/           # Estilos globais
│   │   └── index.css    # Tailwind + CSS customizado
│   │
│   ├── App.tsx          # Componente raiz (layout)
│   ├── main.tsx         # Entry point (providers)
│   └── router.tsx       # Configuração de rotas
│
├── .dockerignore
├── dockerfile           # Build Docker (Nginx)
├── nginx.conf          # Configuração Nginx
├── index.html          # HTML template
├── package.json        # Dependências e scripts
├── tsconfig.json       # Configuração TypeScript
├── vite.config.ts      # Configuração Vite
├── tailwind.config.js  # Configuração Tailwind
├── postcss.config.js   # Configuração PostCSS
└── README.md
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# URL base da API backend
VITE_API_URL=https://authapicontrolhs.healthsafetytech.com

# Outras configurações (se necessário)
VITE_APP_NAME=ControlHS
```

> **Nota**: Todas as variáveis de ambiente devem começar com `VITE_` para serem acessíveis no código.

### Proxy da API (Vite)

O arquivo `vite.config.ts` já está configurado com proxy para `/api`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://authapicontrolhs.healthsafetytech.com',
      changeOrigin: true,
      secure: true,
      rewrite: path => path.replace(/^\/api/, ''),
    }
  }
}
```

Isso permite fazer requisições para `/api/patrimonios` que serão redirecionadas para o backend.

## 🏗️ Arquitetura

### Gestão de Estado (Context API)

A aplicação usa múltiplos contextos organizados por domínio:

```tsx
// main.tsx - Hierarquia de providers
<ThemeProvider>
  <AuthProvider>
    <TransferenciasProvider>
      <PatrimoniosProvider>
        <CadastrosProvider>
          <DashboardProvider>
            <App />
          </DashboardProvider>
        </CadastrosProvider>
      </PatrimoniosProvider>
    </TransferenciasProvider>
  </AuthProvider>
</ThemeProvider>
```

### Autenticação

- **JWT Token**: Armazenado em `localStorage`
- **Interceptors Axios**: Adiciona token automaticamente em todas as requisições
- **Auto-logout**: Redireciona para login em caso de token inválido/expirado (401)
- **Route Guards**: `ProtectedRoute` e `RequireAdmin` protegem rotas

### Roteamento

Rotas principais definidas em `router.tsx`:

| Rota | Componente | Proteção |
|------|-----------|----------|
| `/login` | Login | Pública |
| `/dashboard` | Dashboard | Autenticada |
| `/patrimonios` | Patrimonios | Autenticada |
| `/transferencias` | Transferencias | Autenticada |
| `/cadastros` | CadastrosBasicos | Autenticada |
| `/logs` | Logs | Admin apenas |

### API Client (Axios)

Todas as requisições HTTP estão centralizadas em `src/services/controlapi.ts`:

```typescript
// Exemplo de uso
import { listPatrimonios, createPatrimonio } from '@/services/controlapi';

// Listar patrimônios
const patrimonios = await listPatrimonios();

// Criar novo patrimônio
const novoPatrimonio = await createPatrimonio({
  descricao: "Notebook Dell",
  categoria_id: 1,
  setor_id: 2
});
```

**Recursos disponíveis**:
- Auth: `login`, `register`, `getMe`
- Patrimônios: `listPatrimonios`, `createPatrimonio`, `updatePatrimonio`, `deletePatrimonio`
- Transferências: `listTransferencias`, `createTransferencia`, `aprovarTransferencia`, `rejeitarTransferencia`, `efetivarTransferencia`
- Anexos: `listAnexos`, `uploadAnexo`, `downloadAnexo`, `deleteAnexo`
- Usuários: `listUsuarios`, `updateUser`, `updateUserPassword`
- Setores: `listSetores`, `createSetor`, `updateSetor`, `deleteSetor`
- Categorias: `listCategorias`, `createCategoria`, `updateCategoria`, `deleteCategoria`
- Logs: `listLogs`

## 🐳 Deploy com Docker

### Build da imagem

```bash
docker build -t controlhs-frontend .
```

### Executar container

```bash
docker run -d -p 80:80 controlhs-frontend
```

A aplicação estará disponível em: **http://localhost**

### Docker Compose (exemplo)

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://authapicontrolhs.healthsafetytech.com
```

## 🧪 Testes

> **Nota**: Framework de testes ainda não está configurado.

Para adicionar testes ao projeto, recomendamos:

```bash
# Instalar Vitest + Testing Library
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# Executar testes
npm run test
```

## 🤝 Como Contribuir

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use **TypeScript** para todos os arquivos
- Siga o padrão **ESLint** (configurado no Vite)
- Use **Prettier** para formatação automática
- Componentes devem ser **funcionais** (React Hooks)
- Use **type** ao invés de **interface** quando possível
- Nomes de arquivos em **PascalCase** para componentes, **camelCase** para utilitários

### Commits Semânticos

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Alterações na documentação
- `style:` Formatação, ponto e vírgula, etc
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Manutenção geral

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔗 Links Úteis

- [Documentação React](https://react.dev/)
- [Documentação TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação Vite](https://vitejs.dev/guide/)
- [Documentação TailwindCSS](https://tailwindcss.com/docs)
- [Documentação React Router](https://reactrouter.com/)

## 📞 Suporte

Para reportar bugs ou solicitar novas funcionalidades, abra uma [issue](https://github.com/seu-usuario/controlhs/issues).

---

<div align="center">

**[⬆ Voltar ao topo](#-controlhs---sistema-de-controle-de-patrimônio)**

Desenvolvido com ❤️ e ☕

</div>

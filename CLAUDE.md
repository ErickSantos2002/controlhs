# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ControlHS is a web-based asset management system (Sistema de Controle de Patrimônio) for organizations to manage and track their physical assets throughout their lifecycle. The system handles asset registration, transfers with approval workflows, asset disposal (baixas), and comprehensive audit logging.

**Tech Stack:**
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS 3.4
- **State Management**: React Context API (multiple feature-based contexts)
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Backend API**: FastAPI (separate repository) at `https://authapicontrolhs.healthsafetytech.com`

## Development Commands

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

## Architecture

### Context-Based State Management

The application uses React Context API for global state management, organized by feature domain:

1. **ThemeProvider** (`src/context/ThemeContext.tsx`) - Dark/light theme toggle
2. **AuthProvider** (`src/context/AuthContext.tsx`) - Authentication, user session, JWT token management
3. **TransferenciasProvider** (`src/context/TransferenciasContext.tsx`) - Transfer request state
4. **PatrimoniosProvider** (`src/context/PatrimoniosContext.tsx`) - Asset/patrimônio state
5. **CadastrosProvider** (`src/context/CadastrosContext.tsx`) - Basic registration data (users, sectors, categories)
6. **DashboardProvider** (`src/context/DashboardContext.tsx`) - Dashboard metrics and filters

**Provider Nesting Order** (defined in `src/main.tsx`):
```
ThemeProvider
  → AuthProvider
    → TransferenciasProvider
      → PatrimoniosProvider
        → CadastrosProvider
          → DashboardProvider
```

### Authentication & Authorization

- **Authentication**: JWT-based, token stored in localStorage
- **Interceptors**: Axios interceptors in `src/services/controlapi.ts` automatically:
  - Attach Bearer token to all API requests
  - Handle 401 responses by redirecting to login (except on login page/request)
- **Role-Based Access**: Three user roles with different permissions:
  - **Administrador**: Full system access, user management, approval of baixas
  - **Gestor**: Asset registration, transfer approvals, sector reports
  - **Colaborador**: View assets, request transfers
- **Route Protection**: `ProtectedRoute` component wraps authenticated routes
- **Admin-Only Routes**: `/logs` route uses `RequireAdmin` wrapper for additional role check

### API Service Layer

All API communication is centralized in `src/services/controlapi.ts`:

**Key Features:**
- Base URL configuration via `VITE_API_URL` environment variable
- Automatic token injection via request interceptor
- Automatic logout on 401 responses via response interceptor
- Organized by resource endpoints:
  - Auth: `/login`, `/register`, `/me`
  - Users: `/users/`
  - Categorias: `/categorias/`
  - Setores: `/setores/`
  - Patrimonios: `/patrimonios/`
  - Transferencias: `/transferencias/` (with approve/reject/efetivar actions)
  - Baixas: `/baixas/`
  - Anexos: `/anexos/` (file upload/download)
  - Logs: `/logs/`

**Important API Patterns:**
- Transfer workflow uses specific endpoints:
  - `POST /transferencias/{id}/aprovar` - Approve transfer
  - `POST /transferencias/{id}/rejeitar` - Reject transfer
  - `POST /transferencias/{id}/efetivar` - Execute approved transfer
- File uploads use FormData with `multipart/form-data` content type
- File downloads use `responseType: 'blob'` and create temporary download links

### Component Organization

```
src/
├── components/          # Reusable UI components
│   ├── cadastros/      # Registration/CRUD modals (usuarios, setores, categorias)
│   ├── Header.tsx      # Top navigation bar
│   ├── Sidebar.tsx     # Side navigation menu
│   ├── ProtectedRoute.tsx   # Authentication guard
│   ├── Patrimonio*.tsx      # Asset-related components
│   ├── Transferencia*.tsx   # Transfer-related components
│   └── Anexo*.tsx          # File attachment components
│
├── pages/              # Route-level page components
│   ├── Login.tsx       # Login page (no layout)
│   ├── Dashboard.tsx   # Dashboard with metrics
│   ├── Patrimonios.tsx # Asset listing/management
│   ├── Transferencias.tsx  # Transfer requests management
│   ├── CadastrosBasicos.tsx # User/sector/category management
│   ├── Logs.tsx        # Audit logs (admin only)
│   └── NotFound.tsx    # 404 page
│
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API client (controlapi.ts)
├── types/              # TypeScript type definitions
└── styles/             # Global CSS (Tailwind)
```

### Routing Structure

Defined in `src/router.tsx`:

- `/login` - Public route, no layout
- `/dashboard` - Protected, main dashboard
- `/patrimonios` - Protected, asset management
- `/transferencias` - Protected, transfer management
- `/cadastros` - Protected, basic registrations (users/sectors/categories)
- `/logs` - Protected + Admin only, audit logs
- `/` - Redirects to `/inicio`
- `*` - 404 Not Found

**Layout Logic** (`src/App.tsx`):
- Login page renders without Header/Sidebar
- All other routes render with Header + Sidebar layout
- Dark mode support via Tailwind classes

## Key Workflows

### Transfer Approval Workflow

1. User creates transfer request (`POST /transferencias/`)
2. Approver views pending transfers
3. Approver can:
   - **Approve**: `POST /transferencias/{id}/aprovar` with optional `efetivar_automaticamente: true`
   - **Reject**: `POST /transferencias/{id}/rejeitar` with `motivo_rejeicao`
4. If approved but not auto-efetivated, must call `POST /transferencias/{id}/efetivar` to update asset location

### File Attachments (Anexos)

- Upload: `uploadAnexo(formData)` - FormData must include: file, tipo, patrimonio_id, descricao
- List: `listAnexos(patrimonioId?)` - Filter by patrimônio if needed
- Download: `downloadAnexo(id, nomeOriginal?)` - Automatic browser download
- Delete: `deleteAnexo(id)` - Removes both database record and physical file

## Type Definitions

TypeScript types are organized by domain in `src/types/`:
- `patrimonios.types.ts` - Asset/patrimônio types
- `transferencias.types.ts` - Transfer request types (includes TransferenciaAprovar, TransferenciaRejeitar)
- `anexos.types.ts` - File attachment types
- `cadastros.types.ts` - User/sector/category types

## Vite Configuration

**Important Settings** (`vite.config.ts`):
- Dev server port: 5173
- API proxy: `/api` routes proxy to backend (removes `/api` prefix in rewrite)
- Path alias: `@` maps to `./src`
- Output directory: `dist/`

## Docker Deployment

- **Dockerfile**: Multi-stage build (npm build → nginx serve)
- **nginx.conf**: Serves static files, client-side routing fallback to index.html
- Production build serves from nginx container

## Testing

No test framework is currently configured in package.json. To add tests, consider:
- `vitest` for unit/integration tests (works seamlessly with Vite)
- `@testing-library/react` for component testing
- `playwright` or `cypress` for e2e tests

## Code Style Notes

- Portuguese naming for business domain terms (patrimônio, transferência, baixa, setor)
- UI components use Tailwind utility classes with dark mode variants
- Async/await for all API calls
- Error handling via try/catch with console.error logging
- Type safety enforced with TypeScript strict mode

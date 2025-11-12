# 🏢 ControlHS - Sistema de Controle de Patrimônio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)](https://github.com/seu-usuario/controlhs)

> Sistema web moderno e completo para gestão e controle de patrimônio organizacional

## 📋 Sobre o Projeto

O **ControlHS** é uma solução completa para controle patrimonial que automatiza e centraliza toda a gestão de ativos organizacionais. Desenvolvido com foco em eficiência, segurança e rastreabilidade, o sistema elimina processos manuais e proporciona visibilidade total sobre o ciclo de vida dos bens.

### 🎯 Problema que Resolve

- ❌ Processos manuais lentos e sujeitos a erros
- ❌ Documentação dispersa e difícil localização
- ❌ Falta de rastreabilidade nas movimentações
- ❌ Inventários demorados e imprecisos
- ❌ Dificuldade em gerar relatórios gerenciais
- ❌ Falta de controle de aprovações

### ✅ Solução Oferecida

- ✅ Automação completa do fluxo patrimonial
- ✅ Centralização de dados e documentos
- ✅ Histórico completo e imutável
- ✅ Inventário digital simplificado
- ✅ Relatórios em tempo real
- ✅ Controle de acesso granular
- ✅ Auditoria total de operações

## 🚀 Funcionalidades Principais

### 📦 Gestão de Bens

- Cadastro completo com anexos (notas fiscais, fotos)
- Consulta e visualização detalhada
- Edição com controle de permissões
- Histórico completo de movimentações

### 🔄 Transferências

- Solicitação e aprovação eletrônica
- Notificações automáticas
- Atualização automática de setor/responsável
- Rastreamento completo

### 📉 Baixas

- Registro de descarte, perda, venda ou doação
- Fluxo de aprovação multinível
- Anexação de documentos comprobatórios
- Motivos obrigatórios

### 📊 Relatórios e Dashboards

- Relatórios por categoria, setor, status
- Exportação PDF/Excel
- Filtros avançados
- Visualização em tempo real

### 👥 Gestão de Usuários

- 3 perfis: Administrador, Gestor, Colaborador
- Controle granular de permissões
- Gestão de setores e categorias

### 🔍 Auditoria

- Logs completos de todas as operações
- Rastreabilidade: quem, quando, o quê
- Histórico imutável
- Conformidade com requisitos de auditoria

## 🛠️ Tecnologias Utilizadas

### Backend

- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web moderno e de alta performance
- **[SQLAlchemy](https://www.sqlalchemy.org/)** - ORM para Python
- **[Pydantic](https://pydantic-docs.helpmanual.io/)** - Validação de dados
- **[JWT](https://jwt.io/)** - Autenticação e autorização
- **[Alembic](https://alembic.sqlalchemy.org/)** - Migrations de banco de dados

### Banco de Dados

- **PostgreSQL** - Banco de dados relacional principal
- **SQLite** - Alternativa para desenvolvimento/testes

### Frontend (Previsto)

- **React.js** - Biblioteca JavaScript para UI
- **TypeScript** - Superset tipado do JavaScript
- **Tailwind CSS** - Framework CSS utility-first

### DevOps

- **Docker** - Containerização
- **Docker Compose** - Orquestração local
- **GitHub Actions** - CI/CD

## 📁 Estrutura do Projeto

```

CONTROLHS
├── .vscode/
├── dist/
├── node_modules/
├── src/
│   ├── assets/
│   │   ├── fundo.jpeg
│   │   ├── fundo.png
│   │   ├── HS2.ico
│   │   └── logo.png
│   │
│   ├── components/
│   │   ├── AnexosList.tsx
│   │   ├── AnexosSection.tsx
│   │   ├── AnexoUpload.tsx
│   │   ├── Header.tsx
│   │   ├── ModalObservacoes.tsx
│   │   ├── ModalTrocarSenha.tsx
│   │   ├── PatrimonioDetalhes.tsx
│   │   ├── PatrimonioModal.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SolicitacaoComprasModal.tsx
│   │   ├── TransferenciaAprovacao.tsx
│   │   ├── TransferenciaDetalhes.tsx
│   │   └── TransferenciaModal.tsx
│   │
│   ├── context/
│   │   ├── AnexosContext.tsx
│   │   ├── AuthContext.tsx
│   │   ├── DashboardContext.tsx
│   │   ├── PatrimoniosContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── TransferenciasContext.tsx
│   │
│   ├── hooks/
│   │   └── useAuth.ts
│   │
│   ├── pages/
│   │   ├── Bloqueio.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EmConstrucao.tsx
│   │   ├── Login.tsx
│   │   ├── Logs.tsx
│   │   ├── NotFound.tsx
│   │   ├── Patrimonios.tsx
│   │   └── Transferencias.tsx
│   │
│   ├── services/
│   │   └── controlapi.ts
│   │
│   ├── styles/
│   │   └── index.css
│   │
│   ├── types/
│   │   ├── anexos.types.ts
│   │   ├── patrimonios.types.ts
│   │   └── transferencias.types.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   ├── router.tsx
│   │
│   └── (raiz do src)
│
├── .dockerignore
├── .gitattributes
├── dockerfile
├── index.html
├── nginx.conf
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── vite-env.d.ts
└── vite.config.ts
```

## 📁 Estrutura do backend do Projeto

```
controlhs/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── auth.py
│   │   │   ├── patrimonio.py
│   │   │   ├── transferencia.py
│   │   │   ├── baixa.py
│   │   │   ├── usuario.py
│   │   │   ├── setor.py
│   │   │   └── categoria.py
│   │   └── deps.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── permissions.py
│   ├── models/
│   │   ├── usuario.py
│   │   ├── patrimonio.py
│   │   ├── transferencia.py
│   │   ├── baixa.py
│   │   ├── setor.py
│   │   ├── categoria.py
│   │   ├── inventario.py
│   │   ├── anexo.py
│   │   └── log_auditoria.py
│   ├── schemas/
│   │   ├── usuario.py
│   │   ├── patrimonio.py
│   │   ├── transferencia.py
│   │   └── ...
│   ├── crud/
│   │   ├── base.py
│   │   ├── patrimonio.py
│   │   ├── usuario.py
│   │   └── ...
│   ├── db/
│   │   ├── base.py
│   │   ├── session.py
│   │   └── init_db.py
│   └── main.py
├── alembic/
│   ├── versions/
│   └── env.py
├── tests/
│   ├── api/
│   ├── crud/
│   └── conftest.py
├── docs/
│   ├── casos-de-uso.md
│   ├── modelo-dados.md
│   ├── regras-negocio.md
│   └── documento-mestre.md
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── README.md
└── pyproject.toml
```

## 🚦 Como Executar

### Pré-requisitos

- Python 3.8 ou superior
- PostgreSQL 12 ou superior (ou SQLite para desenvolvimento)
- pip ou poetry

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/seu-usuario/controlhs.git
cd controlhs
```

2. **Crie um ambiente virtual**

```bash
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

3. **Instale as dependências**

```bash
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

5. **Execute as migrations**

```bash
alembic upgrade head
```

6. **Inicie o servidor**

```bash
uvicorn app.main:app --reload
```

O servidor estará disponível em: `http://localhost:8000`

Documentação interativa da API: `http://localhost:8000/docs`

### 🐳 Usando Docker

```bash
# Build e start dos containers
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar containers
docker-compose down
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/controlhs

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
PROJECT_NAME=ControlHS
API_V1_STR=/api/v1
DEBUG=True

# Upload
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
```

## 📚 Documentação

### Documentação da API

Acesse a documentação interativa em:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Documentação do Projeto

- [Documento Mestre](docs/documento-mestre.md) - Visão completa do projeto
- [Casos de Uso](docs/casos-de-uso.md) - Funcionalidades detalhadas
- [Modelo de Dados](docs/modelo-dados.md) - Estrutura do banco de dados
- [Regras de Negócio](docs/regras-negocio.md) - Regras e permissões

## 👥 Perfis de Usuário

| Perfil            | Permissões                                                              |
| ----------------- | ----------------------------------------------------------------------- |
| **Administrador** | Acesso total ao sistema, gerenciamento de usuários, aprovação de baixas |
| **Gestor**        | Cadastro de bens, aprovação de transferências, relatórios do setor      |
| **Colaborador**   | Consulta de bens, solicitação de transferências                         |

## 🧪 Testes

Execute os testes automatizados:

```bash
# Todos os testes
pytest

# Com cobertura
pytest --cov=app tests/

# Testes específicos
pytest tests/api/test_patrimonio.py
```

## 📈 Roadmap

### ✅ Fase 1 - MVP (Atual)

- [x] Autenticação e autorização
- [x] CRUD de bens patrimoniais
- [x] Transferências com aprovação
- [x] Registro de baixas
- [x] Relatórios básicos
- [x] Logs de auditoria

### 🔄 Fase 2 - Em Planejamento

- [ ] Dashboards avançados
- [ ] Inventário digital automatizado
- [ ] Sistema de notificações (email/SMS)
- [ ] Gestão de manutenções
- [ ] Exportação avançada de relatórios

### 🔮 Fase 3 - Futuro

- [ ] Integração com ERP
- [ ] Aplicativo mobile
- [ ] API pública
- [ ] Portal de auditoria externa
- [ ] IA para predição de manutenções

## 🤝 Como Contribuir

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Siga a PEP 8 para código Python
- Use type hints em todas as funções
- Documente funções e classes
- Escreva testes para novas funcionalidades
- Mantenha a cobertura de testes acima de 70%

## 🐛 Reportar Bugs

Encontrou um bug? Abra uma [issue](https://github.com/seu-usuario/controlhs/issues) com:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Ambiente (OS, Python version, etc)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**

- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [seu-perfil](https://linkedin.com/in/seu-perfil)
- Email: seu.email@exemplo.com

## 🙏 Agradecimentos

- [FastAPI](https://fastapi.tiangolo.com/) - Framework incrível
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM robusto
- Comunidade open source

---

<div align="center">
  
**[⬆ Voltar ao topo](#-controlhs---sistema-de-controle-de-patrimônio)**

Feito com ❤️ e ☕

</div>

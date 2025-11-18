# 📋 Tarefas para o Backend - ControlHS API

Este documento lista as melhorias necessárias no backend (FastAPI) para produção.

---

## 🔴 **CRÍTICO - Fazer ANTES de Produção**

### 1. ✅ Adicionar Campo `usuario` (nome) no Endpoint de Logs

**Problema:** O endpoint `/logs/` está retornando apenas `usuario_id` mas não o campo `usuario` (nome do usuário).

**Solução:**
```python
# No modelo de resposta de Log
class LogResponse(BaseModel):
    id: int
    acao: str
    entidade: str
    entidade_id: int
    usuario_id: int
    usuario: str  # ✅ ADICIONAR ESTE CAMPO
    criado_em: datetime
    detalhes: dict

# No endpoint GET /logs/
@router.get("/logs/", response_model=List[LogResponse])
async def list_logs(db: Session = Depends(get_db)):
    logs = db.query(Log).join(User).all()

    return [
        LogResponse(
            id=log.id,
            acao=log.acao,
            entidade=log.entidade,
            entidade_id=log.entidade_id,
            usuario_id=log.usuario_id,
            usuario=log.user.username,  # ✅ Fazer JOIN com User
            criado_em=log.criado_em,
            detalhes=log.detalhes
        )
        for log in logs
    ]
```

**Alternativa (usar relationship):**
```python
# No modelo Log (SQLAlchemy)
class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey("users.id"))

    # ✅ Adicionar relationship
    user = relationship("User", backref="logs")

# No schema Pydantic
class LogResponse(BaseModel):
    usuario: str

    class Config:
        from_attributes = True  # Permite acessar log.user.username

# No endpoint
@router.get("/logs/")
async def list_logs(db: Session = Depends(get_db)):
    logs = db.query(Log).options(joinedload(Log.user)).all()

    # Se tiver property no modelo:
    # @property
    # def usuario(self):
    #     return self.user.username if self.user else "Desconhecido"

    return logs
```

---

### 2. ✅ Validação de Token JWT com Expiração

**Problema:** Frontend não valida se token expirou antes de fazer requisições.

**Solução no Backend:**
```python
# utils/auth.py ou auth.py
from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET_KEY = os.getenv("SECRET_KEY")  # ✅ Usar variável de ambiente
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # ✅ Definir tempo de expiração

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")

        # ✅ JWT automaticamente verifica expiração (exp)
        if user_id is None:
            raise JWTError("Token inválido")

        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

---

### 3. ✅ Variáveis de Ambiente Seguras

**Problema:** Credenciais hardcoded no código.

**Solução:**
```bash
# .env (NÃO COMMITAR)
DATABASE_URL=postgresql://user:password@localhost:5432/controlhs
SECRET_KEY=sua-chave-secreta-super-segura-aqui-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Email (se usar)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-ou-app-password

# CORS
CORS_ORIGINS=https://controlhs.com,https://app.controlhs.com

# Ambiente
ENVIRONMENT=production
```

```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = ["*"]
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()

# Usar em main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # ✅ Usar variável
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**⚠️ IMPORTANTE:**
```bash
# .gitignore (VERIFICAR SE TEM)
.env
.env.production
.env.local
__pycache__/
*.pyc
*.db
venv/
.venv/
```

---

### 4. ✅ Rate Limiting para Prevenir Abuso

**Problema:** API sem proteção contra abuso/DDoS.

**Solução:**
```bash
pip install slowapi
```

```python
# main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Nos endpoints
@router.post("/login")
@limiter.limit("5/minute")  # ✅ Max 5 tentativas por minuto
async def login(request: Request, ...):
    ...

@router.get("/logs/")
@limiter.limit("100/minute")  # ✅ Max 100 requisições por minuto
async def list_logs(request: Request, ...):
    ...
```

---

## 🟡 **IMPORTANTE - Fazer Logo Após Produção**

### 5. ✅ Paginação Server-Side para Logs

**Problema:** Frontend busca todos os logs de uma vez (ineficiente para muitos registros).

**Solução:**
```python
# schemas.py
class LogListResponse(BaseModel):
    total: int
    pagina: int
    limite: int
    logs: List[LogResponse]

# endpoints.py
@router.get("/logs/", response_model=LogListResponse)
async def list_logs(
    skip: int = 0,
    limit: int = 50,
    entidade: Optional[str] = None,
    acao: Optional[str] = None,
    usuario: Optional[str] = None,
    dataInicio: Optional[str] = None,
    dataFim: Optional[str] = None,
    busca: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Log).join(User)

    # Filtros
    if entidade:
        query = query.filter(Log.entidade == entidade)
    if acao:
        query = query.filter(Log.acao == acao)
    if usuario:
        query = query.filter(User.username.ilike(f"%{usuario}%"))
    if dataInicio:
        query = query.filter(Log.criado_em >= dataInicio)
    if dataFim:
        query = query.filter(Log.criado_em <= dataFim)
    if busca:
        query = query.filter(
            or_(
                Log.acao.ilike(f"%{busca}%"),
                Log.entidade.ilike(f"%{busca}%"),
                User.username.ilike(f"%{busca}%")
            )
        )

    total = query.count()
    logs = query.offset(skip).limit(limit).all()

    return LogListResponse(
        total=total,
        pagina=(skip // limit) + 1,
        limite=limit,
        logs=logs
    )
```

---

### 6. ✅ Logging e Monitoramento

**Problema:** Sem logs estruturados para debug de produção.

**Solução:**
```bash
pip install python-json-logger
```

```python
# logging_config.py
import logging
from pythonjsonlogger import jsonlogger

def setup_logging():
    logger = logging.getLogger()

    if settings.environment == "production":
        handler = logging.StreamHandler()
        formatter = jsonlogger.JsonFormatter(
            '%(asctime)s %(levelname)s %(name)s %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    else:
        logging.basicConfig(level=logging.DEBUG)

# main.py
from logging_config import setup_logging

setup_logging()
logger = logging.getLogger(__name__)

# Usar nos endpoints
@router.post("/login")
async def login(credentials: LoginRequest):
    logger.info(f"Tentativa de login: {credentials.username}")

    try:
        # ... lógica de login
        logger.info(f"Login bem-sucedido: {credentials.username}")
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}", exc_info=True)
        raise
```

---

### 7. ✅ Backup Automático do Banco de Dados

**Problema:** Sem backup regular dos dados.

**Solução (PostgreSQL):**
```bash
# backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/controlhs"
DB_NAME="controlhs"

mkdir -p $BACKUP_DIR

# Backup completo
pg_dump $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete

echo "Backup criado: backup_$DATE.sql"
```

```bash
# Adicionar ao crontab (diário às 2am)
0 2 * * * /path/to/backup.sh >> /var/log/controlhs_backup.log 2>&1
```

---

### 8. ✅ HTTPS e Certificado SSL

**Problema:** API rodando em HTTP (inseguro).

**Solução (Nginx + Let's Encrypt):**
```nginx
# /etc/nginx/sites-available/controlhs-api
server {
    listen 80;
    server_name authapicontrolhs.healthsafetytech.com;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name authapicontrolhs.healthsafetytech.com;

    # Certificado SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/authapicontrolhs.healthsafetytech.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/authapicontrolhs.healthsafetytech.com/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d authapicontrolhs.healthsafetytech.com

# Auto-renovação (já vem configurado)
sudo certbot renew --dry-run
```

---

## 🟢 **OPCIONAL - Melhorias Futuras**

### 9. ⚠️ Validação de Entrada com Pydantic

```python
from pydantic import BaseModel, validator, Field

class LogCreate(BaseModel):
    acao: str = Field(..., min_length=1, max_length=100)
    entidade: str = Field(..., min_length=1, max_length=50)
    entidade_id: int = Field(..., gt=0)
    detalhes: dict = Field(default_factory=dict)

    @validator('acao')
    def validate_acao(cls, v):
        acoes_validas = ['Criação', 'Atualização', 'Exclusão', 'Aprovação', 'Rejeição']
        if v not in acoes_validas:
            raise ValueError(f'Ação inválida: {v}')
        return v
```

---

### 10. ⚠️ Testes Automatizados

```bash
pip install pytest pytest-asyncio httpx
```

```python
# tests/test_logs.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_list_logs_unauthorized():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/logs/")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_list_logs_authorized(auth_token):
    async with AsyncClient(app=app, base_url="http://test") as client:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = await client.get("/logs/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
        assert "total" in data
```

---

### 11. ⚠️ Cache com Redis

```bash
pip install redis aioredis
```

```python
# cache.py
import aioredis
import json

redis = aioredis.from_url("redis://localhost")

async def get_cached_logs(key: str):
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)
    return None

async def set_cached_logs(key: str, data: dict, expire: int = 300):
    await redis.setex(key, expire, json.dumps(data))

# No endpoint
@router.get("/logs/")
async def list_logs(...):
    cache_key = f"logs:{skip}:{limit}:{entidade}"

    # Tentar cache
    cached = await get_cached_logs(cache_key)
    if cached:
        return cached

    # Buscar do DB
    logs = query_logs(...)

    # Salvar no cache (5 min)
    await set_cached_logs(cache_key, logs, expire=300)

    return logs
```

---

## 📝 **Checklist de Deploy Backend**

```bash
[ ] Adicionar campo 'usuario' no endpoint /logs/
[ ] Configurar variáveis de ambiente (.env)
[ ] Adicionar .gitignore (.env, __pycache__, venv)
[ ] Implementar validação de token JWT com expiração
[ ] Configurar rate limiting (slowapi)
[ ] Implementar paginação server-side em /logs/
[ ] Configurar logging estruturado (JSON em produção)
[ ] Configurar backup automático do banco
[ ] Configurar HTTPS com Let's Encrypt
[ ] Testar todos os endpoints com Postman/Insomnia
[ ] Documentar API com Swagger (FastAPI já tem)
[ ] Fazer backup antes do deploy
[ ] Configurar processo de monitoramento (Sentry/DataDog)
```

---

## 🚀 **Comandos Úteis**

```bash
# Gerar SECRET_KEY segura
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Testar conexão com DB
python -c "from database import engine; engine.connect()"

# Rodar migrations (Alembic)
alembic upgrade head

# Criar backup manual
pg_dump controlhs > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql controlhs < backup_20250118.sql

# Ver logs da aplicação
tail -f /var/log/controlhs.log

# Reiniciar serviço (systemd)
sudo systemctl restart controlhs-api
```

---

## 📞 **Recursos Úteis**

- FastAPI Docs: https://fastapi.tiangolo.com/
- Pydantic Validation: https://docs.pydantic.dev/
- JWT Best Practices: https://datatracker.ietf.org/doc/html/rfc8725
- PostgreSQL Backup: https://www.postgresql.org/docs/current/backup.html
- Let's Encrypt: https://letsencrypt.org/getting-started/

---

**Dúvidas?** Qualquer problema durante a implementação, me avise!

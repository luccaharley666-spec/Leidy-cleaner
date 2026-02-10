# 📦 Lista Exata para Exportar

**Faça um destes, nesta ordem:**

---

## 🟢 OPÇÃO 1: Copiar Tudo (Recomendado)

```bash
# Criar pasta
mkdir -p ~/leidy-exportado

# Copiar tudo
cp -r /workspaces/acaba ~/leidy-exportado/

# Confirmar
ls -la ~/leidy-exportado/acaba/
```

**Resultado:** Pasta `/acaba` com TUDO pronto em `~/leidy-exportado/`

---

## 🟡 OPÇÃO 2: Copiar Apenas o Essencial

```bash
mkdir -p ~/leidy-essencial

# Banco
cp /workspaces/acaba/backend/backend_data/database.sqlite ~/leidy-essencial/

# Código backend
cp -r /workspaces/acaba/backend/src ~/leidy-essencial/backend-src

# Código frontend
cp -r /workspaces/acaba/frontend/src ~/leidy-essencial/frontend-src

# Documentação
cp /workspaces/acaba/*.md ~/leidy-essencial/

# Package.json (para referencias de dependencias)
cp /workspaces/acaba/backend/package.json ~/leidy-essencial/backend-package.json
cp /workspaces/acaba/frontend/package.json ~/leidy-essencial/frontend-package.json
```

**Resultado:** Apenas o que importa (~50MB em vez de 300MB)

---

## 🔵 OPÇÃO 3: Fazer ZIP

```bash
# Method 1: ZIP de tudo
cd /workspaces
zip -r [REDACTED_TOKEN].zip acaba/

# Method 2: ZIP apenas essencial
cd /workspaces/acaba
zip -r -e leidy-essencial.zip \
  backend/backend_data/database.sqlite \
  backend/src \
  backend/package.json \
  backend/setup-db.sql \
  backend/.env \
  frontend/src \
  frontend/package.json \
  frontend/.next \
  *.md

# Ver tamanho
ls -lh leidy*.zip
```

---

## 🟣 OPÇÃO 4: Apenas o Banco (Se só quer dados)

```bash
cp /workspaces/acaba/backend/backend_data/database.sqlite ~/meu-banco.sqlite

# Ou converter para SQL
sqlite3 /workspaces/acaba/backend/backend_data/database.sqlite ".dump" > ~/meu-banco.sql

# Ver o que tem
sqlite3 ~/meu-banco.sqlite "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## 📋 Arquivos Críticos

Se tiver que escolher SÓ entre tudo: **ESTES**

```
✅ database.sqlite              (Banco com dados)
✅ backend/src                  (Lógica backend)
✅ backend/setup-db.sql         (Schema)
✅ backend/seed-data.sql        (Dados)
✅ backend/.env                 (Config)
✅ frontend/src                 (Código React)
✅ frontend/.next               (Build otimizado)
✅ [REDACTED_TOKEN].md    (Documentação)
✅ GUIA_IMPORTACAO_*.md         (Como importar)
```

---

## 🗂️ Estrutura de Pastas Esperada Após Copiar

```
leidy-exportado/
└── acaba/
    ├── backend/
    │   ├── backend_data/
    │   │   └── database.sqlite ⭐ IMPORTANTE
    │   ├── src/
    │   │   ├── controllers/
    │   │   ├── routes/
    │   │   ├── services/
    │   │   └── middleware/
    │   ├── setup-db.sql
    │   ├── seed-data.sql
    │   ├── .env
    │   ├── package.json
    │   └── package-lock.json
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── pages/
    │   │   ├── components/
    │   │   └── styles/
    │   ├── .next/
    │   ├── package.json
    │   └── next.config.js
    │
    ├── [REDACTED_TOKEN].md ⭐
    ├── [REDACTED_TOKEN].md ⭐
    ├── [REDACTED_TOKEN].md ⭐
    ├── ACOES_IMEDIATAS.md ⭐
    ├── [REDACTED_TOKEN].md
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── docker-compose.yml
```

---

## ✅ Verificar o que Copiou

```bash
# Usar find para confirmar
find ~/leidy-exportado -type f -name "database.sqlite"
find ~/leidy-exportado -type d -name "src" | head -5
find ~/leidy-exportado -type f -name "*.md" | wc -l

# Ou listing simples
ls -lh ~/leidy-exportado/acaba/backend/backend_data/database.sqlite
du -sh ~/leidy-exportado/acaba/
```

---

## 📥 Para Seu Computador (Se remoto)

```bash
# DO SEU PC LOCAL:

# 1. Se copiar para home (~):
scp -r seu_usuario@servidor:~/leidy-exportado ./leidy-cleaner

# 2. Se fez ZIP:
scp seu_usuario@servidor:/workspaces/[REDACTED_TOKEN].zip ./
unzip [REDACTED_TOKEN].zip

# 3. Se apenas essencial:
scp -r seu_usuario@servidor:/workspaces/acaba/backend/backend_data/ ./dados
scp -r seu_usuario@servidor:/workspaces/acaba/backend/src ./codigo-backend
scp -r seu_usuario@servidor:/workspaces/acaba/frontend/src ./codigo-frontend
```

---

## 🎯 Resumo

| Cenário | Comando |
|---------|---------|
| Quer tudo? | `cp -r /workspaces/acaba ~/leidy` |
| Quer só código? | `cp -r /workspaces/acaba/{backend,frontend}/src ~/leidy-code` |
| Quer só dados? | `cp /workspaces/acaba/backend/backend_data/database.sqlite ~/` |
| Quer tudo em ZIP? | `zip -r leidy.zip /workspaces/acaba` |
| Quer para seu PC? | `scp -r user@server:/workspaces/acaba ./leidy-cleaner` |

---

## ⏱️ Tempo Estimado

- **Opção 1** (tudo): 1-2 min
- **Opção 2** (essencial): 30 seg
- **Opção 3** (ZIP): 2-3 min
- **Opção 4** (só banco): 10 seg

---

## 🚀 Depois de Copiar

```bash
cd ~/leidy-exportado/acaba

# 1. Instalar dependências (se quiser rodar lá)
cd backend && npm install
cd ../frontend && npm install

# 2. Testar banco
sqlite3 backend/backend_data/database.sqlite ".tables"

# 3. Ler documentação
cat [REDACTED_TOKEN].md
cat [REDACTED_TOKEN].md
```

---

**Tudo pronto! Escolha uma opção acima e execute 👆**

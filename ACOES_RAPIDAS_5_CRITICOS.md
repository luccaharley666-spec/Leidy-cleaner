# ⚡ AÇÕES RÁPIDAS - FIX DOS PROBLEMAS CRÍTICOS

**Data:** 14 de Fevereiro de 2026  
**Objetivo:** Corrigir os 5 problemas críticos em 30 minutos  
**Status:** Pronto para executar  

---

## 🚀 AÇÃO 1: Verificar .gitignore (2 min)

```bash
# No seu computador, verificar se .env está protegido
cd seu-repo
cat .gitignore

# Procurar por:
# *.env
# .env.production
# .env.local

# Resultado esperado:
# ✅ Se vir *.env ou .env.production = OK
# ❌ Se NÃO vir = ADICIONAR AGORA
```

**Se não tiver:**

```bash
# Adicionar ao .gitignore
echo ".env.production" >> .gitignore
echo ".env.*.local" >> .gitignore

# Verificar
git check-ignore .env.production
# Esperado: .env.production (sem mensagem = está ignorado)

# FIX se já foi committed
git rm --cached .env.production
git commit -m "Remove .env.production from git history"
git push
```

---

## 🚀 AÇÃO 2: Gerar Nova Senha Admin (3 min)

```bash
# Gerar senha aleatória
perl -e 'print map{("a".."z","A".."Z",0..9)[rand 62]}0..15'

# Copie a saída, ex: aB3cD9eF2gH5jK8l

# Hash com bcrypt
node -e "
const bcrypt = require('bcryptjs');
const senha = 'aB3cD9eF2gH5jK8l';
bcrypt.hash(senha, 10, (err, hash) => {
  if (err) console.error(err);
  console.log('Hash:', hash);
  console.log('Senha plain:', senha);
});
"

# Salve ambas informações:
# Senha: aB3cD9eF2gH5jK8l
# Hash: $2a$10$...
```

**Atualizar no banco:**

```bash
# No servidor Orion Host, conectar ao banco
ssh seu_usuario@seu-dominio.com.br

sqlite3 backend_data/database.sqlite

-- Atualizar admin
UPDATE users 
SET password = '$2a$10$...' 
WHERE email = 'admin@seu-dominio.com.br';

-- Verificar
SELECT id, email, password FROM users WHERE email LIKE '%admin%';

-- Sair
.quit
```

**Guardar a senha segura:**
- Salve em gerenciador de senhas (1Password, Bitwarden)
- Forçar troca no primeiro login (adicionar flags no banco)

---

## 🚀 AÇÃO 3: Rate Limiting em Login (5 min)

**Arquivo:** `backend/src/routes/authRoutes.js`

Adicionar antes do roteador de login:

```javascript
// Rate limiting para login
const rateLimit = {};

function checkLoginRateLimit(email) {
  const now = Date.now();
  if (!rateLimit[email]) {
    rateLimit[email] = { attempts: 0, resetTime: now + 900000 }; // 15 min
  }

  const entry = rateLimit[email];
  
  // Se passou do tempo de reset, limpar
  if (now > entry.resetTime) {
    entry.attempts = 0;
    entry.resetTime = now + 900000;
  }

  entry.attempts++;

  // Bloquear após 5 tentativas
  if (entry.attempts > 5) {
    return false; // Bloqueado
  }

  return true; // Permitido
}

// Usar no endpoint
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Verificar rate limit
  if (!checkLoginRateLimit(email)) {
    return res.status(429).json({
      error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    });
  }

  // Validar credenciais
  // ... resto do código
});
```

**Melhor ainda - usar biblioteca:**

```bash
npm install express-rate-limit

# Em authRoutes.js
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.body?.email || req.ip,
});

router.post('/auth/login', loginLimiter, (req, res) => {
  // Handler aqui
});
```

---

## 🚀 AÇÃO 4: Configurar UFW Firewall (5 min)

**No servidor Orion Host:**

```bash
# Conectar via SSH
ssh seu_usuario@seu-dominio.com.br

# Verificar se UFW já está ativo
sudo ufw status

# Se "inactive", ativar
sudo ufw enable
# Responder 'y' (yes)

# Configurar regras padrão
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH (IMPORTANTE - não fechar sua conexão!)
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Negar as portas internas (frontend + backend)
sudo ufw deny 3000/tcp
sudo ufw deny 3001/tcp

# Verificar status final
sudo ufw status verbose

# Esperado:
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
# 3000/tcp                   DENY        Anywhere
# 3001/tcp                   DENY        Anywhere
```

**Testar:**

```bash
# De fora, tentar acessar porta 3000 (deve falhar)
telnet seu-dominio.com.br 3000
# Connection refused = OK ✅

# Verificar se HTTPS funciona ainda
curl -I https://seu-dominio.com.br
# HTTP/2 200 = OK ✅
```

---

## 🚀 AÇÃO 5: Criar Script Backup (8 min)

**No servidor, criar arquivo:** `~/backup.sh`

```bash
#!/bin/bash

# Configuração
BACKUP_DIR="/home/seu_usuario/backups"
DB_FILE="/home/seu_usuario/projetos/meu-site/backend_data/database.sqlite"
KEEP_DAYS=7

# Criar diretório se não existir
mkdir -p "$BACKUP_DIR"

# Fazer backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/database-$TIMESTAMP.sqlite"

cp "$DB_FILE" "$BACKUP_FILE"

# Comprimir para poupar espaço
gzip "$BACKUP_FILE"

# Remover backups antigos
find "$BACKUP_DIR" -name "database-*.sqlite.gz" -mtime +$KEEP_DAYS -delete

# Log
echo "[$(date)] Backup realizado: $BACKUP_FILE.gz" >> "$BACKUP_DIR/backup.log"

# Opcional: Upload para S3
# aws s3 cp "$BACKUP_FILE.gz" s3://seu-bucket-backup/database/

echo "Backup concluído: $BACKUP_FILE.gz"
```

**Tornar executável:**

```bash
chmod +x ~/backup.sh

# Testar
~/backup.sh

# Verificar arquivo criado
ls -lh ~/backups/

# Aguardar ~30 segundos e verificar se backup foi feito
```

**Agendar com Cron (automático todo dia 2AM):**

```bash
# Editar crontab
crontab -e

# Adicionar linha:
0 2 * * * /home/seu_usuario/backup.sh >> /home/seu_usuario/backup.log 2>&1

# Salvar e sair
# Ctrl+O → Enter → Ctrl+X

# Verificar se foi adicionado
crontab -l
```

**Testar configuração do cron:**

```bash
# Ver próxima execução
at now + 1 minute /home/seu_usuario/backup.sh

# Ou forçar execução manual em 1 min
sleep 60 && ~/backup.sh &
```

---

## ✅ CHECKLIST - AÇÕES CONCLUÍDAS

Após executar tudo, marque como pronto:

- [ ] .env.production em .gitignore
- [ ] Nova senha admin gerada
- [ ] Rate limiting em login implementado
- [ ] UFW firewall configurado
- [ ] Script de backup criado + cronado

---

## 🧪 VALIDAR TUDO

```bash
# 1. SSH acessa ainda? (firewall não bloqueou)
ssh seu_usuario@seu-dominio.com.br
echo "✅ SSH OK"
exit

# 2. HTTPS funciona?
curl -I https://seu-dominio.com.br
echo "✅ HTTPS OK"

# 3. API funciona?
curl https://api.seu-dominio.com.br/api/health | jq .
echo "✅ API OK"

# 4. Backups estão sendo criados?
ls -lh ~/backups/
echo "✅ Backups OK"

# 5. Cron está escalonado?
crontab -l | grep backup
echo "✅ Cron OK"

# Se tudo OK
echo "🎉 TODOS OS CRÍTICOS FORAM CORRIGIDOS!"
```

---

## ❓ TROUBLESHOOTING

### Problema: "Permission denied" ao rodar backup.sh

```bash
# Solução
chmod +x ~/backup.sh

# Verificar
ls -l ~/backup.sh
# Esperado: -rwxr-xr-x (x = executável)
```

### Problema: UFW bloqueou SSH

```bash
# Não consegue conectar?
# Na console do Orion Host (web access)
sudo ufw allow 22/tcp
sudo ufw reload
```

### Problema: Backup não roda automaticamente

```bash
# Verificar se cron está rodando
sudo service cron status

# Verificar logs do cron
grep CRON /var/log/syslog | tail -20

# Se não tiver /var/log/syslog, checar:
sudo journalctl -u cron --all
```

---

## 📊 TEMPO TOTAL

| Ação | Tempo |
|------|-------|
| 1. Verificar .gitignore | 2 min |
| 2. Nova senha admin | 3 min |
| 3. Rate limiting | 5 min |
| 4. UFW firewall | 5 min |
| 5. Backup script | 8 min |
| Validações | 5 min |
| **TOTAL** | **28 min** |

✅ **Todos os 5 problemas críticos corrigidos em ~30 minutos!**

---

## 🎯 PRÓXIMAS AÇÕES (Esta semana)

Após fixar os críticos, continue com:

1. Implementar schema validation (Zod)
2. Adicionar testes (npm test)
3. Setup Swagger UI
4. CI/CD GitHub Actions
5. Health check robusto

Veja: `AUDITORIA_PROBLEMAS_MELHORIAS.md`

---

**Status:** ✅ Ações prontas para executar  
**Última atualização:** 14 de Fevereiro de 2026  
**Versão:** 1.0  

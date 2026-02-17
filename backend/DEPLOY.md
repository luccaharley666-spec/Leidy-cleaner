# Deploy integrado (Backend + Next.js)

Este guia descreve como construir e executar a aplicação integrada (Next.js servido pelo Express backend) localmente e via Docker.

## Requisitos
- Node.js 20+
- npm
- Docker (opcional)

## Rodar local (produção)

No diretório `backend` execute:

```bash
# instala dependências do frontend, faz build e inicia servidor integrado
npm run start:prod
```

A aplicação ficará disponível em `http://localhost:3001`.

## Docker (construir e rodar)

No root do repositório (onde estão as pastas `frontend` e `backend`):

```bash
# constrói a imagem docker
docker build -t leidy-integrated -f backend/Dockerfile .

# roda o container (mapeando porta 3001)
docker run -p 3001:3001 --env PORT=3001 --env NODE_ENV=production leidy-integrated
```

## Observações
- Variáveis sensíveis (DB, sentry, stripe, etc) devem ser passadas no `docker run` com `-e` ou via um secret manager.
- Em ambientes de produção recomendamos usar um process manager (systemd) ou orquestrador (Kubernetes).

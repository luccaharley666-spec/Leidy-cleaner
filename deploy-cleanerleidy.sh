#!/bin/bash

# 🚀 SCRIPT DEPLOY RÁPIDO CLEANERLEIDY.COM.BR
# Copie e cole cada seção no seu servidor

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOY CLEANERLEIDY.COM.BR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ##############################################
# PASSO 1: INSTALAR CERTBOT E GERAR SSL
# ##############################################

echo ""
echo "📄 PASSO 1: Instalar Certbot"
echo "Execute PRIMEIRO (uma única vez):"
echo ""
echo "sudo apt update && sudo apt install certbot python3-certbot-nginx"
echo ""
echo "Depois:"
echo ""
echo "sudo certbot certonly --nginx \\
  -d cleanerleidy.com.br \\
  -d www.cleanerleidy.com.br \\
  -d api.cleanerleidy.com.br \\
  -m admin@cleanerleidy.com.br"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "Pressione ENTER quando terminar..."

# ##############################################
# PASSO 2: COPIAR ARQUIVO NGINX
# ##############################################

echo ""
echo "⚙️  PASSO 2: Copiar Nginx"
echo ""

if [ -f "nginx-cleanerleidy.com.br.conf" ]; then
    echo "✅ Arquivo nginx encontrado"
    echo ""
    echo "Executando:"
    echo "  sudo cp nginx-cleanerleidy.com.br.conf /etc/nginx/sites-available/cleanerleidy.com.br"
    echo "  sudo ln -s /etc/nginx/sites-available/cleanerleidy.com.br /etc/nginx/sites-enabled/"
    echo "  sudo nginx -t"
    echo "  sudo systemctl reload nginx"
    echo ""
    
    read -p "Continuar? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        sudo cp nginx-cleanerleidy.com.br.conf /etc/nginx/sites-available/cleanerleidy.com.br
        sudo ln -s /etc/nginx/sites-available/cleanerleidy.com.br /etc/nginx/sites-enabled/
        sudo nginx -t
        if [ $? -eq 0 ]; then
            sudo systemctl reload nginx
            echo "✅ Nginx configurado com sucesso!"
        else
            echo "❌ Erro na configuração Nginx"
            exit 1
        fi
    fi
else
    echo "❌ Arquivo nginx-cleanerleidy.com.br.conf não encontrado!"
    echo "Verifique se está no diretório correto"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ##############################################
# PASSO 3: INSTALAR DOCKER
# ##############################################

echo ""
echo "🐳 PASSO 3: Instalar Docker (se não tiver)"
echo ""

if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Instalando..."
    sudo apt update
    sudo apt install docker.io docker-compose -y
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado!"
else
    echo "✅ Docker já instalado"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ##############################################
# PASSO 4: FAZER DEPLOY
# ##############################################

echo ""
echo "🚀 PASSO 4: Fazer Deploy"
echo ""

if [ -f "docker-compose.prod.yml" ]; then
    echo "✅ docker-compose.prod.yml encontrado"
    echo ""
    
    read -p "Deseja fazer deploy agora? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo ""
        echo "Iniciando containers..."
        docker-compose -f docker-compose.prod.yml up -d
        
        echo ""
        echo "Aguardando containers ficarem prontos..."
        sleep 10
        
        echo ""
        echo "✅ Containers rodando:"
        docker-compose -f docker-compose.prod.yml ps
    fi
else
    echo "❌ docker-compose.prod.yml não encontrado!"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ##############################################
# PASSO 5: TESTES
# ##############################################

echo ""
echo "✅ PASSO 5: Testes"
echo ""

echo "Aguarde 30 segundos para os serviços ficarem prontos..."
sleep 30

echo ""
echo "Testando Frontend:"
curl -s https://cleanerleidy.com.br -I | head -1

echo ""
echo "Testando Backend:"
curl -s https://api.cleanerleidy.com.br/api/health

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ##############################################
# RESUMO FINAL
# ##############################################

echo ""
echo "✨ DEPLOY COMPLETO!"
echo ""
echo "URLs:"
echo "  🌐 Frontend:  https://cleanerleidy.com.br"
echo "  🔌 Backend:   https://api.cleanerleidy.com.br/api/health"
echo ""
echo "Logs:"
echo "  Backend:  docker logs -f cleaner-backend"
echo "  Frontend: docker logs -f cleaner-frontend"
echo "  Nginx:    sudo tail -f /var/log/nginx/access.log"
echo ""
echo "Status:"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "Parar:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Pronto! Seu site está ONLINE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

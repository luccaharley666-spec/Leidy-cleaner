#!/bin/bash
# 🔐 SSL/HTTPS Setup with Let's Encrypt

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🔐 SETUP SSL/HTTPS COM LET'S ENCRYPT               ║"
echo "╚════════════════════════════════════════════════════════════╝"

# 1. Instalar Certbot
echo "📦 Instalando Certbot..."
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Pedir domínio do usuário
read -p "Digite seu domínio (ex: seu-dominio.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Domínio é obrigatório!"
    exit 1
fi

# 3. Gerar certificado SSL
echo "🔑 Gerando certificado SSL para $DOMAIN..."
sudo certbot certonly \
    --email seu-email@example.com \
    --agree-tos \
    --no-eff-email \
    --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN

# 4. Criar diretório de certs
echo "📁 Criando diretório de certificados..."
mkdir -p ./certs
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./certs/cert.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./certs/key.pem
chmod 644 ./certs/cert.pem
chmod 600 ./certs/key.pem

# 5. Criar script de renovação automática
echo "🔄 Criando script de renovação automática..."
cat > ./certs/renew-ssl.sh << 'EOF'
#!/bin/bash
# Renew SSL certificates monthly
certbot renew --quiet
cp /etc/letsencrypt/live/*/fullchain.pem /workspaces/Leidy-cleaner/certs/cert.pem
cp /etc/letsencrypt/live/*/privkey.pem /workspaces/Leidy-cleaner/certs/key.pem
docker restart leidy-nginx
EOF

chmod +x ./certs/renew-ssl.sh

# 6. Adicionar cron job para renovação automática
echo "⏰ Adicionando cron job para renovação automática..."
CRON_CMD="0 3 * * * /workspaces/Leidy-cleaner/certs/renew-ssl.sh"
(crontab -l 2>/dev/null | grep -v "renew-ssl.sh"; echo "$CRON_CMD") | crontab -

echo ""
echo "✅ SSL/HTTPS CONFIGURADO COM SUCESSO!"
echo ""
echo "📌 Próximos passos:"
echo "   1. Reiniciar Nginx: docker-compose restart nginx"
echo "   2. Acessar: https://$DOMAIN"
echo "   3. O certificado será renovado automaticamente"
echo ""
echo "🔄 Renovação automática: 3 AM diariamente"

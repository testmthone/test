#!/bin/bash

# Simple Portfolio Deployment Script
echo "🚀 Portfolio Deployment Başlatılıyor..."

# Docker containers restart
echo "🐳 Containers yeniden başlatılıyor..."
docker-compose down
docker-compose up -d --build

# Wait for containers
echo "⏳ Containers başlatılıyor..."
sleep 15

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Containers başarıyla başlatıldı!"
else
    echo "❌ Container başlatma hatası!"
    docker-compose logs
    exit 1
fi

# Get server info
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo ""
echo "🎉 Deployment Tamamlandı!"
echo "📊 Website: http://$SERVER_IP:5000"
echo "🔐 Admin: http://$SERVER_IP:5000/admin/login"
echo "📝 Kontrol Komutları:"
echo "   docker-compose ps    # Container durumu"
echo "   docker-compose logs  # Logları görüntüle"
echo "   ./deploy.sh          # Yeniden deploy" 
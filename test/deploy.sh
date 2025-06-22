#!/bin/bash
# set -e: Herhangi bir komut hata verirse script'i anında durdurur
set -e

echo "🚀 Portfolio Deployment Başlatılıyor..."

# Docker containers restart
echo "🐳 Containers yeniden başlatılıyor..."
# DOĞRU KOMUT (tire yerine boşluk)
docker compose down
docker compose up -d --build

# Wait for containers
echo "⏳ Containers başlatılıyor..."
sleep 15

# Check if containers are running
# DOĞRU KOMUT
if docker compose ps | grep -q "Up"; then
    echo "✅ Containers başarıyla başlatıldı!"
else
    echo "❌ Container başlatma hatası!"
    # DOĞRU KOMUT
    docker compose logs
    exit 1
fi

# Get server info
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo ""
echo "🎉 Deployment Tamamlandı!"
echo "📊 Website: http://$SERVER_IP:5000"
echo "🔐 Admin: http://$SERVER_IP:5000/admin/login"
echo "📝 Kontrol Komutları:"
echo "   docker compose ps    # Container durumu (DOĞRU KOMUT)"
echo "   docker compose logs  # Logları görüntüle (DOĞRU KOMUT)"
echo "   ./deploy.sh          # Yeniden deploy"
# Self-Hosted Server Deployment Rehberi

Bu rehber, Portfolio uygulamanızı kendi sunucunuzda nasıl deploy edeceğinizi gösterir.

## 🚀 Hızlı Başlangıç

### 1. Server Hazırlığı

Sunucunuzda (Ubuntu 20.04+ önerili) aşağıdaki komutu çalıştırın:

```bash
# Repository'yi klonlayın
git clone https://github.com/KULLANICI_ADI/REPO_ADI.git
cd REPO_ADI

# Setup script'ini çalıştırın
chmod +x scripts/server-setup.sh
./scripts/server-setup.sh
```

Bu script otomatik olarak:
- Docker ve Docker Compose kurulumu
- Gerekli port yapılandırması (22, 80, 443, 5000)
- PostgreSQL ve Flask uygulaması kurulumu
- Veritabanı başlangıç verilerini oluşturma

### 2. GitHub Secrets Yapılandırması

GitHub repository'nizde **Settings > Secrets and variables > Actions** bölümüne gidin ve aşağıdaki secret'ları ekleyin:

#### Gerekli Secrets:

| Secret Adı | Açıklama | Örnek |
|------------|----------|-------|
| `SSH_PRIVATE_KEY` | Server'a SSH bağlantısı için private key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_HOST` | Server IP adresi veya domain | `192.168.1.100` veya `mydomain.com` |
| `SSH_USER` | SSH kullanıcı adı | `ubuntu` veya `root` |
| `DEPLOY_PATH` | Uygulama klasör yolu (opsiyonel) | `/var/www/portfolio` |

#### SSH Key Oluşturma:

```bash
# Local bilgisayarınızda SSH key oluşturun
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com"

# Public key'i server'a kopyalayın
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-server-ip

# Private key'i GitHub Secrets'a ekleyin
cat ~/.ssh/id_rsa
```

## 🔧 Manuel Kurulum

### Server Gereksinimleri:
- Ubuntu 20.04+ (diğer Linux dağıtımları da desteklenir)
- En az 2GB RAM
- En az 10GB disk alanı
- Docker ve Docker Compose

### Adım 1: Gerekli Paketleri Kurun

```bash
# Sistem güncellemesi
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Adım 2: Projeyi Klonlayın

```bash
# Proje dizini oluşturun
sudo mkdir -p /var/www/portfolio
sudo chown $USER:$USER /var/www/portfolio

# Repository'yi klonlayın
git clone https://github.com/KULLANICI_ADI/REPO_ADI.git /var/www/portfolio
cd /var/www/portfolio
```

### Adım 3: Environment Dosyası Oluşturun

```bash
# .env dosyası oluşturun
cat > .env << EOF
DATABASE_URL=postgresql://postgres:password@postgres:5432/portfolio_db
POSTGRES_DB=portfolio_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
SECRET_KEY=$(openssl rand -hex 32)
FLASK_ENV=production
FLASK_APP=app.py
HOST=0.0.0.0
PORT=5000
EOF
```

### Adım 4: Firewall Yapılandırması

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5000  # Flask app
sudo ufw --force enable
```

### Adım 5: Uygulamayı Başlatın

```bash
# Docker servisleri başlatın
sudo docker-compose up -d --build

# Veritabanını başlatın
sudo docker-compose exec web python -c "
from app import app, db, User
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    admin = User(
        username='admin',
        email='admin@example.com',
        password_hash=generate_password_hash('admin123'),
        is_admin=True
    )
    db.session.add(admin)
    db.session.commit()
"
```

## 🔄 Otomatik Deployment

GitHub Actions ile otomatik deployment aktif edildiğinde:

1. **main** branch'e her push/merge işleminde
2. Otomatik testler çalışır
3. Testler başarılı olursa server'a deployment yapılır
4. Veritabanı güncellemeleri otomatik uygulanır
5. Health check yapılır

### Deployment Süreci:

```
📥 Git Pull (Latest Code)
    ↓
🛑 Stop Services
    ↓
🔨 Build & Start Services
    ↓
🗄️ Database Migration
    ↓
🏥 Health Check
    ↓
✅ Deployment Complete
```

## 🛠️ Yararlı Komutlar

### Servis Yönetimi:
```bash
# Servisleri başlat
sudo docker-compose up -d

# Servisleri durdur
sudo docker-compose down

# Servisleri yeniden başlat
sudo docker-compose restart

# Logları görüntüle
sudo docker-compose logs -f

# Servis durumunu kontrol et
sudo docker-compose ps
```

### Veritabanı Yönetimi:
```bash
# PostgreSQL'e bağlan
sudo docker-compose exec postgres psql -U postgres -d portfolio_db

# Veritabanını sıfırla
sudo docker-compose exec web python -c "
from app import app, db
with app.app_context():
    db.drop_all()
    db.create_all()
"
```

### Uygulama Güncellemesi:
```bash
cd /var/www/portfolio
git pull origin main
sudo docker-compose up -d --build
```

## 🔒 Güvenlik Önerileri

### 1. SSH Güvenliği:
```bash
# SSH port değiştir (opsiyonel)
sudo nano /etc/ssh/sshd_config
# Port 22 -> Port 2222

# SSH servisini yeniden başlat
sudo systemctl restart ssh

# Firewall'u güncelle
sudo ufw delete allow 22
sudo ufw allow 2222
```

### 2. SSL Sertifikası (Let's Encrypt):
```bash
# Certbot kur
sudo apt install certbot

# SSL sertifikası al
sudo certbot certonly --standalone -d yourdomain.com

# Nginx reverse proxy yapılandır (opsiyonel)
```

### 3. Güvenlik Güncellemeleri:
```bash
# Otomatik güvenlik güncellemelerini aktifleştir
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Monitoring

### System Resources:
```bash
# CPU ve RAM kullanımı
htop

# Disk kullanımı
df -h

# Docker container stats
sudo docker stats
```

### Application Logs:
```bash
# Flask app logs
sudo docker-compose logs web

# PostgreSQL logs
sudo docker-compose logs postgres

# Tüm servis logları
sudo docker-compose logs
```

## 🆘 Sorun Giderme

### Port Çakışması:
```bash
# Port 5000'i kullanan servisleri bul
sudo lsof -i :5000

# Servisi durdur
sudo kill -9 PID
```

### Docker Sorunları:
```bash
# Docker servisini yeniden başlat
sudo systemctl restart docker

# Docker cache temizle
sudo docker system prune -a

# Container'ları zorla durdur
sudo docker-compose down --remove-orphans
```

### Veritabanı Bağlantı Sorunu:
```bash
# PostgreSQL container'ını kontrol et
sudo docker-compose exec postgres pg_isready

# Bağlantıyı test et
sudo docker-compose exec web python -c "
from app import app, db
with app.app_context():
    print('Database connection:', db.engine.execute('SELECT 1').scalar())
"
```

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. GitHub Issues bölümünde yeni bir issue açın
2. Log dosyalarını ekleyin
3. Server özelliklerini belirtin
4. Hata mesajlarını tam olarak paylaşın

---

**🎉 Başarılı deployment sonrası uygulamanıza şu adreslerden erişebilirsiniz:**

- **Ana Sayfa**: `http://YOUR_SERVER_IP:5000`
- **Admin Panel**: `http://YOUR_SERVER_IP:5000/admin/login`
- **Giriş Bilgileri**: `admin` / `admin123` 
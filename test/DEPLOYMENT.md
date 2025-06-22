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

## MTHServer Self-Hosted Runner Yönetimi

### 🖥️ Runner Bilgileri
- **Runner Adı**: `mthserver`
- **Etiketler**: `[self-hosted, mthserver]`
- **Hedef**: Sadece bu runner deployment job'larını alacak

### 🔍 Runner Durumu Kontrol

```bash
# mthserver runner durumunu kontrol et
sudo systemctl status actions.runner.mthserver*

# Runner loglarını izle
journalctl -u actions.runner.mthserver* -f

# Runner process'ini kontrol et
ps aux | grep actions.runner
```

### 🔄 Runner Yönetimi

```bash
# mthserver runner'ı yeniden başlat
sudo systemctl restart actions.runner.mthserver*

# Runner'ı durdur
sudo systemctl stop actions.runner.mthserver*

# Runner'ı başlat
sudo systemctl start actions.runner.mthserver*
```

### 📈 Runner Performansı

```bash
# Sistem kaynaklarını kontrol et
htop
free -h
df -h

# Network bağlantısını test et
ping github.com
curl -I https://api.github.com
```

### 🔧 Troubleshooting

#### Runner Offline Görünüyor?
```bash
# 1. Service durumunu kontrol et
sudo systemctl status actions.runner.mthserver*

# 2. GitHub bağlantısını test et
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# 3. Runner'ı yeniden kaydet
cd /home/github-runner/actions-runner
./config.sh remove --token YOUR_TOKEN
./config.sh --url https://github.com/USERNAME/REPO --token YOUR_TOKEN --labels mthserver
sudo ./svc.sh install
sudo ./svc.sh start
```

#### Deployment Başarısız Oluyor?
```bash
# 1. SSH bağlantısını test et
ssh -i ~/.ssh/deploy_key user@target_server

# 2. Deploy script'ini manuel test et
cd /var/www/portfolio
./deploy.sh

# 3. Permissions'ları kontrol et
ls -la /var/www/portfolio/
```

### 🚀 Deployment Workflow

1. **Code push** → `main` branch
2. **GitHub Actions** → `mthserver` runner'ı seçer
3. **Runner** → SSH ile target server'a bağlanır
4. **Deploy** → `deploy.sh` script'i çalışır
5. **Success** → Site güncellenir

### 💡 İpuçları

- Runner'ınız 24/7 çalışır durumda olmalı
- Düzenli olarak sistem güncellemelerini yapın
- Disk alanını kontrol edin (logs büyüyebilir)
- GitHub token'ınızı düzenli olarak yenileyin

## Self-Hosted Runner Güvenlik Rehberi

### 🔒 Güvenlik Önlemleri

#### 1. Runner Güvenliği
```bash
# Runner'ı izole bir kullanıcı ile çalıştırın
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG docker github-runner  # Eğer Docker kullanıyorsanız

# Runner directory'sini güvenli yapın
sudo chmod 750 /home/github-runner
```

#### 2. SSH Key Güvenliği
```bash
# Deployment için özel SSH key oluşturun
ssh-keygen -t ed25519 -f ~/.ssh/deploy_key -N ""

# Sunucuda authorized_keys'e ekleyin (sadece deployment için)
echo "command=\"cd /var/www/portfolio && git pull && ./deploy.sh\",restrict $(cat ~/.ssh/deploy_key.pub)" >> ~/.ssh/authorized_keys
```

#### 3. GitHub Secrets Konfigürasyonu
Repository Settings > Secrets and variables > Actions:
- `SSH_PRIVATE_KEY`: Deploy key'in private kısmı
- `SSH_HOST`: Sunucu IP/domain
- `SSH_USER`: Deployment kullanıcısı

### 🚀 Runner Kurulumu

```bash
# GitHub'dan runner'ı indirin
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Konfigüre edin
./config.sh --url https://github.com/USERNAME/REPO --token YOUR_TOKEN

# Service olarak çalıştırın
sudo ./svc.sh install
sudo ./svc.sh start
```

### 📊 Monitoring

Runner'ınızı izlemek için:
```bash
# Runner status
sudo ./svc.sh status

# Logs
journalctl -u actions.runner.* -f
```

### ⚡ Performans Optimizasyonu

Self-hosted runner avantajları:
- ✅ Unlimited dakika
- ✅ Daha hızlı network (local)
- ✅ Persistent cache
- ✅ Custom environment
- ✅ Daha güçlü donanım

### 🔄 Auto-Update Script

```bash
#!/bin/bash
# update-runner.sh
cd /home/github-runner/actions-runner
sudo ./svc.sh stop
./config.sh remove --token YOUR_TOKEN
# Download latest version
./config.sh --url https://github.com/USERNAME/REPO --token YOUR_TOKEN
sudo ./svc.sh start
```

## Deployment Process

1. **Push to main branch**
2. **GitHub Actions trigger**
3. **Self-hosted runner executes**
4. **SSH to server**
5. **Pull latest code**
6. **Run deploy.sh**
7. **Service restart**

## Troubleshooting

### Runner Offline?
```bash
sudo systemctl status actions.runner.*
sudo systemctl restart actions.runner.*
```

### SSH Issues?
```bash
ssh -vvv user@server  # Debug connection
ssh-keygen -R server_ip  # Remove old host key
```

### Permission Issues?
```bash
sudo chown -R github-runner:github-runner /home/github-runner/
chmod 600 ~/.ssh/id_rsa
``` 
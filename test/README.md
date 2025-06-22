# Portfolio Web Uygulaması

Modern ve responsive bir portfolio web uygulaması. Flask backend, PostgreSQL veritabanı ve metallic blue tema ile geliştirilmiştir.

## 🚀 Özellikler

### Ana Sayfa
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **Metallic Blue Tema**: Modern ve şık tasarım
- **Hızlı Yükleme**: 1 saniye loading animasyonu
- **Smooth Scrolling**: Yumuşak sayfa geçişleri
- **Contact Form**: Gerçek zamanlı mesaj gönderme

### Admin Paneli
- **Güvenli Giriş**: Şifreli admin authentication
- **Dashboard**: İstatistikler ve genel bakış
- **Proje Yönetimi**: CRUD işlemleri
- **Mesaj Yönetimi**: Gelen mesajları görüntüleme ve yönetme
- **Yetenek Yönetimi**: Skill bar'ları düzenleme
- **Responsive Admin**: Mobil uyumlu yönetim paneli

## 🛠️ Teknolojiler

### Backend
- **Python 3.8+**
- **Flask 2.3.3**
- **Flask-SQLAlchemy 3.0.5**
- **Flask-Login 0.6.3**
- **PostgreSQL 15**

### Frontend
- **HTML5**
- **CSS3** (Custom, no frameworks)
- **JavaScript (ES6+)**
- **Responsive Design**

### Veritabanı
- **PostgreSQL** (Docker ile)

## 📋 Gereksinimler

- Python 3.8 veya üzeri
- Docker ve Docker Compose
- Git

## 🚀 Kurulum

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd test
```

### 2. PostgreSQL Veritabanını Başlatın
```bash
docker-compose up -d postgres
```

### 3. Python Sanal Ortamı Oluşturun
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# veya
venv\Scripts\activate  # Windows
```

### 4. Gerekli Paketleri Yükleyin
```bash
pip install -r requirements.txt
```

### 5. Uygulamayı Çalıştırın
```bash
python app.py
```

Uygulama `http://localhost:5000` adresinde çalışacaktır.

## 🔐 Admin Girişi

Admin paneline erişmek için:
- **URL**: `http://localhost:5000/admin/login`
- **Kullanıcı Adı**: `admin`
- **Şifre**: `admin123`

## 📁 Proje Yapısı

```
test/
├── app.py                 # Ana Flask uygulaması
├── requirements.txt       # Python bağımlılıkları
├── docker-compose.yml    # PostgreSQL Docker konfigürasyonu
├── README.md             # Bu dosya
├── templates/            # HTML template'leri
│   ├── index.html        # Ana sayfa
│   ├── admin_login.html  # Admin giriş sayfası
│   └── admin_dashboard.html # Admin paneli
└── static/               # Statik dosyalar
    ├── css/
    │   ├── style.css     # Ana sayfa stilleri
    │   └── admin.css     # Admin paneli stilleri
    ├── js/
    │   ├── script.js     # Ana sayfa JavaScript
    │   └── admin.js      # Admin paneli JavaScript
    └── images/           # Resim dosyaları
```

## 🗄️ Veritabanı Modelleri

### User
- `id`: Primary Key
- `username`: Kullanıcı adı
- `email`: E-posta adresi
- `password_hash`: Şifrelenmiş parola
- `is_admin`: Admin yetkisi
- `created_at`: Oluşturulma tarihi

### Project
- `id`: Primary Key
- `title`: Proje başlığı
- `description`: Proje açıklaması
- `image_url`: Proje resmi URL'i
- `github_url`: GitHub linki
- `live_url`: Canlı demo linki
- `technologies`: Kullanılan teknolojiler
- `created_at`: Oluşturulma tarihi

### Message
- `id`: Primary Key
- `name`: Gönderen adı
- `email`: Gönderen e-postası
- `subject`: Mesaj konusu
- `message`: Mesaj içeriği
- `created_at`: Gönderilme tarihi
- `is_read`: Okundu durumu

### Skill
- `id`: Primary Key
- `name`: Yetenek adı
- `percentage`: Yüzde değeri
- `category`: Kategori (frontend/backend/other)

## 🔧 API Endpoints

### Projeler
- `GET /api/projects` - Tüm projeleri listele
- `POST /api/projects` - Yeni proje oluştur
- `PUT /api/projects/<id>` - Proje güncelle
- `DELETE /api/projects/<id>` - Proje sil

### Mesajlar
- `GET /api/messages` - Tüm mesajları listele
- `POST /api/messages/<id>/read` - Mesajı okundu olarak işaretle

### Yetenekler
- `GET /api/skills` - Tüm yetenekleri listele
- `POST /api/skills` - Yeni yetenek oluştur
- `PUT /api/skills/<id>` - Yetenek güncelle
- `DELETE /api/skills/<id>` - Yetenek sil

### İletişim
- `POST /contact` - Yeni mesaj gönder

## 🎨 Tema Özellikleri

### Metallic Blue Tema
- **Ana Renk**: `#409cff`
- **İkincil Renk**: `#7bb3ff`
- **Arka Plan**: Gradient `#0f1419` to `#1a2332`
- **Metallic Efektler**: Glow ve shadow efektleri
- **Responsive**: Tüm ekran boyutlarında uyumlu

### Animasyonlar
- **Loading**: 1 saniye spinner animasyonu
- **Hover Effects**: Kart ve buton hover efektleri
- **Scroll Animations**: Sayfa kaydırma animasyonları
- **Skill Bars**: Yetenek çubukları animasyonu

## 🔒 Güvenlik

- **Password Hashing**: Werkzeug ile şifre hashleme
- **Session Management**: Flask-Login ile oturum yönetimi
- **CSRF Protection**: Form güvenliği
- **Input Validation**: Giriş doğrulama
- **SQL Injection Protection**: SQLAlchemy ORM

## 🚀 Deployment

### Production için Öneriler

1. **Environment Variables**:
```bash
export SECRET_KEY="your-super-secret-key"
export DATABASE_URL="postgresql://user:password@host:port/db"
export FLASK_ENV="production"
```

2. **WSGI Server**:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

3. **Nginx Reverse Proxy**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🐛 Sorun Giderme

### PostgreSQL Bağlantı Hatası
```bash
# Docker container'ı kontrol edin
docker ps

# PostgreSQL loglarını kontrol edin
docker logs portfolio_postgres

# Veritabanını yeniden başlatın
docker-compose down
docker-compose up -d postgres
```

### Port Çakışması
```bash
# 5000 portunu kullanan işlemleri kontrol edin
lsof -i :5000

# Farklı port kullanın
python app.py --port 5001
```

## 📝 Geliştirme

### Yeni Özellik Ekleme
1. Veritabanı modelini güncelleyin
2. Flask route'larını ekleyin
3. Template'leri güncelleyin
4. JavaScript fonksiyonlarını ekleyin
5. CSS stillerini güncelleyin

### Test Etme
```bash
# Flask test modunda çalıştırın
export FLASK_ENV=development
python app.py
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **E-posta**: alperen@example.com
- **GitHub**: [@alperen](https://github.com/alperen)

## 🙏 Teşekkürler

- Flask framework
- PostgreSQL
- Modern CSS ve JavaScript
- Docker community

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir. Production kullanımı için ek güvenlik önlemleri alınmalıdır. 
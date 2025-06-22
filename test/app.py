from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost:5433/portfolio_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'admin_login'

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(200))
    github_url = db.Column(db.String(200))
    live_url = db.Column(db.String(200))
    technologies = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    percentage = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String(50), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    projects = Project.query.order_by(Project.created_at.desc()).all()
    skills = Skill.query.all()
    return render_template('index.html', projects=projects, skills=skills)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password) and user.is_admin:
            login_user(user)
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Geçersiz kullanıcı adı veya şifre!', 'error')
    
    return render_template('admin_login.html')

@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        return redirect(url_for('admin_login'))
    
    stats = {
        'projects': Project.query.count(),
        'messages': Message.query.count(),
        'unread_messages': Message.query.filter_by(is_read=False).count(),
        'skills': Skill.query.count()
    }
    
    recent_messages = Message.query.order_by(Message.created_at.desc()).limit(5).all()
    recent_projects = Project.query.order_by(Project.created_at.desc()).limit(5).all()
    
    return render_template('admin_dashboard.html', stats=stats, 
                         recent_messages=recent_messages, recent_projects=recent_projects)

@app.route('/admin/logout')
@login_required
def admin_logout():
    logout_user()
    return redirect(url_for('admin_login'))

@app.route('/admin/change-password', methods=['POST'])
@login_required
def change_password():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')
    
    # Verify current password
    if not check_password_hash(current_user.password_hash, current_password):
        return jsonify({'error': 'Mevcut şifre yanlış!'}), 400
    
    # Check if new passwords match
    if new_password != confirm_password:
        return jsonify({'error': 'Yeni şifreler eşleşmiyor!'}), 400
    
    # Check password length
    if len(new_password) < 6:
        return jsonify({'error': 'Şifre en az 6 karakter olmalıdır!'}), 400
    
    # Update password
    current_user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Şifre başarıyla değiştirildi!'})

# API Routes for Admin Panel
@app.route('/api/projects', methods=['GET', 'POST'])
@login_required
def api_projects():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'POST':
        data = request.get_json()
        project = Project(
            title=data['title'],
            description=data['description'],
            image_url=data.get('image_url', ''),
            github_url=data.get('github_url', ''),
            live_url=data.get('live_url', ''),
            technologies=data.get('technologies', '')
        )
        db.session.add(project)
        db.session.commit()
        return jsonify({'message': 'Project created successfully'})
    
    projects = Project.query.all()
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'description': p.description,
        'image_url': p.image_url,
        'github_url': p.github_url,
        'live_url': p.live_url,
        'technologies': p.technologies,
        'created_at': p.created_at.isoformat()
    } for p in projects])

@app.route('/api/projects/<int:project_id>', methods=['PUT', 'DELETE'])
@login_required
def api_project(project_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 401
    
    project = Project.query.get_or_404(project_id)
    
    if request.method == 'DELETE':
        db.session.delete(project)
        db.session.commit()
        return jsonify({'message': 'Project deleted successfully'})
    
    data = request.get_json()
    project.title = data['title']
    project.description = data['description']
    project.image_url = data.get('image_url', '')
    project.github_url = data.get('github_url', '')
    project.live_url = data.get('live_url', '')
    project.technologies = data.get('technologies', '')
    
    db.session.commit()
    return jsonify({'message': 'Project updated successfully'})

@app.route('/api/messages')
@login_required
def api_messages():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 401
    
    messages = Message.query.order_by(Message.created_at.desc()).all()
    return jsonify([{
        'id': m.id,
        'name': m.name,
        'email': m.email,
        'subject': m.subject,
        'message': m.message,
        'created_at': m.created_at.isoformat(),
        'is_read': m.is_read
    } for m in messages])

@app.route('/api/messages/<int:message_id>/read', methods=['POST'])
@login_required
def mark_message_read(message_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 401
    
    message = Message.query.get_or_404(message_id)
    message.is_read = True
    db.session.commit()
    return jsonify({'message': 'Message marked as read'})

@app.route('/api/skills', methods=['GET', 'POST'])
@login_required
def api_skills():
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if request.method == 'POST':
        data = request.get_json()
        skill = Skill(
            name=data['name'],
            percentage=data['percentage'],
            category=data['category']
        )
        db.session.add(skill)
        db.session.commit()
        return jsonify({'message': 'Skill created successfully'})
    
    skills = Skill.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'percentage': s.percentage,
        'category': s.category
    } for s in skills])

@app.route('/api/skills/<int:skill_id>', methods=['PUT', 'DELETE'])
@login_required
def api_skill(skill_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Unauthorized'}), 401
    
    skill = Skill.query.get_or_404(skill_id)
    
    if request.method == 'DELETE':
        db.session.delete(skill)
        db.session.commit()
        return jsonify({'message': 'Skill deleted successfully'})
    
    data = request.get_json()
    skill.name = data['name']
    skill.percentage = data['percentage']
    skill.category = data['category']
    
    db.session.commit()
    return jsonify({'message': 'Skill updated successfully'})

@app.route('/contact', methods=['POST'])
def contact():
    data = request.get_json()
    message = Message(
        name=data['name'],
        email=data['email'],
        subject=data['subject'],
        message=data['message']
    )
    db.session.add(message)
    db.session.commit()
    return jsonify({'message': 'Message sent successfully'})

# Initialize database and create admin user
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create admin user if not exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@example.com',
                password_hash=generate_password_hash('admin123'),
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created: username=admin, password=admin123")

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000) 
// Admin Dashboard JavaScript

// Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetSection = this.getAttribute('data-section');
            document.getElementById(targetSection).classList.add('active');
            
            // Load data for the section
            loadSectionData(targetSection);
        });
    });
    
    // Load initial data
    loadSectionData('dashboard');
});

// Load data for different sections
function loadSectionData(section) {
    switch(section) {
        case 'projects':
            loadProjects();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'skills':
            loadSkills();
            break;
    }
}

// Project Management
function loadProjects() {
    fetch('/api/projects')
        .then(response => response.json())
        .then(projects => {
            const tbody = document.getElementById('projectsTableBody');
            tbody.innerHTML = '';
            
            projects.forEach(project => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${project.title}</td>
                    <td>${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</td>
                    <td>${project.technologies || '-'}</td>
                    <td>${new Date(project.created_at).toLocaleDateString('tr-TR')}</td>
                    <td>
                        <button class="btn btn-edit" onclick="editProject(${project.id})">✏️ Düzenle</button>
                        <button class="btn btn-danger" onclick="deleteProject(${project.id})">🗑️ Sil</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading projects:', error);
            alert('Projeler yüklenirken hata oluştu.');
        });
}

function openProjectModal() {
    document.getElementById('projectModal').style.display = 'block';
    document.getElementById('projectForm').reset();
}

function closeProjectModal() {
    document.getElementById('projectModal').style.display = 'none';
}

function editProject(projectId) {
    // Load project data and open modal for editing
    fetch(`/api/projects/${projectId}`)
        .then(response => response.json())
        .then(project => {
            document.getElementById('projectTitle').value = project.title;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectImage').value = project.image_url || '';
            document.getElementById('projectGithub').value = project.github_url || '';
            document.getElementById('projectLive').value = project.live_url || '';
            document.getElementById('projectTech').value = project.technologies || '';
            
            // Change form action to update
            const form = document.getElementById('projectForm');
            form.dataset.projectId = projectId;
            form.dataset.action = 'update';
            
            document.getElementById('projectModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading project:', error);
            alert('Proje yüklenirken hata oluştu.');
        });
}

function deleteProject(projectId) {
    if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
        fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            alert('Proje başarıyla silindi.');
            loadProjects();
        })
        .catch(error => {
            console.error('Error deleting project:', error);
            alert('Proje silinirken hata oluştu.');
        });
    }
}

// Project form submission
document.getElementById('projectForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        image_url: document.getElementById('projectImage').value,
        github_url: document.getElementById('projectGithub').value,
        live_url: document.getElementById('projectLive').value,
        technologies: document.getElementById('projectTech').value
    };
    
    const action = this.dataset.action;
    const projectId = this.dataset.projectId;
    
    const url = action === 'update' ? `/api/projects/${projectId}` : '/api/projects';
    const method = action === 'update' ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(result => {
        alert(action === 'update' ? 'Proje başarıyla güncellendi.' : 'Proje başarıyla oluşturuldu.');
        closeProjectModal();
        loadProjects();
        
        // Reset form
        this.reset();
        delete this.dataset.action;
        delete this.dataset.projectId;
    })
    .catch(error => {
        console.error('Error saving project:', error);
        alert('Proje kaydedilirken hata oluştu.');
    });
});

// Message Management
function loadMessages() {
    fetch('/api/messages')
        .then(response => response.json())
        .then(messages => {
            const tbody = document.getElementById('messagesTableBody');
            tbody.innerHTML = '';
            
            messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.name}</td>
                    <td>${message.email}</td>
                    <td>${message.subject}</td>
                    <td>${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}</td>
                    <td>${new Date(message.created_at).toLocaleDateString('tr-TR')}</td>
                    <td>
                        <span class="status-badge ${message.is_read ? 'read' : 'unread'}">
                            ${message.is_read ? '✅ Okundu' : '📧 Okunmadı'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-edit" onclick="viewMessage(${message.id})">👁️ Görüntüle</button>
                        ${!message.is_read ? `<button class="btn btn-primary" onclick="markAsRead(${message.id})">✅ Okundu</button>` : ''}
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading messages:', error);
            alert('Mesajlar yüklenirken hata oluştu.');
        });
}

function viewMessage(messageId) {
    fetch(`/api/messages/${messageId}`)
        .then(response => response.json())
        .then(message => {
            alert(`
Mesaj Detayları:
Ad: ${message.name}
E-posta: ${message.email}
Konu: ${message.subject}
Mesaj: ${message.message}
Tarih: ${new Date(message.created_at).toLocaleString('tr-TR')}
            `);
        })
        .catch(error => {
            console.error('Error loading message:', error);
            alert('Mesaj yüklenirken hata oluştu.');
        });
}

function markAsRead(messageId) {
    fetch(`/api/messages/${messageId}/read`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(result => {
        alert('Mesaj okundu olarak işaretlendi.');
        loadMessages();
    })
    .catch(error => {
        console.error('Error marking message as read:', error);
        alert('Mesaj işaretlenirken hata oluştu.');
    });
}

// Skill Management
function loadSkills() {
    fetch('/api/skills')
        .then(response => response.json())
        .then(skills => {
            const tbody = document.getElementById('skillsTableBody');
            tbody.innerHTML = '';
            
            skills.forEach(skill => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${skill.name}</td>
                    <td>${skill.category}</td>
                    <td>${skill.percentage}%</td>
                    <td>
                        <button class="btn btn-edit" onclick="editSkill(${skill.id})">✏️ Düzenle</button>
                        <button class="btn btn-danger" onclick="deleteSkill(${skill.id})">🗑️ Sil</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading skills:', error);
            alert('Yetenekler yüklenirken hata oluştu.');
        });
}

function openSkillModal() {
    document.getElementById('skillModal').style.display = 'block';
    document.getElementById('skillForm').reset();
}

function closeSkillModal() {
    document.getElementById('skillModal').style.display = 'none';
}

function editSkill(skillId) {
    fetch(`/api/skills/${skillId}`)
        .then(response => response.json())
        .then(skill => {
            document.getElementById('skillName').value = skill.name;
            document.getElementById('skillCategory').value = skill.category;
            document.getElementById('skillPercentage').value = skill.percentage;
            
            const form = document.getElementById('skillForm');
            form.dataset.skillId = skillId;
            form.dataset.action = 'update';
            
            document.getElementById('skillModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading skill:', error);
            alert('Yetenek yüklenirken hata oluştu.');
        });
}

function deleteSkill(skillId) {
    if (confirm('Bu yeteneği silmek istediğinizden emin misiniz?')) {
        fetch(`/api/skills/${skillId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            alert('Yetenek başarıyla silindi.');
            loadSkills();
        })
        .catch(error => {
            console.error('Error deleting skill:', error);
            alert('Yetenek silinirken hata oluştu.');
        });
    }
}

// Skill form submission
document.getElementById('skillForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('skillName').value,
        category: document.getElementById('skillCategory').value,
        percentage: parseInt(document.getElementById('skillPercentage').value)
    };
    
    const action = this.dataset.action;
    const skillId = this.dataset.skillId;
    
    const url = action === 'update' ? `/api/skills/${skillId}` : '/api/skills';
    const method = action === 'update' ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(result => {
        alert(action === 'update' ? 'Yetenek başarıyla güncellendi.' : 'Yetenek başarıyla oluşturuldu.');
        closeSkillModal();
        loadSkills();
        
        // Reset form
        this.reset();
        delete this.dataset.action;
        delete this.dataset.skillId;
    })
    .catch(error => {
        console.error('Error saving skill:', error);
        alert('Yetenek kaydedilirken hata oluştu.');
    });
});

// Modal close functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Settings form
document.querySelector('.settings-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Ayarlar güncellendi! (Bu özellik henüz tamamlanmadı)');
});

// Status badges styling
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .status-badge.read {
        background: rgba(64, 255, 64, 0.2);
        color: #6bff6b;
        border: 1px solid rgba(64, 255, 64, 0.3);
    }
    
    .status-badge.unread {
        background: rgba(255, 193, 7, 0.2);
        color: #ffc107;
        border: 1px solid rgba(255, 193, 7, 0.3);
    }
`;
document.head.appendChild(style);

// Auto-refresh dashboard data
setInterval(() => {
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection && activeSection.id === 'dashboard') {
        // Refresh dashboard stats (you can implement this if needed)
    }
}, 30000); // Refresh every 30 seconds

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    // Ctrl+N for new project
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openProjectModal();
    }
    
    // Ctrl+S for new skill
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        openSkillModal();
    }
});

// Change Password Functions
function openChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'block';
    document.getElementById('changePasswordForm').reset();
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'none';
}

// Change Password form submission
document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Client-side validation
    if (newPassword !== confirmPassword) {
        alert('Yeni şifreler eşleşmiyor!');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Şifre en az 6 karakter olmalıdır!');
        return;
    }
    
    const formData = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
    };
    
    fetch('/admin/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            alert('Hata: ' + result.error);
        } else {
            alert(result.message);
            closeChangePasswordModal();
            // Optional: Auto logout after password change
            // window.location.href = '/admin/logout';
        }
    })
    .catch(error => {
        console.error('Error changing password:', error);
        alert('Şifre değiştirilirken hata oluştu.');
    });
});

// Export functions for global access
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.openSkillModal = openSkillModal;
window.closeSkillModal = closeSkillModal;
window.editSkill = editSkill;
window.deleteSkill = deleteSkill;
window.viewMessage = viewMessage;
window.markAsRead = markAsRead;
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal; 
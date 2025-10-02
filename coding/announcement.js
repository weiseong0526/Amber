// Activity Management System
class ActivityManager {
    constructor() {
        this.activities = this.loadActivities();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderActivities();
        this.setupFileUploads();
    }

    setupEventListeners() {
        // Form submission
        const activityForm = document.getElementById('activityForm');
        if (activityForm) {
            activityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        } else {
            console.warn('Activity form not found');
        }

        // Edit form submission
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditSubmit(e);
            });
        } else {
            console.warn('Edit form not found');
        }

        // Modal controls
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const cancelEditBtn = document.getElementById('cancelEdit');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }

        // Modal backdrop click
        const editModal = document.getElementById('editModal');
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target.id === 'editModal') {
                    this.closeModal();
                }
            });
        }

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                this.setActiveNavItem(item);
            });
        });
    }

    setupFileUploads() {
        const uploadAreas = ['uploadArea', 'editUploadArea'];
        
        uploadAreas.forEach(areaId => {
            const area = document.getElementById(areaId);
            if (!area) {
                console.warn(`Upload area ${areaId} not found`);
                return;
            }
            
            const input = area.querySelector('input[type="file"]');
            if (!input) {
                console.warn(`File input not found in ${areaId}`);
                return;
            }
            
            // Click to upload
            area.addEventListener('click', () => {
                input.click();
            });

            // Drag and drop
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('dragover');
            });

            area.addEventListener('dragleave', () => {
                area.classList.remove('dragover');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    input.files = files;
                    this.updateUploadArea(area, files[0]);
                }
            });

            // File input change
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.updateUploadArea(area, e.target.files[0]);
                }
            });
        });
    }

    updateUploadArea(area, file) {
        const icon = area.querySelector('i');
        const text = area.querySelector('p');
        
        if (file.type.startsWith('image/')) {
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#28a745';
            text.textContent = file.name;
            text.style.color = '#28a745';
        } else {
            icon.className = 'fas fa-exclamation-triangle';
            icon.style.color = '#dc3545';
            text.textContent = 'Please select an image file';
            text.style.color = '#dc3545';
        }
    }

    handleFormSubmit(e) {
        const formData = new FormData(e.target);
        const activity = {
            id: Date.now().toString(),
            title: formData.get('title'),
            date: formData.get('date'),
            time: formData.get('time'),
            image: formData.get('image'), // Store File object temporarily
            createdAt: new Date().toISOString()
        };

        // Validate required fields
        if (!activity.title || !activity.date || !activity.time) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Add activity
        this.activities.unshift(activity);
        this.saveActivities();
        this.renderActivities();
        this.resetForm();
        this.showMessage('Activity posted successfully!', 'success');
    }

    handleEditSubmit(e) {
        const formData = new FormData(e.target);
        const activityId = document.getElementById('editId').value;
        
        const updatedActivity = {
            id: activityId,
            title: formData.get('title'),
            date: formData.get('date'),
            time: formData.get('time'),
            image: formData.get('image'),
            createdAt: this.activities.find(a => a.id === activityId)?.createdAt || new Date().toISOString()
        };

        // Update activity
        const index = this.activities.findIndex(a => a.id === activityId);
        if (index !== -1) {
            this.activities[index] = { ...this.activities[index], ...updatedActivity };
            this.saveActivities();
            this.renderActivities();
            this.closeModal();
            this.showMessage('Activity updated successfully!', 'success');
        }
    }

    editActivity(id) {
        const activity = this.activities.find(a => a.id === id);
        if (!activity) return;

        this.currentEditId = id;
        
        // Populate edit form
        document.getElementById('editId').value = activity.id;
        document.getElementById('editTitle').value = activity.title;
        document.getElementById('editDate').value = activity.date;
        document.getElementById('editTime').value = activity.time;
        
        // Reset upload area
        const editUploadArea = document.getElementById('editUploadArea');
        const icon = editUploadArea.querySelector('i');
        const text = editUploadArea.querySelector('p');
        icon.className = 'fas fa-arrow-up';
        icon.style.color = '#ff8c00';
        text.textContent = 'Upload New Image';
        text.style.color = '#666';
        
        // Show modal
        document.getElementById('editModal').style.display = 'block';
    }

    deleteActivity(id) {
        if (confirm('Are you sure you want to delete this activity?')) {
            this.activities = this.activities.filter(a => a.id !== id);
            this.saveActivities();
            this.renderActivities();
            this.showMessage('Activity deleted successfully!', 'success');
        }
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditId = null;
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('#activitiesTableBody input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    setActiveNavItem(activeItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    getImageHTML(activity) {
        try {
            if (activity.image && activity.image instanceof File) {
                const imageUrl = URL.createObjectURL(activity.image);
                return `<img src="${imageUrl}" alt="${activity.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
            }
        } catch (e) {
            console.warn('Error creating image URL:', e);
        }
        return `<i class="fas fa-image"></i>`;
    }

    renderActivities() {
        const tbody = document.getElementById('activitiesTableBody');
        
        if (this.activities.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-calendar-plus"></i>
                        <h3>No Activities Yet</h3>
                        <p>Create your first activity using the form above</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.activities.map(activity => `
            <tr>
                <td><input type="checkbox"></td>
                <td>
                    <div class="activity-image">
                        ${this.getImageHTML(activity)}
                    </div>
                </td>
                <td>${activity.title}</td>
                <td>${this.formatDate(activity.date)}</td>
                <td>${this.formatTime(activity.time)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit-btn" onclick="activityManager.editActivity('${activity.id}')" title="Edit">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="activityManager.deleteActivity('${activity.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes}${ampm}`;
    }

    resetForm() {
        document.getElementById('activityForm').reset();
        
        // Reset upload area
        const uploadArea = document.getElementById('uploadArea');
        const icon = uploadArea.querySelector('i');
        const text = uploadArea.querySelector('p');
        icon.className = 'fas fa-arrow-up';
        icon.style.color = '#ff8c00';
        text.textContent = 'Upload Image';
        text.style.color = '#666';
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert at the top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(messageDiv, mainContent.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    loadActivities() {
        const saved = localStorage.getItem('amber-activities');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading activities:', e);
                return [];
            }
        }
        return [];
    }

    saveActivities() {
        try {
            // Create a copy of activities without File objects for localStorage
            const activitiesToSave = this.activities.map(activity => ({
                ...activity,
                image: activity.image instanceof File ? null : activity.image
            }));
            localStorage.setItem('amber-activities', JSON.stringify(activitiesToSave));
        } catch (e) {
            console.error('Error saving activities:', e);
        }
    }
}

// Initialize the application
let activityManager;

document.addEventListener('DOMContentLoaded', () => {
    activityManager = new ActivityManager();
    
    // Add some sample data if none exists
    if (activityManager.activities.length === 0) {
        activityManager.activities = [
            {
                id: '1',
                title: 'Yoga Session',
                date: '2025-08-22',
                time: '20:00',
                image: null,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Meditation Workshop',
                date: '2025-08-25',
                time: '18:30',
                image: null,
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                title: 'Fitness Bootcamp',
                date: '2025-08-28',
                time: '07:00',
                image: null,
                createdAt: new Date().toISOString()
            }
        ];
        activityManager.saveActivities();
        activityManager.renderActivities();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('editModal');
        if (modal.style.display === 'block') {
            activityManager.closeModal();
        }
    }
    
    // Ctrl+N to focus on new activity form
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('activityTitle').focus();
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && activityManager) {
        activityManager.renderActivities();
    }
});

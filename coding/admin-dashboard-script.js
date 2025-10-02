// Admin Dashboard JavaScript

class AdminDashboard {
    constructor() {
        this.activities = [];
        this.filteredActivities = [];
        this.currentFilter = {
            activity: '',
            status: '',
            date: ''
        };
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeDashboard();
            });
        } else {
            this.initializeDashboard();
        }
    }

    initializeDashboard() {
        this.loadActivities();
        this.bindEvents();
        this.renderActivities();
        this.updateKPIs();
        
        // Listen for page visibility changes to refresh data when returning from create class page
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadActivities();
                this.renderActivities();
                this.updateKPIs();
            }
        });
    }

    loadActivities() {
        // Check if shared data manager is available
        if (!window.sharedDataManager) {
            console.error('Shared data manager not available');
            return;
        }
        
        // Load activities from shared data manager
        this.activities = window.sharedDataManager.getDashboardActivities();
        this.filteredActivities = [...this.activities];
        
        // Update activity filter dropdown with a small delay to ensure DOM is ready
        setTimeout(() => {
            this.updateActivityFilter();
        }, 100);
    }

    updateActivityFilter() {
        const activityFilter = document.getElementById('activityFilter');
        if (!activityFilter) {
            console.log('Activity filter element not found');
            return;
        }

        // Get unique activity types from current activities
        const activityTypes = [...new Set(this.activities.map(activity => activity.type || activity.activityType))].filter(type => type);
        
        // Clear existing options except the first one (All Activities)
        activityFilter.innerHTML = '<option value="">All Activities</option>';
        
        // Add options for each activity type
        activityTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = this.formatActivityType(type);
            activityFilter.appendChild(option);
        });
    }

    formatActivityType(type) {
        // Convert activity type to display format
        const typeMap = {
            'yoga': 'Yoga',
            'pilates': 'Pilates',
            'dance': 'Dance',
            'fitness': 'Fitness',
            'martial-arts': 'Martial Arts',
            'swimming': 'Swimming',
            'weaving': 'Weaving',
            'other': 'Other'
        };
        return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
    }

    bindEvents() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Filter functionality
        document.getElementById('activityFilter').addEventListener('change', (e) => {
            this.currentFilter.activity = e.target.value;
            this.applyFilters();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilter.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.currentFilter.date = e.target.value;
            this.applyFilters();
        });

        // Clear filters
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Add Activity - Navigate to create class page
        document.getElementById('addActivityBtn').addEventListener('click', () => {
            this.navigateToCreateClass();
        });

        document.getElementById('createFirstActivityBtn').addEventListener('click', () => {
            this.navigateToCreateClass();
        });

        // Edit Activity Modal events (for edit functionality)
        this.bindEditModalEvents();

        // Recent changes toggle
        document.getElementById('recentChangesBtn').addEventListener('click', () => {
            this.toggleRecentChanges();
        });

        // Reset data
        document.getElementById('resetDataBtn').addEventListener('click', () => {
            this.resetData();
        });
    }

    bindEditModalEvents() {
        // Edit Activity Modal (keeping for potential future use)
        const editModal = document.getElementById('editActivityModal');
        const editForm = document.getElementById('editActivityForm');
        const closeEditModal = document.getElementById('closeEditActivityModal');
        const cancelEdit = document.getElementById('cancelEditActivity');

        if (closeEditModal) {
            closeEditModal.addEventListener('click', () => this.hideModal(editModal));
        }
        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => this.hideModal(editModal));
        }
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditActivity(e));
        }

        // Close modal when clicking outside
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    this.hideModal(editModal);
                }
            });
        }
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase();
        this.filteredActivities = this.activities.filter(activity => 
            activity.name.toLowerCase().includes(searchTerm) ||
            activity.description.toLowerCase().includes(searchTerm)
        );
        this.renderActivities();
    }

    applyFilters() {
        this.filteredActivities = this.activities.filter(activity => {
            const activityMatch = !this.currentFilter.activity || activity.type === this.currentFilter.activity;
            const statusMatch = !this.currentFilter.status || activity.status === this.currentFilter.status;
            const dateMatch = !this.currentFilter.date || this.checkDateFilter(activity, this.currentFilter.date);
            
            return activityMatch && statusMatch && dateMatch;
        });
        
        this.renderActivities();
    }

    checkDateFilter(activity, filter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filter) {
            case 'today':
                return activity.times.some(time => {
                    const timeDate = new Date(time.date);
                    return timeDate.toDateString() === today.toDateString();
                });
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return activity.times.some(time => {
                    const timeDate = new Date(time.date);
                    return timeDate >= weekAgo && timeDate <= now;
                });
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return activity.times.some(time => {
                    const timeDate = new Date(time.date);
                    return timeDate >= monthAgo && timeDate <= now;
                });
            default:
                return true;
        }
    }

    clearFilters() {
        document.getElementById('activityFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFilter').value = '';
        document.getElementById('searchInput').value = '';
        
        this.currentFilter = { activity: '', status: '', date: '' };
        this.filteredActivities = [...this.activities];
        this.renderActivities();
    }

    renderActivities() {
        const grid = document.getElementById('activitiesGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (this.filteredActivities.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        grid.innerHTML = this.filteredActivities.map(activity => this.createActivityCard(activity)).join('');
        
        // Bind time slot events
        this.bindTimeSlotEvents();
    }

    createActivityCard(activity) {
        const timeSlots = activity.times.map(time => {
            const isAvailable = time.available !== false;
            const status = isAvailable ? 'active' : 'closed';
            return `
                <div class="time-slot status-${status} ${time.selected ? 'selected' : ''}" 
                     data-activity-id="${activity.id}" 
                     data-time="${time.date}"
                     style="${!isAvailable ? 'cursor: not-allowed;' : ''}"
                     title="${!isAvailable ? 'This time slot is closed' : ''}">
                    ${time.date}
                </div>
            `;
        }).join('');

        // Find selected time slot to get specific capacity and duration
        const selectedTime = activity.times.find(time => time.selected);
        const displayCapacity = selectedTime ? selectedTime.capacity : activity.capacity;
        const displayDuration = selectedTime ? selectedTime.duration : activity.duration;
        const displayBookings = selectedTime ? (selectedTime.currentBookings || 0) : activity.currentBookings;

        // Format activity title as "Activity Type - Class Name"
        const activityType = activity.type || activity.activityType;
        const className = activity.className || activity.name;
        const displayTitle = activityType && className ? 
            `${this.formatActivityType(activityType)} - ${className}` : 
            className || activity.name;

        return `
            <div class="activity-card">
                <img src="${activity.image}" alt="${displayTitle}" class="activity-image" 
                     onerror="this.src='https://via.placeholder.com/400x200/667eea/ffffff?text=Activity+Image'">
                <div class="activity-content">
                    <h3 class="activity-title">${displayTitle}</h3>
                    <p class="activity-description">${activity.description}</p>
                    <div class="activity-details">
                        <div class="activity-detail">
                            <i class="fas fa-users"></i>
                            <span>${displayBookings}/${displayCapacity}</span>
                        </div>
                        <div class="activity-detail">
                            <i class="fas fa-clock"></i>
                            <span>${displayDuration}min</span>
                        </div>
                    </div>
                    <div class="activity-times">
                        <div class="time-label">Select time:</div>
                        <div class="time-slots">
                            ${timeSlots}
                        </div>
                    </div>
                    <div class="activity-actions">
                        <button class="btn-edit-activity" onclick="adminDashboard.editActivity(${activity.id})">
                            Edit Activity
                        </button>
                        <button class="btn-delete-activity" onclick="adminDashboard.deleteActivity(${activity.id})">
                            Delete Activity
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindTimeSlotEvents() {
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const activityId = parseInt(e.target.dataset.activityId);
                const time = e.target.dataset.time;
                this.selectTimeSlot(activityId, time);
            });
        });
    }

    selectTimeSlot(activityId, time) {
        // Find the activity and time slot
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;
        
        const selectedTime = activity.times.find(t => t.date === time);
        if (!selectedTime) return;
        
        // Don't allow selection of closed slots
        if (selectedTime.available === false) {
            this.showNotification('This time slot is closed and cannot be selected', 'error');
            return;
        }
        
        // Remove previous selection for this activity
        activity.times.forEach(t => t.selected = false);
        selectedTime.selected = true;
        
        this.renderActivities();
    }

    updateKPIs() {
        const stats = window.sharedDataManager.getStatistics();
        
        document.getElementById('totalBookings').textContent = stats.totalBookings;
        document.getElementById('activeCustomers').textContent = stats.activeCustomers;
        document.getElementById('activeActivities').textContent = stats.activeActivities;
        document.getElementById('occupancyRate').textContent = `${stats.occupancyRate}%`;
    }

    navigateToCreateClass() {
        // Clear any existing edit mode
        window.sharedDataManager.clearEditingActivity();
        // Navigate to create class page
        window.location.href = 'admin-create-class.html';
    }

    showEditActivityModal(activityId) {
        // This method is kept for potential future use but edit now navigates to create class page
        console.log('Edit activity modal called for ID:', activityId);
    }

    hideModal(modal) {
        if (modal) {
            modal.classList.remove('show');
        }
    }

    editActivity(activityId) {
        // Set the activity for editing and navigate to create class page
        window.sharedDataManager.setActivityForEdit(activityId);
        window.location.href = 'admin-create-class.html';
    }

    deleteActivity(activityId) {
        // Show confirmation dialog
        const activity = this.activities.find(a => a.id === activityId);
        const activityName = activity ? activity.name : 'this activity';
        
        if (confirm(`Are you sure you want to delete "${activityName}"? This action cannot be undone.`)) {
            try {
                const success = window.sharedDataManager.deleteActivity(activityId);
                if (success) {
                    this.showNotification('Activity deleted successfully', 'success');
                    this.loadActivities(); // This will also update the activity filter
                    this.renderActivities();
                    this.updateKPIs();
                } else {
                    this.showNotification('Failed to delete activity', 'error');
                }
            } catch (error) {
                console.error('Error deleting activity:', error);
                this.showNotification('Error deleting activity: ' + error.message, 'error');
            }
        }
    }

    toggleRecentChanges() {
        const icon = document.getElementById('recentChangesIcon');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
        
        // This would show/hide a recent changes panel
        console.log('Recent changes toggled');
    }

    resetData() {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            window.sharedDataManager.resetData();
            this.loadActivities();
            this.clearFilters();
            this.showNotification('Data reset successfully!', 'info');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#DC2626' : '#3B82F6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

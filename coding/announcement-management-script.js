// Announcement Management System
class AnnouncementManager {
    constructor() {
        this.announcements = [];
        this.filteredAnnouncements = [];
        this.currentAnnouncement = {
            title: '',
            content: '',
            sendTo: '',
            image: null,
            priority: '',
            expiryDate: '',
            status: 'draft'
        };
        this.searchQuery = '';
        this.filters = {
            priority: '',
            status: '',
            recipients: '',
            dateRange: '',
            startDate: '',
            endDate: ''
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFileUpload();
        this.setupSearchAndFilters();
        this.loadAnnouncements();
        this.applyFiltersAndSearch();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('announcementForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCancel());
        }

        // Table actions
        const selectAllBtn = document.getElementById('selectAllBtn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAllAnnouncements());
        }

        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedAnnouncements());
        }

        // Select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', () => this.toggleSelectAll());
        }
    }

    setupSearchAndFilters() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFiltersAndSearch();
            });
        }

        // Clear search button
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Filter selects
        const priorityFilter = document.getElementById('priorityFilter');
        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                this.filters.priority = e.target.value;
                this.applyFiltersAndSearch();
            });
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFiltersAndSearch();
            });
        }

        const recipientsFilter = document.getElementById('recipientsFilter');
        if (recipientsFilter) {
            recipientsFilter.addEventListener('change', (e) => {
                this.filters.recipients = e.target.value;
                this.applyFiltersAndSearch();
            });
        }

        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.dateRange = e.target.value;
                this.handleDateRangeChange();
                this.applyFiltersAndSearch();
            });
        }

        // Custom date inputs
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        if (startDate) {
            startDate.addEventListener('change', () => {
                this.filters.startDate = startDate.value;
                this.applyFiltersAndSearch();
            });
        }
        if (endDate) {
            endDate.addEventListener('change', () => {
                this.filters.endDate = endDate.value;
                this.applyFiltersAndSearch();
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    handleDateRangeChange() {
        const customDateRange = document.getElementById('customDateRange');
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (this.filters.dateRange === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
            this.filters.startDate = '';
            this.filters.endDate = '';
            if (startDate) startDate.value = '';
            if (endDate) endDate.value = '';
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        this.searchQuery = '';
        this.applyFiltersAndSearch();
    }

    clearAllFilters() {
        // Reset all filter values
        this.filters = {
            priority: '',
            status: '',
            recipients: '',
            dateRange: '',
            startDate: '',
            endDate: ''
        };

        // Reset form elements
        const priorityFilter = document.getElementById('priorityFilter');
        const statusFilter = document.getElementById('statusFilter');
        const recipientsFilter = document.getElementById('recipientsFilter');
        const dateFilter = document.getElementById('dateFilter');
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');

        if (priorityFilter) priorityFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        if (recipientsFilter) recipientsFilter.value = '';
        if (dateFilter) dateFilter.value = '';
        if (startDate) startDate.value = '';
        if (endDate) endDate.value = '';

        // Hide custom date range
        const customDateRange = document.getElementById('customDateRange');
        if (customDateRange) {
            customDateRange.style.display = 'none';
        }

        // Clear search
        this.clearSearch();
    }

    applyFiltersAndSearch() {
        this.filteredAnnouncements = this.announcements.filter(announcement => {
            // Search filter
            if (this.searchQuery) {
                const searchText = `${announcement.title} ${announcement.content}`.toLowerCase();
                if (!searchText.includes(this.searchQuery)) {
                    return false;
                }
            }

            // Priority filter
            if (this.filters.priority && announcement.priority !== this.filters.priority) {
                return false;
            }

            // Status filter
            if (this.filters.status) {
                const isExpired = announcement.expiryDate && new Date(announcement.expiryDate) < new Date();
                const currentStatus = isExpired ? 'expired' : announcement.status;
                if (currentStatus !== this.filters.status) {
                    return false;
                }
            }

            // Recipients filter
            if (this.filters.recipients && announcement.sendTo !== this.filters.recipients) {
                return false;
            }

            // Date range filter
            if (this.filters.dateRange) {
                const announcementDate = new Date(announcement.publishedAt);
                const today = new Date();
                
                switch (this.filters.dateRange) {
                    case 'today':
                        if (!this.isSameDay(announcementDate, today)) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (announcementDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        if (announcementDate < monthAgo) return false;
                        break;
                    case 'custom':
                        if (this.filters.startDate && announcementDate < new Date(this.filters.startDate)) return false;
                        if (this.filters.endDate && announcementDate > new Date(this.filters.endDate)) return false;
                        break;
                }
            }

            return true;
        });

        this.renderAnnouncements();
        this.updateSearchResultsInfo();
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    updateSearchResultsInfo() {
        const searchResultsInfo = document.getElementById('searchResultsInfo');
        const searchResultsCount = document.getElementById('searchResultsCount');
        const searchQuery = document.getElementById('searchQuery');

        if (!searchResultsInfo || !searchResultsCount || !searchQuery) return;

        const hasActiveFilters = this.searchQuery || 
                                this.filters.priority || 
                                this.filters.status || 
                                this.filters.recipients || 
                                this.filters.dateRange;

        if (hasActiveFilters) {
            searchResultsInfo.style.display = 'flex';
            searchResultsCount.textContent = `${this.filteredAnnouncements.length} result${this.filteredAnnouncements.length !== 1 ? 's' : ''} found`;
            
            const filterTexts = [];
            if (this.searchQuery) filterTexts.push(`"${this.searchQuery}"`);
            if (this.filters.priority) filterTexts.push(`Priority: ${this.filters.priority}`);
            if (this.filters.status) filterTexts.push(`Status: ${this.filters.status}`);
            if (this.filters.recipients) filterTexts.push(`Recipients: ${this.getRecipientsText(this.filters.recipients)}`);
            if (this.filters.dateRange && this.filters.dateRange !== 'custom') filterTexts.push(`Date: ${this.filters.dateRange}`);
            if (this.filters.dateRange === 'custom' && (this.filters.startDate || this.filters.endDate)) {
                const start = this.filters.startDate || 'Start';
                const end = this.filters.endDate || 'End';
                filterTexts.push(`Date: ${start} to ${end}`);
            }
            
            searchQuery.textContent = filterTexts.join(' • ');
        } else {
            searchResultsInfo.style.display = 'none';
        }
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('announcementImage');

        if (!uploadArea || !fileInput) return;

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
    }

    handleFileUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select an image file', 'error');
            return;
        }

        this.currentAnnouncement.image = file;
        this.updateUploadArea(file);
        this.showMessage('Image uploaded successfully!', 'success');
    }

    updateUploadArea(file) {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadArea.innerHTML = `
                    <img src="${e.target.result}" alt="Uploaded image" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
                `;
                uploadArea.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        } else {
            uploadArea.innerHTML = `
                <i class="fas fa-upload"></i>
                <p>Upload Image</p>
            `;
            uploadArea.classList.remove('has-image');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(e.target);
        this.currentAnnouncement = {
            id: Date.now().toString(),
            title: formData.get('announcementTitle'),
            content: formData.get('announcementContent'),
            sendTo: formData.get('sendTo'),
            image: this.currentAnnouncement.image,
            priority: formData.get('priority'),
            expiryDate: formData.get('expiryDate'),
            status: 'published',
            createdAt: new Date().toISOString(),
            publishedAt: new Date().toISOString()
        };

        // Validate required fields
        if (!this.currentAnnouncement.title || !this.currentAnnouncement.content || 
            !this.currentAnnouncement.sendTo || !this.currentAnnouncement.priority) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        // Add to announcements array
        this.announcements.unshift(this.currentAnnouncement);
        
        // Save to localStorage
        this.saveAnnouncements();
        
        // Reset form
        this.resetForm();
        
        // Apply filters and re-render table
        this.applyFiltersAndSearch();
        
        this.showMessage('Announcement published successfully!', 'success');
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            this.resetForm();
        }
    }

    resetForm() {
        document.getElementById('announcementForm').reset();
        this.currentAnnouncement = {
            title: '',
            content: '',
            sendTo: '',
            image: null,
            priority: '',
            expiryDate: '',
            status: 'draft'
        };
        this.updateUploadArea(null);
    }

    selectAllAnnouncements() {
        const checkboxes = document.querySelectorAll('.announcement-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });
        
        this.updateSelectAllCheckbox();
        this.updateCardSelection();
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const checkboxes = document.querySelectorAll('.announcement-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
        
        this.updateCardSelection();
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const checkboxes = document.querySelectorAll('.announcement-checkbox');
        
        if (checkboxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
            return;
        }
        
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        if (checkedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === checkboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }

    updateCardSelection() {
        const cards = document.querySelectorAll('.announcement-card');
        cards.forEach(card => {
            const checkbox = card.querySelector('.announcement-checkbox');
            if (checkbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    deleteSelectedAnnouncements() {
        const selectedCheckboxes = document.querySelectorAll('.announcement-checkbox:checked');
        
        if (selectedCheckboxes.length === 0) {
            this.showMessage('Please select announcements to delete', 'error');
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedCheckboxes.length} announcement(s)?`)) {
            const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.announcementId);
            
            this.announcements = this.announcements.filter(announcement => 
                !selectedIds.includes(announcement.id)
            );
            
            this.saveAnnouncements();
            this.applyFiltersAndSearch();
            
            this.showMessage(`${selectedIds.length} announcement(s) deleted successfully`, 'success');
        }
    }

    editAnnouncement(announcementId) {
        const announcement = this.announcements.find(a => a.id === announcementId);
        if (!announcement) return;

        // Populate form with announcement data
        document.getElementById('announcementTitle').value = announcement.title;
        document.getElementById('announcementContent').value = announcement.content;
        document.getElementById('sendTo').value = announcement.sendTo;
        document.getElementById('priority').value = announcement.priority;
        document.getElementById('expiryDate').value = announcement.expiryDate || '';

        // Handle image
        if (announcement.image) {
            this.currentAnnouncement.image = announcement.image;
            this.updateUploadArea(announcement.image);
        }

        // Remove from announcements array (will be re-added on save)
        this.announcements = this.announcements.filter(a => a.id !== announcementId);
        this.saveAnnouncements();
        this.applyFiltersAndSearch();

        this.showMessage('Announcement loaded for editing', 'success');
    }

    deleteAnnouncement(announcementId) {
        if (confirm('Are you sure you want to delete this announcement?')) {
            this.announcements = this.announcements.filter(a => a.id !== announcementId);
            this.saveAnnouncements();
            this.applyFiltersAndSearch();
            
            this.showMessage('Announcement deleted successfully', 'success');
        }
    }

    renderAnnouncements() {
        const grid = document.getElementById('announcementsGrid');
        if (!grid) return;

        if (this.filteredAnnouncements.length === 0) {
            const hasActiveFilters = this.searchQuery || 
                                    this.filters.priority || 
                                    this.filters.status || 
                                    this.filters.recipients || 
                                    this.filters.dateRange;
            
            if (hasActiveFilters) {
                grid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <h3>No Results Found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                    </div>
                `;
            } else {
                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-bullhorn"></i>
                        <h3>No Announcements</h3>
                        <p>Create your first announcement to get started</p>
                    </div>
                `;
            }
            return;
        }

        grid.innerHTML = this.filteredAnnouncements.map(announcement => {
            const date = new Date(announcement.publishedAt);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const isExpired = announcement.expiryDate && new Date(announcement.expiryDate) < new Date();
            const status = isExpired ? 'expired' : announcement.status;

            return `
                <div class="announcement-card" data-announcement-id="${announcement.id}">
                    <input type="checkbox" class="announcement-checkbox" data-announcement-id="${announcement.id}">
                    
                    <div class="announcement-card-header">
                        ${announcement.image ? 
                            `<img src="${announcement.image instanceof File ? URL.createObjectURL(announcement.image) : announcement.image}" class="announcement-image" alt="Announcement image">` :
                            `<div class="announcement-image-placeholder"><i class="fas fa-image"></i></div>`
                        }
                        <div class="announcement-priority-badge priority-${announcement.priority}">${announcement.priority}</div>
                        <div class="announcement-status-badge status-${status}">${status}</div>
                    </div>
                    
                    <div class="announcement-card-body">
                        <h3 class="announcement-title">${announcement.title}</h3>
                        <p class="announcement-content">${announcement.content}</p>
                        
                        <div class="announcement-meta">
                            <div class="announcement-meta-item">
                                <i class="fas fa-users"></i>
                                <span class="announcement-recipients">${this.getRecipientsText(announcement.sendTo)}</span>
                            </div>
                            <div class="announcement-meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="announcement-meta-item">
                                <i class="fas fa-clock"></i>
                                <span>${formattedTime}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="announcement-card-footer">
                        <div class="announcement-date">${formattedDate} at ${formattedTime}</div>
                        <div class="announcement-actions">
                            <button class="btn-edit" onclick="announcementManager.editAnnouncement('${announcement.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" onclick="announcementManager.deleteAnnouncement('${announcement.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to checkboxes
        const checkboxes = document.querySelectorAll('.announcement-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectAllCheckbox();
                this.updateCardSelection();
            });
        });
    }

    getRecipientsText(sendTo) {
        const recipients = {
            'all': 'All Customers',
            'active': 'Active Members',
            'new': 'New Members',
            'premium': 'Premium Members'
        };
        return recipients[sendTo] || sendTo;
    }

    saveAnnouncements() {
        try {
            localStorage.setItem('announcements', JSON.stringify(this.announcements));
        } catch (error) {
            console.warn('Error saving announcements:', error);
        }
    }

    loadAnnouncements() {
        try {
            const saved = localStorage.getItem('announcements');
            if (saved) {
                this.announcements = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Error loading announcements:', error);
        }
    }

    showMessage(message, type) {
        // Create or update message element
        let messageEl = document.getElementById('message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'message';
            messageEl.style.position = 'fixed';
            messageEl.style.top = '20px';
            messageEl.style.right = '20px';
            messageEl.style.zIndex = '9999';
            messageEl.style.padding = '1rem';
            messageEl.style.borderRadius = '8px';
            messageEl.style.color = 'white';
            messageEl.style.fontWeight = '500';
            messageEl.style.maxWidth = '300px';
            messageEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            document.body.appendChild(messageEl);
        }

        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (messageEl) {
                messageEl.remove();
            }
        }, 3000);
    }
}

// Initialize the announcement manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.announcementManager = new AnnouncementManager();
});

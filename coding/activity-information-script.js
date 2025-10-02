// Activity Information Management System with Preview
class ActivityInformationManager {
    constructor() {
        this.currentActivity = {
            activityType: '',
            activityName: '',
            activitySubtitle: '',
            activityDescription: '',
            danceStyles: '',
            duration: 45,
            maxParticipants: 8,
            coachName: '',
            location: '',
            price: '',
            image: null
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFileUpload();
        this.updatePreview();
        this.loadExistingActivity();
    }

    setupEventListeners() {
        // Form inputs
        const inputs = [
            'activityType', 'activityName', 'activitySubtitle', 'activityDescription',
            'danceStyles', 'duration', 'maxParticipants', 'coachName', 'location', 
            'price'
        ];

        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
                input.addEventListener('change', () => this.updatePreview());
            }
        });


        // Form submission
        const form = document.getElementById('activityForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        }

        // Action buttons
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCancel());
        }

        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('activityImage');

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

        this.currentActivity.image = file;
        this.updateUploadArea(file);
        this.updatePreview();
        this.showMessage('Image uploaded successfully!', 'success');
    }

    updateUploadArea(file) {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadArea.innerHTML = `
                    <img src="${e.target.result}" alt="Uploaded image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                `;
            };
            reader.readAsDataURL(file);
        } else {
            uploadArea.innerHTML = `
                <i class="fas fa-arrow-up"></i>
                <p>Upload Activity Image</p>
            `;
        }
    }

    // Preview Methods
    updatePreview() {
        // Update current activity data
        this.currentActivity.activityType = document.getElementById('activityType').value || '';
        this.currentActivity.activityName = document.getElementById('activityName').value || 'Activity Name';
        this.currentActivity.activitySubtitle = document.getElementById('activitySubtitle').value || '';
        this.currentActivity.activityDescription = document.getElementById('activityDescription').value || 'Enter a description to see it here';
        this.currentActivity.danceStyles = document.getElementById('danceStyles').value || '';
        this.currentActivity.duration = parseInt(document.getElementById('duration').value) || 45;
        this.currentActivity.maxParticipants = parseInt(document.getElementById('maxParticipants').value) || 8;
        this.currentActivity.coachName = document.getElementById('coachName').value || '';
        this.currentActivity.location = document.getElementById('location').value || '';
        this.currentActivity.price = document.getElementById('price').value || '';

        // Update preview elements
        this.updatePreviewImage();
        this.updatePreviewTitle();
        this.updatePreviewSubtitle();
        this.updatePreviewMeta();
        this.updatePreviewDescription();
        this.updateDanceStyles();
        this.updateCoachPriceInfo();
    }

    updatePreviewImage() {
        const previewImage = document.getElementById('previewImage');
        if (!previewImage) return;

        if (this.currentActivity.image && this.currentActivity.image instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.innerHTML = `
                    <img src="${e.target.result}" alt="Activity image" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="banner-overlay">
                        <div class="banner-subtitle" id="previewBannerSubtitle">${this.currentActivity.activitySubtitle || 'High-energy dance fitness that\'s fun and effective'}</div>
                        <div class="banner-title" id="previewBannerTitle">${this.currentActivity.activityName || 'Activity Name'}</div>
                    </div>
                `;
            };
            reader.readAsDataURL(this.currentActivity.image);
        } else {
            previewImage.innerHTML = `
                <div class="banner-placeholder">
                    <i class="fas fa-image"></i>
                    <p>No image uploaded</p>
                </div>
                <div class="banner-overlay">
                    <div class="banner-subtitle" id="previewBannerSubtitle">${this.currentActivity.activitySubtitle || 'High-energy dance fitness that\'s fun and effective'}</div>
                    <div class="banner-title" id="previewBannerTitle">${this.currentActivity.activityName || 'Activity Name'}</div>
                </div>
            `;
        }
    }

    updatePreviewTitle() {
        // Update banner title
        const bannerTitle = document.getElementById('previewBannerTitle');
        if (bannerTitle) {
            bannerTitle.textContent = this.currentActivity.activityName || 'Activity Name';
        }
        
        // Update details title
        const detailsTitle = document.getElementById('previewDetailsTitle');
        if (detailsTitle) {
            const activityType = this.currentActivity.activityType ? this.currentActivity.activityType.charAt(0).toUpperCase() + this.currentActivity.activityType.slice(1) : '';
            const activityName = this.currentActivity.activityName;
            detailsTitle.textContent = activityType && activityName ? `${activityType} - ${activityName}` : activityName || 'Activity Name';
        }
    }

    updatePreviewSubtitle() {
        // Update banner subtitle
        const bannerSubtitle = document.getElementById('previewBannerSubtitle');
        if (bannerSubtitle) {
            bannerSubtitle.textContent = this.currentActivity.activitySubtitle || 'High-energy dance fitness that\'s fun and effective';
        }
        
        // Update intro title and description
        const introTitle = document.getElementById('previewIntroTitle');
        if (introTitle) {
            const activityType = this.currentActivity.activityType ? this.currentActivity.activityType.charAt(0).toUpperCase() + this.currentActivity.activityType.slice(1) : '';
            introTitle.textContent = `Join Our ${activityType} Classes` || 'Join Our Activity Classes';
        }
        
        const introDescription = document.getElementById('previewIntroDescription');
        if (introDescription) {
            const activityType = this.currentActivity.activityType || 'activity';
            introDescription.textContent = `Get your heart pumping and your body moving with our energetic ${activityType} sessions.`;
        }
    }

    updatePreviewMeta() {
        const previewCapacity = document.getElementById('previewCapacity');
        const previewDuration = document.getElementById('previewDuration');

        if (previewCapacity) {
            previewCapacity.textContent = `${this.currentActivity.maxParticipants} people`;
        }

        if (previewDuration) {
            previewDuration.textContent = `${this.currentActivity.duration} minutes`;
        }
    }

    updatePreviewDescription() {
        const previewDescription = document.getElementById('previewDescription');
        if (previewDescription) {
            const description = this.currentActivity.activityDescription || 'Enter a description to see it here';
            previewDescription.innerHTML = `
                <p>${description}</p>
                <p>Perfect for all fitness levels - no experience required!</p>
            `;
        }
    }

    updateDanceStyles() {
        const previewDanceStyles = document.getElementById('previewDanceStyles');
        
        if (previewDanceStyles) {
            if (this.currentActivity.activityType === 'dance' && this.currentActivity.danceStyles.trim() !== '') {
                previewDanceStyles.textContent = this.currentActivity.danceStyles;
            } else {
                previewDanceStyles.textContent = 'Not specified';
            }
        }
    }

    updateCoachPriceInfo() {
        const previewCoachName = document.getElementById('previewCoachName');
        const previewLocation = document.getElementById('previewLocation');
        const previewPrice = document.getElementById('previewPrice');

        if (previewCoachName) {
            previewCoachName.textContent = this.currentActivity.coachName || 'Not specified';
        }

        if (previewLocation) {
            previewLocation.textContent = this.currentActivity.location || 'Not specified';
        }
        
        if (previewPrice) {
            previewPrice.textContent = this.currentActivity.price || 'Not specified';
        }
    }



    // Form handling methods
    handleFormSubmit(e) {
        e.preventDefault();
        this.handleSave();
    }

    handleSave() {
        // Validate required fields
        const requiredFields = ['activityType', 'activityName', 'activityDescription', 'coachName', 'price'];
        const missingFields = requiredFields.filter(field => {
            const element = document.getElementById(field);
            return !element || !element.value.trim();
        });

        if (missingFields.length > 0) {
            this.showMessage(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
            return;
        }

        // Save activity data
        const activityData = {
            ...this.currentActivity,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // Save to localStorage
        try {
            const existingData = JSON.parse(localStorage.getItem('activityInformation') || '[]');
            
            // Check if this is an update to existing activity
            const existingIndex = existingData.findIndex(item => item.id === activityData.id);
            if (existingIndex !== -1) {
                existingData[existingIndex] = activityData;
            } else {
                existingData.push(activityData);
            }
            
            localStorage.setItem('activityInformation', JSON.stringify(existingData));
            
            // Also save to activities storage for booking management
            const bookingActivity = {
                id: activityData.id,
                name: activityData.activityName,
                date: new Date().toISOString().split('T')[0], // Today's date as default
                time: '09:00', // Default time
                capacity: parseInt(activityData.maxParticipants) || 8, // Default capacity
                group: activityData.activityType.charAt(0).toUpperCase() + activityData.activityType.slice(1),
                type: activityData.activityType,
                description: activityData.activityDescription,
                created: activityData.createdAt
            };
            
            const existingActivities = JSON.parse(localStorage.getItem('activities') || '[]');
            const activityIndex = existingActivities.findIndex(a => a.id === bookingActivity.id);
            
            if (activityIndex !== -1) {
                existingActivities[activityIndex] = bookingActivity;
            } else {
                existingActivities.push(bookingActivity);
            }
            
            localStorage.setItem('activities', JSON.stringify(existingActivities));
            
            // Trigger storage event to update booking management
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'activities',
                newValue: JSON.stringify(existingActivities)
            }));
            
            this.showMessage('Activity information saved successfully!', 'success');
        } catch (error) {
            console.warn('Error saving activity information:', error);
            this.showMessage('Error saving activity information', 'error');
        }
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            this.resetForm();
        }
    }

    resetForm() {
        document.getElementById('activityForm').reset();
        
        this.currentActivity = {
            activityType: '',
            activityName: '',
            activitySubtitle: '',
            activityDescription: '',
            danceStyles: '',
            duration: 45,
            maxParticipants: 8,
            coachName: '',
            location: '',
            price: '',
            image: null
        };
        this.updatePreview();
        this.updateUploadArea(null);
    }

    loadExistingActivity() {
        // Try to load existing activity information from localStorage
        try {
            const existingData = JSON.parse(localStorage.getItem('activityInformation') || '[]');
            if (existingData.length > 0) {
                // Load the most recent activity
                const latestActivity = existingData[existingData.length - 1];
                this.loadActivityData(latestActivity);
            }
        } catch (error) {
            console.warn('Error loading existing activity:', error);
        }
    }

    loadActivityData(activityData) {
        // Populate form with existing data
        document.getElementById('activityType').value = activityData.activityType || '';
        document.getElementById('activityName').value = activityData.activityName || '';
        document.getElementById('activitySubtitle').value = activityData.activitySubtitle || '';
        document.getElementById('activityDescription').value = activityData.activityDescription || '';
        document.getElementById('danceStyles').value = activityData.danceStyles || '';
        document.getElementById('duration').value = activityData.duration || 45;
        document.getElementById('maxParticipants').value = activityData.maxParticipants || 8;
        document.getElementById('coachName').value = activityData.coachName || '';
        document.getElementById('location').value = activityData.location || '';
        document.getElementById('price').value = activityData.price || '';

        // Update current activity object
        this.currentActivity = { ...activityData };

        // Update preview
        this.updatePreview();
    }

    // Utility methods
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

// Initialize the activity information manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.activityInfoManager = new ActivityInformationManager();
});



// Admin Class Management System with Detailed Time Slots
class AdminClassManager {
    constructor() {
        this.currentClass = {
            activityType: '',
            className: '',
            status: '',
            description: '',
            image: null,
            timeSlots: [] // Each time slot will have: { date, time, capacity, price, duration, id }
        };
        this.selectedTimeSlot = null; // Track which time slot is selected in preview
        this.isEditMode = false;
        this.editingActivityId = null;
        this.init();
    }

    init() {
        this.checkEditMode();
        this.setupEventListeners();
        this.setupFileUpload();
        this.updatePreview();
        this.updateClassInfoTimeSlots();
        this.setupTimeSlots();
    }

    checkEditMode() {
        // Check if we're editing an existing activity
        this.editingActivityId = window.sharedDataManager.getEditingActivityId();
        this.isEditMode = !!this.editingActivityId;
        
        if (this.isEditMode) {
            this.loadActivityForEdit();
        }
    }

    loadActivityForEdit() {
        const activityData = window.sharedDataManager.getActivityForEdit(this.editingActivityId);
        if (!activityData) {
            this.showMessage('Activity not found for editing', 'error');
            this.isEditMode = false;
            return;
        }

        // Populate form with existing data
        document.getElementById('activityType').value = activityData.activityType || '';
        document.getElementById('className').value = activityData.className || '';
        document.getElementById('description').value = activityData.description || '';
        
        if (activityData.image) {
            // Handle image URL
            this.currentClass.image = activityData.image;
            this.updateUploadAreaFromURL(activityData.image);
        }

        // Load time slots
        this.currentClass.timeSlots = activityData.timeSlots || [];
        this.updateClassInfoTimeSlots();
        this.updatePreview();
        
        // Update page title to indicate edit mode
        const pageHeader = document.querySelector('.page-header h1');
        if (pageHeader) {
            pageHeader.textContent = 'Admin - Edit Class';
        }
    }

    setupEventListeners() {
        // Form inputs
        const inputs = [
            'activityType', 'className', 'description'
        ];

        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.updatePreview());
            }
        });

        // Form submission
        const form = document.getElementById('classForm');
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

        // Add Time Slot button in Class Information
        const addTimeSlotBtn = document.getElementById('addTimeSlotBtn');
        if (addTimeSlotBtn) {
            addTimeSlotBtn.addEventListener('click', () => this.addTimeSlot());
        }
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('classImage');

        if (!uploadArea || !fileInput) {
            console.log('Upload area or file input not found');
            return;
        }

        console.log('Setting up file upload...');

        // Remove any existing event listeners by cloning the element
        const newUploadArea = uploadArea.cloneNode(true);
        uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);

        // Get the new element reference
        const currentUploadArea = document.getElementById('uploadArea');

        // Click handler for upload area
        currentUploadArea.addEventListener('click', (e) => {
            console.log('Upload area clicked');
            // Don't trigger if clicking the clear button
            if (e.target.closest('button')) {
                console.log('Clear button clicked, not triggering file input');
                return;
            }
            console.log('Triggering file input click');
            fileInput.click();
        });

        // Drag and drop handlers
        currentUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            currentUploadArea.classList.add('dragover');
        });
        
        currentUploadArea.addEventListener('dragleave', () => {
            currentUploadArea.classList.remove('dragover');
        });
        
        currentUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            currentUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // File input change event (only add once)
        if (!fileInput.hasAttribute('data-listener-added')) {
            fileInput.addEventListener('change', (e) => {
                console.log('File input change event triggered');
                console.log('Files selected:', e.target.files.length);
                if (e.target.files.length > 0) {
                    console.log('Processing file:', e.target.files[0]);
                    this.handleFileUpload(e.target.files[0]);
                }
            });
            fileInput.setAttribute('data-listener-added', 'true');
        }

        console.log('File upload setup complete');
    }

    handleFileUpload(file) {
        console.log('handleFileUpload called with file:', file);
        
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select an image file', 'error');
            return;
        }

        // Convert file to data URL for storage
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('File read successfully, converting to data URL');
            this.currentClass.image = e.target.result; // Store as data URL
            this.updateUploadArea(file);
            this.updatePreview();
            this.showMessage('Image uploaded successfully!', 'success');
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            this.showMessage('Error reading image file', 'error');
        };
        reader.readAsDataURL(file);
    }

    updateUploadArea(file) {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadArea.innerHTML = `
                    <img src="${e.target.result}" alt="Uploaded image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                    <div style="position: absolute; top: 10px; right: 10px;">
                        <button type="button" onclick="adminClassManager.clearImage()" style="background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 14px;" title="Remove image">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                // Re-setup file upload after changing the content
                this.setupFileUpload();
            };
            reader.readAsDataURL(file);
        } else {
            uploadArea.innerHTML = `
                <i class="fas fa-arrow-up"></i>
                <p>Upload Image</p>
            `;
            // Ensure the upload area is clickable
            uploadArea.style.cursor = 'pointer';
            // Re-setup file upload after changing the content
            this.setupFileUpload();
        }
    }

    updateUploadAreaFromURL(imageUrl) {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        uploadArea.innerHTML = `
            <img src="${imageUrl}" alt="Class image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            <div style="position: absolute; top: 10px; right: 10px;">
                <button type="button" onclick="adminClassManager.clearImage()" style="background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 14px;" title="Remove image">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        // Re-setup file upload after changing the content
        this.setupFileUpload();
    }

    clearImage() {
        console.log('Clearing image...');
        this.currentClass.image = null;
        this.updateUploadArea(null);
        this.updatePreview();
        
        // Reset the file input
        const fileInput = document.getElementById('classImage');
        if (fileInput) {
            fileInput.value = '';
            console.log('File input reset');
        }
        
        // Re-setup file upload to ensure click events work
        this.setupFileUpload();
        
        this.showMessage('Image removed', 'success');
    }


    // Time Slot Management Methods
    addTimeSlot() {
        const modal = document.getElementById('addTimeSlotModal');
        if (!modal) return;

        // Show modal
        modal.style.display = 'block';

        // Set default values to today's date and current time
        const today = new Date();
        const currentDate = today.toISOString().split('T')[0];
        const currentTime = today.toTimeString().slice(0, 5);
        
        document.getElementById('slotDate').value = currentDate;
        document.getElementById('slotTime').value = currentTime;
        document.getElementById('slotCapacity').value = 8;
        document.getElementById('slotPrice').value = 0;
        document.getElementById('slotDuration').value = 120;

        // Remove existing event listeners to prevent duplicates
        const closeBtn = document.getElementById('closeTimeSlotModal');
        const cancelBtn = document.getElementById('cancelTimeSlot');
        const saveBtn = document.getElementById('saveTimeSlot');

        // Clone elements to remove all event listeners
        const newCloseBtn = closeBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newSaveBtn = saveBtn.cloneNode(true);

        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        // Add fresh event listeners
        newCloseBtn.addEventListener('click', () => this.closeTimeSlotModal());
        newCancelBtn.addEventListener('click', () => this.closeTimeSlotModal());
        newSaveBtn.addEventListener('click', () => this.saveTimeSlot());
    }

    closeTimeSlotModal() {
        const modal = document.getElementById('addTimeSlotModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveTimeSlot() {
        const date = document.getElementById('slotDate').value;
        const time = document.getElementById('slotTime').value;
        const capacity = parseInt(document.getElementById('slotCapacity').value);
        const price = parseFloat(document.getElementById('slotPrice').value);
        const duration = parseInt(document.getElementById('slotDuration').value);

        if (!date || !time) {
            this.showMessage('Please fill in both date and time', 'error');
            return;
        }

        if (capacity < 1) {
            this.showMessage('Capacity must be at least 1', 'error');
            return;
        }

        if (price < 0) {
            this.showMessage('Price cannot be negative', 'error');
            return;
        }

        if (duration < 1) {
            this.showMessage('Duration must be at least 1 minute', 'error');
            return;
        }

        const status = document.getElementById('slotStatus').value;
        
        if (!status) {
            this.showMessage('Please select a status for this time slot', 'error');
            return;
        }

        const timeSlot = {
            id: Date.now().toString(),
            date: date,
            time: time,
            capacity: capacity,
            price: price,
            duration: duration,
            status: status,
            displayText: `${date} ${time} (${capacity} slots, RM${price}, ${duration}min, ${status})`
        };
        
        // Check for duplicate date/time
        const exists = this.currentClass.timeSlots.some(slot => 
            slot.date === date && slot.time === time
        );
        
        if (exists) {
            this.showMessage('This date and time already exists', 'error');
            return;
        }

        this.currentClass.timeSlots.push(timeSlot);
        this.updateTimeSlots();
        this.updateClassInfoTimeSlots();
        this.closeTimeSlotModal();
        this.showMessage('Time slot added successfully!', 'success');
    }

    editTimeSlot(timeSlot, index) {
        const modal = document.getElementById('editTimeSlotModal');
        if (!modal) return;

        // Show modal
        modal.style.display = 'block';

        // Pre-fill with current values
        document.getElementById('editSlotDate').value = timeSlot.date;
        document.getElementById('editSlotTime').value = timeSlot.time;
        document.getElementById('editSlotCapacity').value = timeSlot.capacity;
        document.getElementById('editSlotPrice').value = timeSlot.price;
        document.getElementById('editSlotDuration').value = timeSlot.duration;
        document.getElementById('editSlotStatus').value = timeSlot.status || '';
        document.getElementById('editSlotIndex').value = index;

        // Remove existing event listeners to prevent duplicates
        const closeBtn = document.getElementById('closeEditTimeSlotModal');
        const cancelBtn = document.getElementById('cancelEditTimeSlot');
        const saveBtn = document.getElementById('saveEditTimeSlot');

        // Clone elements to remove all event listeners
        const newCloseBtn = closeBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newSaveBtn = saveBtn.cloneNode(true);

        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        // Add fresh event listeners
        newCloseBtn.addEventListener('click', () => this.closeEditTimeSlotModal());
        newCancelBtn.addEventListener('click', () => this.closeEditTimeSlotModal());
        newSaveBtn.addEventListener('click', () => this.saveEditTimeSlot());
    }

    closeEditTimeSlotModal() {
        const modal = document.getElementById('editTimeSlotModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveEditTimeSlot() {
        const date = document.getElementById('editSlotDate').value;
        const time = document.getElementById('editSlotTime').value;
        const capacity = parseInt(document.getElementById('editSlotCapacity').value);
        const price = parseFloat(document.getElementById('editSlotPrice').value);
        const duration = parseInt(document.getElementById('editSlotDuration').value);
        const index = parseInt(document.getElementById('editSlotIndex').value);

        if (!date || !time) {
            this.showMessage('Please fill in both date and time', 'error');
            return;
        }

        if (capacity < 1) {
            this.showMessage('Capacity must be at least 1', 'error');
            return;
        }

        if (price < 0) {
            this.showMessage('Price cannot be negative', 'error');
            return;
        }

        if (duration < 1) {
            this.showMessage('Duration must be at least 1 minute', 'error');
            return;
        }

        const status = document.getElementById('editSlotStatus').value;
        
        if (!status) {
            this.showMessage('Please select a status for this time slot', 'error');
            return;
        }

        const newTimeSlot = {
            id: this.currentClass.timeSlots[index].id, // Keep original ID
            date: date,
            time: time,
            capacity: capacity,
            price: price,
            duration: duration,
            status: status,
            displayText: `${date} ${time} (${capacity} slots, RM${price}, ${duration}min, ${status})`
        };

        // Check for duplicate date/time (excluding current slot)
        const exists = this.currentClass.timeSlots.some((slot, i) => 
            i !== index && slot.date === date && slot.time === time
        );
        
        if (exists) {
            this.showMessage('This date and time already exists', 'error');
            return;
        }

        this.currentClass.timeSlots[index] = newTimeSlot;
        this.updateTimeSlots();
        this.updateClassInfoTimeSlots();
        this.closeEditTimeSlotModal();
        this.showMessage('Time slot updated successfully!', 'success');
    }

    deleteTimeSlot(index) {
        if (confirm('Are you sure you want to delete this time slot?')) {
            this.currentClass.timeSlots.splice(index, 1);
            this.updateTimeSlots();
            this.updateClassInfoTimeSlots();
            this.showMessage('Time slot deleted successfully!', 'success');
        }
    }

    updateClassInfoTimeSlots() {
        const currentTimeSlots = document.getElementById('currentTimeSlots');
        if (!currentTimeSlots) return;

        if (!this.currentClass.timeSlots || this.currentClass.timeSlots.length === 0) {
            currentTimeSlots.innerHTML = '<p class="no-slots-message">No time slots added yet</p>';
            return;
        }

        const slotsHTML = this.currentClass.timeSlots.map((slot, index) => `
            <div class="time-slot-item">
                <div class="slot-info">
                    <div class="slot-main">${slot.date} ${slot.time}</div>
                    <div class="slot-details">Capacity: ${slot.capacity} | Price: RM${slot.price} | Duration: ${slot.duration}min | Status: ${slot.status || 'Not set'}</div>
                </div>
                <div class="slot-actions">
                    <button type="button" class="edit-slot-btn" onclick="adminClassManager.editTimeSlot(${JSON.stringify(slot).replace(/"/g, '&quot;')}, ${index})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="delete-slot-btn" onclick="adminClassManager.deleteTimeSlot(${index})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        currentTimeSlots.innerHTML = slotsHTML;
    }

    setupTimeSlots() {
        // This method can be used for any additional time slot setup
    }

    // Preview Methods
    updatePreview() {
        // Update current class data
        this.currentClass.activityType = document.getElementById('activityType').value || '';
        this.currentClass.className = document.getElementById('className').value || 'Class Name';
        // Status is now handled per time slot, not globally
        this.currentClass.description = document.getElementById('description').value || 'Enter a description to see it here';

        // Update preview elements
        this.updatePreviewImage();
        this.updatePreviewTitle();
        this.updatePreviewMeta();
        this.updatePreviewDescription();
        this.updateTimeSlots();
        this.updateBookButton();
    }

    updatePreviewImage() {
        const previewImage = document.getElementById('previewImage');
        if (!previewImage) return;

        if (this.currentClass.image) {
            // Handle both File objects and data URLs
            if (this.currentClass.image instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.innerHTML = `<img src="${e.target.result}" alt="Class image" style="width: 100%; height: 100%; object-fit: cover;">`;
                };
                reader.readAsDataURL(this.currentClass.image);
            } else {
                // It's already a data URL or regular URL
                previewImage.innerHTML = `<img src="${this.currentClass.image}" alt="Class image" style="width: 100%; height: 100%; object-fit: cover;">`;
            }
        } else {
            previewImage.innerHTML = `
                <i class="fas fa-image"></i>
                <p>No image uploaded</p>
            `;
        }
    }

    updatePreviewTitle() {
        const previewTitle = document.getElementById('previewTitle');
        if (previewTitle) {
            const activityType = this.currentClass.activityType ? this.currentClass.activityType.charAt(0).toUpperCase() + this.currentClass.activityType.slice(1) : '';
            const className = this.currentClass.className;
            previewTitle.textContent = activityType && className ? `${activityType} - ${className}` : className || 'Class Name';
        }
    }

    updatePreviewMeta() {
        const previewCapacity = document.getElementById('previewCapacity');
        const previewDuration = document.getElementById('previewDuration');

        if (previewCapacity) {
            // Show capacity based on selected time slot only
            if (this.currentClass.timeSlots.length === 0) {
                previewCapacity.textContent = '0/0';
            } else if (this.selectedTimeSlot !== null && this.currentClass.timeSlots[this.selectedTimeSlot]) {
                // Show selected time slot capacity
                const selectedSlot = this.currentClass.timeSlots[this.selectedTimeSlot];
                previewCapacity.textContent = `0/${selectedSlot.capacity}`;
            } else {
                // Show first time slot capacity if no selection
                previewCapacity.textContent = `0/${this.currentClass.timeSlots[0].capacity}`;
            }
        }

        if (previewDuration) {
            // Show duration based on selected time slot only
            if (this.currentClass.timeSlots.length === 0) {
                previewDuration.textContent = '0min';
            } else if (this.selectedTimeSlot !== null && this.currentClass.timeSlots[this.selectedTimeSlot]) {
                // Show selected time slot duration
                const selectedSlot = this.currentClass.timeSlots[this.selectedTimeSlot];
                previewDuration.textContent = `${selectedSlot.duration}min`;
            } else {
                // Show first time slot duration if no selection
                previewDuration.textContent = `${this.currentClass.timeSlots[0].duration}min`;
            }
        }
    }

    updatePreviewDescription() {
        const previewDescription = document.getElementById('previewDescription');
        if (previewDescription) {
            previewDescription.textContent = this.currentClass.description;
        }
    }

    updateTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeOptions');
        if (!timeSlotsContainer) return;

        // Clear existing time slots
        timeSlotsContainer.innerHTML = '';

        const timeSlots = this.currentClass.timeSlots || [];
        
        if (timeSlots.length === 0) {
            // Show message when no time slots are added
            const noSlotsMsg = document.createElement('div');
            noSlotsMsg.className = 'no-time-slots';
            noSlotsMsg.innerHTML = '<i class="fas fa-calendar-plus"></i><p>Add time slots to see them here</p>';
            timeSlotsContainer.appendChild(noSlotsMsg);
        } else {
            // Show existing time slots (clickable preview) - only date and time
            timeSlots.forEach((slot, index) => {
                const timeSlot = document.createElement('div');
                const status = slot.status || 'active';
                timeSlot.className = `time-slot status-${status}`;
                timeSlot.textContent = `${slot.date} ${slot.time}`;
                
                // Add click handler only for non-closed slots
                if (status !== 'closed') {
                    timeSlot.addEventListener('click', () => this.selectTimeSlot(slot, index));
                } else {
                    timeSlot.style.cursor = 'not-allowed';
                    timeSlot.title = 'This time slot is closed';
                }
                
                timeSlotsContainer.appendChild(timeSlot);
            });
        }
    }

    selectTimeSlot(slot, index) {
        // Don't allow selection of closed slots
        if (slot.status === 'closed') {
            this.showMessage('This time slot is closed and cannot be selected', 'error');
            return;
        }
        
        // Update selected time slot
        this.selectedTimeSlot = index;
        
        // Update visual selection
        const timeSlotsContainer = document.getElementById('timeOptions');
        if (timeSlotsContainer) {
            const timeSlots = timeSlotsContainer.querySelectorAll('.time-slot');
            timeSlots.forEach((timeSlot, i) => {
                if (i === index) {
                    timeSlot.classList.add('selected');
                } else {
                    timeSlot.classList.remove('selected');
                }
            });
        }
        
        // Update preview meta to show selected slot details
        this.updatePreviewMeta();
        
        // Update book button
        this.updateBookButton();
    }

    updateBookButton() {
        const bookNowBtn = document.getElementById('bookNowBtn');
        if (!bookNowBtn) return;

        const hasTimeSlots = this.currentClass.timeSlots && this.currentClass.timeSlots.length > 0;
        const hasSelection = this.selectedTimeSlot !== null;
        
        if (!hasTimeSlots) {
            bookNowBtn.textContent = 'No Time Slots Available';
            bookNowBtn.disabled = true;
            bookNowBtn.className = 'book-now-btn disabled';
        } else if (!hasSelection) {
            bookNowBtn.textContent = 'Select a Time Slot';
            bookNowBtn.disabled = true;
            bookNowBtn.className = 'book-now-btn disabled';
        } else {
            const selectedSlot = this.currentClass.timeSlots[this.selectedTimeSlot];
            const status = selectedSlot.status || 'active';
            
            // Update button based on status
            switch (status.toLowerCase()) {
                case 'active':
                    bookNowBtn.textContent = 'Book Now';
                    bookNowBtn.disabled = false;
                    bookNowBtn.className = 'book-now-btn status-active';
                    break;
                case 'upcoming':
                    bookNowBtn.textContent = 'UPCOMING';
                    bookNowBtn.disabled = true;
                    bookNowBtn.className = 'book-now-btn status-upcoming';
                    break;
                case 'closed':
                    bookNowBtn.textContent = 'Closed';
                    bookNowBtn.disabled = true;
                    bookNowBtn.className = 'book-now-btn status-closed';
                    break;
                case 'cancelled':
                    bookNowBtn.textContent = 'Cancelled';
                    bookNowBtn.disabled = true;
                    bookNowBtn.className = 'book-now-btn status-cancelled';
                    break;
                case 'pending':
                    bookNowBtn.textContent = 'Pending';
                    bookNowBtn.disabled = true;
                    bookNowBtn.className = 'book-now-btn status-pending';
                    break;
                default:
                    bookNowBtn.textContent = 'Book Now';
                    bookNowBtn.disabled = false;
                    bookNowBtn.className = 'book-now-btn status-active';
            }
        }
    }

    // Form handling methods
    handleFormSubmit(e) {
        console.log('Form submit event triggered');
        e.preventDefault();
        this.handleSave();
    }

    handleSave() {
        console.log('handleSave called');
        
        // Update current class data from form before saving
        this.updatePreview();
        
        console.log('Current class data after update:', this.currentClass);
        
        // Validate required fields
        const requiredFields = ['activityType', 'className', 'description'];
        const missingFields = requiredFields.filter(field => {
            const element = document.getElementById(field);
            return !element || !element.value.trim();
        });

        console.log('Missing fields:', missingFields);

        if (missingFields.length > 0) {
            this.showMessage(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
            return;
        }

        // Validate time slots
        if (!this.currentClass.timeSlots || this.currentClass.timeSlots.length === 0) {
            this.showMessage('Please add at least one time slot', 'error');
            return;
        }

        // Prepare class data
        const classData = {
            activityType: this.currentClass.activityType,
            className: this.currentClass.className,
            description: this.currentClass.description,
            image: this.currentClass.image || 'https://via.placeholder.com/400x200/667eea/ffffff?text=Activity+Image',
            timeSlots: this.currentClass.timeSlots,
            capacity: Math.max(...this.currentClass.timeSlots.map(slot => slot.capacity)),
            duration: this.currentClass.timeSlots[0]?.duration || 120
        };

        try {
            console.log('Saving activity data:', classData);
            console.log('Is edit mode:', this.isEditMode);
            console.log('Editing activity ID:', this.editingActivityId);
            
            if (this.isEditMode) {
                // Update existing activity
                console.log('Updating existing activity...');
                const updatedActivity = window.sharedDataManager.updateActivity(this.editingActivityId, classData);
                if (updatedActivity) {
                    console.log('Activity updated successfully:', updatedActivity);
                    this.showMessage('Activity updated successfully!', 'success');
                    // Clear edit mode and redirect to dashboard
                    window.sharedDataManager.clearEditingActivity();
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1500);
                } else {
                    console.error('Failed to update activity');
                    this.showMessage('Error updating activity', 'error');
                }
            } else {
                // Add new activity
                console.log('Adding new activity...');
                const newActivity = window.sharedDataManager.addActivity(classData);
                console.log('New activity created:', newActivity);
                this.showMessage('Activity created successfully!', 'success');
                // Redirect to dashboard after creating new activity
                setTimeout(() => {
                    console.log('Redirecting to dashboard...');
                    window.location.href = 'admin-dashboard.html';
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            this.showMessage('Error saving activity: ' + error.message, 'error');
        }
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            if (this.isEditMode) {
                // Clear edit mode and redirect to dashboard
                window.sharedDataManager.clearEditingActivity();
                window.location.href = 'admin-dashboard.html';
            } else {
                this.resetForm();
            }
        }
    }

    resetForm() {
        document.getElementById('classForm').reset();
        this.currentClass = {
            activityType: '',
            className: '',
            description: '',
            image: null,
            timeSlots: []
        };
        this.selectedTimeSlot = null;
        this.updatePreview();
        this.updateClassInfoTimeSlots();
        this.updateUploadArea(null);
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

// Initialize the admin class manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.adminClassManager = new AdminClassManager();
});
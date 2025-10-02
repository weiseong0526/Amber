class BookingManager {
    constructor() {
        this.activities = [];
        this.bookings = [];
        this.editHistory = [];
        this.notifications = [];
        this.currentFilters = {
            activity: '',
            status: '',
            date: ''
        };
        this.searchQuery = '';
        this.activitySelectedDateTime = {};
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderActivities();
        this.updateStats();
        this.updateSummaryStats();
    }

    loadData() {
        // Load activities from shared data manager (created by admin-create-class.html)
        this.activities = window.sharedDataManager.getAllActivities().map(activity => ({
            id: activity.id.toString(),
            name: activity.name,
            description: activity.description,
            capacity: activity.capacity,
            duration: activity.duration,
            image: activity.image,
            status: activity.status,
            type: activity.type,
            // Convert timeSlots to the format expected by booking management
            timeSlots: activity.timeSlots || activity.times.map(time => ({
                date: time.date.split(' ')[0],
                time: time.date.split(' ')[1],
                capacity: time.capacity || activity.capacity,
                status: time.available ? 'active' : 'closed'
            })),
            // Set the first time slot as the main activity date/time for compatibility
            date: activity.timeSlots && activity.timeSlots.length > 0 ? activity.timeSlots[0].date : 
                  (activity.times && activity.times.length > 0 ? activity.times[0].date.split(' ')[0] : ''),
            time: activity.timeSlots && activity.timeSlots.length > 0 ? activity.timeSlots[0].time :
                  (activity.times && activity.times.length > 0 ? activity.times[0].date.split(' ')[1] : ''),
            group: activity.type || 'General'
        }));

        // Clear existing bookings - start fresh
        this.bookings = [];
        localStorage.removeItem('bookings');

        // Load edit history from localStorage
        const savedHistory = localStorage.getItem('editHistory');
        if (savedHistory) {
            this.editHistory = JSON.parse(savedHistory);
        }

        // Load notifications from localStorage
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
            this.notifications = JSON.parse(savedNotifications);
        }

        // If no activities exist, create some sample data
        if (this.activities.length === 0) {
            this.createSampleData();
        }
    }

    createSampleData() {
        // No sample data - start fresh
        this.activities = [];
        this.bookings = [];
        this.saveData();
    }

    saveData() {
        localStorage.setItem('activities', JSON.stringify(this.activities));
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
        localStorage.setItem('editHistory', JSON.stringify(this.editHistory));
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderActivities();
        });

        // Filter functionality
        const activityFilter = document.getElementById('activityFilter');
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');

        activityFilter.addEventListener('change', (e) => {
            this.currentFilters.activity = e.target.value;
            this.renderActivities();
        });

        statusFilter.addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.renderActivities();
        });

        dateFilter.addEventListener('change', (e) => {
            this.currentFilters.date = e.target.value;
            this.renderActivities();
        });

        clearFiltersBtn.addEventListener('click', () => {
            this.clearFilters();
        });

        // Modal functionality
        this.setupModalEventListeners();

        // Add activity button
        const addActivityBtn = document.getElementById('addActivityBtn');
        addActivityBtn.addEventListener('click', () => {
            window.location.href = 'admin-create-class.html';
        });

        // Create first activity button
        const createFirstActivityBtn = document.getElementById('createFirstActivityBtn');
        createFirstActivityBtn.addEventListener('click', () => {
            window.location.href = 'admin-create-class.html';
        });

        // Add a button to reset data for testing
        this.addResetButton();

    }




    getBookingCountForActivityDateTime(activityId, date, time) {
        return this.bookings.filter(booking => 
            booking.activityId === activityId &&
            booking.bookingDate === date && 
            booking.bookingTime === time && 
            booking.status === 'confirmed'
        ).length;
    }

    getTimeSlotCapacity(activityId, date, time) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return 0;
        
        // First check if this time slot exists in the activity's timeSlots
        if (activity.timeSlots) {
            const timeSlot = activity.timeSlots.find(slot => 
                slot.date === date && slot.time === time
            );
            if (timeSlot && timeSlot.capacity) {
                return timeSlot.capacity;
            }
        }
        
        // If not found in timeSlots, check if it's a booking-created slot
        // For now, give each time slot a different capacity based on time
        const timeHour = parseInt(time.split(':')[0]);
        if (timeHour < 12) {
            return Math.floor(activity.capacity * 0.8); // Morning slots: 80% of activity capacity
        } else if (timeHour < 18) {
            return Math.floor(activity.capacity * 1.2); // Afternoon slots: 120% of activity capacity
        } else {
            return Math.floor(activity.capacity * 0.6); // Evening slots: 60% of activity capacity
        }
    }

    getTimeSlotDuration(activityId, date, time) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return activity?.duration || 120;
        
        // First check if this time slot exists in the activity's timeSlots
        if (activity.timeSlots) {
            const timeSlot = activity.timeSlots.find(slot => 
                slot.date === date && slot.time === time
            );
            if (timeSlot && timeSlot.duration) {
                return timeSlot.duration;
            }
        }
        
        // If not found in timeSlots, give each time slot a different duration based on time
        const timeHour = parseInt(time.split(':')[0]);
        const baseDuration = activity.duration || 120;
        
        if (timeHour < 12) {
            return Math.floor(baseDuration * 0.8); // Morning slots: 80% of base duration
        } else if (timeHour < 18) {
            return Math.floor(baseDuration * 1.2); // Afternoon slots: 120% of base duration
        } else {
            return Math.floor(baseDuration * 0.6); // Evening slots: 60% of base duration
        }
    }

    generateActivityDateTimeOptions() {
        this.activities.forEach(activity => {
            const optionsContainer = document.getElementById(`activity-${activity.id}-datetime-options`);
            if (!optionsContainer) return;

            // Get unique date/time slots for this specific activity
            const activitySlots = this.getActivityDateTimeSlots(activity.id);
            
            optionsContainer.innerHTML = activitySlots.map(slot => {
                return `
                    <div class="activity-datetime-option" 
                         data-activity-id="${activity.id}" 
                         data-date="${slot.date}" 
                         data-time="${slot.time}">
                        ${slot.date} ${slot.time}
                    </div>
                `;
            }).join('');

            // Add click listeners to activity datetime options
            optionsContainer.querySelectorAll('.activity-datetime-option').forEach(option => {
                option.addEventListener('click', () => {
                    const activityId = option.dataset.activityId;
                    const date = option.dataset.date;
                    const time = option.dataset.time;
                    this.selectActivityDateTime(activityId, date, time);
                });
            });
        });
    }

    getActivityDateTimeSlots(activityId) {
        const slots = new Set();
        
        // Get the activity's time slots
        const activity = this.activities.find(a => a.id === activityId);
        if (activity) {
            // Add time slots from the activity
            if (activity.timeSlots && activity.timeSlots.length > 0) {
                activity.timeSlots.forEach(slot => {
                    slots.add(JSON.stringify({ 
                        date: slot.date, 
                        time: slot.time,
                        capacity: slot.capacity || activity.capacity // Use slot capacity or fallback to activity capacity
                    }));
                });
            } else if (activity.date && activity.time) {
                // Fallback to main activity date/time
                slots.add(JSON.stringify({ 
                    date: activity.date, 
                    time: activity.time,
                    capacity: activity.capacity
                }));
            }
        }
        
        // Get slots from bookings for this activity
        this.bookings.forEach(booking => {
            if (booking.activityId === activityId && booking.bookingDate && booking.bookingTime) {
                slots.add(JSON.stringify({ 
                    date: booking.bookingDate, 
                    time: booking.bookingTime,
                    capacity: activity.capacity // Default capacity for booking-created slots
                }));
            }
        });
        
        return Array.from(slots).map(slot => JSON.parse(slot));
    }

    selectActivityDateTime(activityId, date, time) {
        // Store selected datetime for this activity
        if (!this.activitySelectedDateTime) {
            this.activitySelectedDateTime = {};
        }
        this.activitySelectedDateTime[activityId] = { date, time };
        
        
        // Update UI
        this.updateActivityDateTimeSelectorUI(activityId);
        this.renderActivityBookings(activityId);
    }

    updateActivityDateTimeSelectorUI(activityId) {
        const optionsContainer = document.getElementById(`activity-${activityId}-datetime-options`);
        if (!optionsContainer) return;

        // Remove selected class from all options for this activity
        optionsContainer.querySelectorAll('.activity-datetime-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selected class to matching option
        const selectedDateTime = this.activitySelectedDateTime?.[activityId];
        if (selectedDateTime) {
            const selectedOption = optionsContainer.querySelector(
                `[data-date="${selectedDateTime.date}"][data-time="${selectedDateTime.time}"]`
            );
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
        }
    }

    renderActivityBookings(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;

        // Get bookings for this activity
        const allActivityBookings = this.bookings.filter(booking => 
            booking.activityId === activityId && booking.status === 'confirmed'
        );
        
        // Filter by selected date/time if any
        const selectedDateTime = this.activitySelectedDateTime?.[activityId];
        let activityBookings = allActivityBookings;
        
        if (selectedDateTime) {
            activityBookings = allActivityBookings.filter(booking => 
                booking.bookingDate === selectedDateTime.date && 
                booking.bookingTime === selectedDateTime.time
            );
        }

        // Get the capacity for the specific time slot
        let timeSlotCapacity = activity.capacity;
        if (selectedDateTime) {
            timeSlotCapacity = this.getTimeSlotCapacity(activityId, selectedDateTime.date, selectedDateTime.time);
        }

        // Update the bookings display for this activity
        const activityCard = document.querySelector(`[data-activity-id="${activityId}"]`);
        if (!activityCard) return;

        const bookingsTableContainer = activityCard.querySelector('.bookings-table-container');
        const bookingsCount = activityCard.querySelector('.bookings-count');
        const capacityInfo = activityCard.querySelector('.capacity-info');
        
        if (bookingsTableContainer) {
            bookingsTableContainer.innerHTML = `
                <table class="bookings-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Date & Time</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(selectedDateTime ? activityBookings : allActivityBookings).length > 0 ? (selectedDateTime ? activityBookings : allActivityBookings).map(booking => `
                            <tr>
                                <td class="customer-name">${booking.customerName}</td>
                                <td class="customer-contact">${booking.customerEmail}</td>
                                <td class="booking-datetime">${booking.bookingDate ? this.formatDate(booking.bookingDate) : 'N/A'} ${booking.bookingTime ? this.formatTime(booking.bookingTime) : ''}</td>
                                <td class="booking-actions">
                                    <button class="btn-edit" onclick="bookingManager.openEditBookingModal('${booking.id}')">
                                        Edit
                                    </button>
                                    <button class="btn-delete" onclick="bookingManager.deleteBooking('${booking.id}')">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="4" class="empty-bookings-row">
                                    <div class="empty-bookings">
                                        <p>${selectedDateTime ? 'No bookings for selected time slot' : 'Select a date & time to view bookings'}</p>
                                    </div>
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            `;
        }
        
        if (bookingsCount) {
            if (selectedDateTime) {
                bookingsCount.textContent = `${activityBookings.length} confirmed for ${selectedDateTime.date} ${selectedDateTime.time}`;
            } else {
                bookingsCount.textContent = `${allActivityBookings.length} total confirmed`;
            }
        }
        
        if (capacityInfo) {
            if (selectedDateTime) {
                const occupancyRate = Math.round((activityBookings.length / timeSlotCapacity) * 100);
                capacityInfo.textContent = `${activityBookings.length}/${timeSlotCapacity} (${occupancyRate}%)`;
            } else {
                const totalOccupancyRate = Math.round((allActivityBookings.length / activity.capacity) * 100);
                capacityInfo.textContent = `${allActivityBookings.length}/${activity.capacity} (${totalOccupancyRate}%)`;
            }
        }
        
        // Update the activity stats in the header
        const activityStats = activityCard.querySelector('.activity-stats .stat-item:first-child span');
        const durationStats = activityCard.querySelector('.activity-stats .stat-item:last-child span');
        
        if (activityStats) {
            if (selectedDateTime) {
                const occupancyRate = Math.round((activityBookings.length / timeSlotCapacity) * 100);
                activityStats.textContent = `${activityBookings.length}/${timeSlotCapacity} (${occupancyRate}%)`;
            } else {
                const totalOccupancyRate = Math.round((allActivityBookings.length / activity.capacity) * 100);
                activityStats.textContent = `${allActivityBookings.length}/${activity.capacity} (${totalOccupancyRate}%)`;
            }
        }
        
        if (durationStats) {
            if (selectedDateTime) {
                const timeSlotDuration = this.getTimeSlotDuration(activityId, selectedDateTime.date, selectedDateTime.time);
                durationStats.textContent = `${timeSlotDuration}min`;
            } else {
                durationStats.textContent = `${activity.duration || 120}min`;
            }
        }
    }


    setupModalEventListeners() {
        // Add Booking Modal
        const addBookingModal = document.getElementById('addBookingModal');
        const closeAddBookingModal = document.getElementById('closeAddBookingModal');
        const cancelAddBooking = document.getElementById('cancelAddBooking');
        const addBookingForm = document.getElementById('addBookingForm');

        closeAddBookingModal.addEventListener('click', () => {
            this.closeModal('addBookingModal');
        });

        cancelAddBooking.addEventListener('click', () => {
            this.closeModal('addBookingModal');
        });

        addBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddBooking();
        });

        // Also handle form submission when clicking the submit button
        const addBookingSubmitBtn = addBookingForm.querySelector('button[type="submit"]');
        if (addBookingSubmitBtn) {
            addBookingSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAddBooking();
            });
        }

        // Edit Booking Modal
        const editBookingModal = document.getElementById('editBookingModal');
        const closeEditBookingModal = document.getElementById('closeEditBookingModal');
        const cancelEditBooking = document.getElementById('cancelEditBooking');
        const editBookingForm = document.getElementById('editBookingForm');

        closeEditBookingModal.addEventListener('click', () => {
            this.closeModal('editBookingModal');
        });

        cancelEditBooking.addEventListener('click', () => {
            this.closeModal('editBookingModal');
        });

        editBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditBooking();
        });

        // Edit Activity Modal
        const editActivityModal = document.getElementById('editActivityModal');
        const closeEditActivityModal = document.getElementById('closeEditActivityModal');
        const cancelEditActivity = document.getElementById('cancelEditActivity');
        const editActivityForm = document.getElementById('editActivityForm');

        closeEditActivityModal.addEventListener('click', () => {
            this.closeModal('editActivityModal');
        });

        cancelEditActivity.addEventListener('click', () => {
            this.closeModal('editActivityModal');
        });

        editActivityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditActivity();
        });

        // Close modals when clicking outside
        [addBookingModal, editBookingModal, editActivityModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    renderActivities() {
        const grid = document.getElementById('activitiesGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (this.activities.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        const filteredActivities = this.getFilteredActivities();
        
        if (filteredActivities.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; display: block;">
                    <i class="fas fa-search"></i>
                    <h3>No Activities Found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredActivities.map(activity => {
            // Get the selected date/time for this specific activity
            const selectedDateTime = this.activitySelectedDateTime?.[activity.id];
            
            let activityBookings = this.bookings.filter(booking => 
                booking.activityId === activity.id && booking.status === 'confirmed'
            );
            
            // If a specific date/time is selected for this activity, filter bookings by that date/time
            if (selectedDateTime) {
                activityBookings = activityBookings.filter(booking => 
                    booking.bookingDate === selectedDateTime.date && 
                    booking.bookingTime === selectedDateTime.time
                );
            }
            
            // Calculate occupancy rate based on the selected time slot capacity
            let timeSlotCapacity = activity.capacity;
            if (selectedDateTime) {
                timeSlotCapacity = this.getTimeSlotCapacity(activity.id, selectedDateTime.date, selectedDateTime.time);
            }
            
            // Show capacity for selected time slot or total activity capacity
            let capacityDisplay, occupancyRate, durationDisplay;
            
            if (selectedDateTime) {
                // Show capacity and duration for the selected time slot
                capacityDisplay = `${activityBookings.length}/${timeSlotCapacity}`;
                occupancyRate = Math.round((activityBookings.length / timeSlotCapacity) * 100);
                durationDisplay = this.getTimeSlotDuration(activity.id, selectedDateTime.date, selectedDateTime.time);
            } else {
                // Show total activity capacity and duration when no time slot selected
                const totalBookings = this.bookings.filter(booking => 
                    booking.activityId === activity.id && booking.status === 'confirmed'
                ).length;
                capacityDisplay = `${totalBookings}/${activity.capacity}`;
                occupancyRate = Math.round((totalBookings / activity.capacity) * 100);
                durationDisplay = activity.duration || 120;
            }
            
            return `
                <div class="activity-card" data-activity-id="${activity.id}">
                    <div class="activity-image">
                        <img src="${activity.image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}" alt="${activity.name}" />
                    </div>
                    <div class="activity-content">
                        <h3 class="activity-title">${activity.name}</h3>
                        <div class="activity-stats">
                            <div class="stat-item">
                                <i class="fas fa-users"></i>
                                <span>${capacityDisplay} (${occupancyRate}%)</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-clock"></i>
                                <span>${durationDisplay}min</span>
                            </div>
                            </div>
                        </div>
                    
                    <div class="activity-body">
                        <!-- Date/Time Selector for this activity -->
                        <div class="activity-datetime-selector">
                            <div class="activity-datetime-header">
                                <h4>Select Date & Time:</h4>
                            </div>
                            <div class="activity-datetime-options" id="activity-${activity.id}-datetime-options">
                                <!-- Date/Time options will be populated here -->
                        </div>
                    </div>
                    
                        <div class="bookings-section">
                            <div class="bookings-header">
                                <h4 class="bookings-title">Bookings</h4>
                                <span class="bookings-count">${activityBookings.length} confirmed</span>
                            </div>
                            
                                <div class="bookings-table-container">
                                    <table class="bookings-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Contact</th>
                                            <th>Date & Time</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        ${activityBookings.length > 0 ? activityBookings.map(booking => `
                                                <tr>
                                                    <td class="customer-name">${booking.customerName}</td>
                                                    <td class="customer-contact">${booking.customerEmail}</td>
                                                <td class="booking-datetime">${booking.bookingDate ? this.formatDate(booking.bookingDate) : 'N/A'} ${booking.bookingTime ? this.formatTime(booking.bookingTime) : ''}</td>
                                                    <td class="booking-actions">
                                                        <button class="btn-edit" onclick="bookingManager.openEditBookingModal('${booking.id}')">
                                                            Edit
                                                        </button>
                                                        <button class="btn-delete" onclick="bookingManager.deleteBooking('${booking.id}')">
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                        `).join('') : `
                                            <tr>
                                                <td colspan="4" class="empty-bookings-row">
                                <div class="empty-bookings">
                                    <p>No bookings yet</p>
                                </div>
                                                </td>
                                            </tr>
                            `}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <div class="activity-actions">
                            <button class="btn-add-booking" onclick="bookingManager.openAddBookingModal('${activity.id}')">
                                <i class="fas fa-plus"></i>
                                Add Booking
                            </button>
                            <div class="activity-management">
                                <button class="btn-edit-activity" onclick="bookingManager.openEditActivityModal('${activity.id}')">
                                    Edit Activity
                                </button>
                                <button class="btn-delete-activity" onclick="bookingManager.deleteActivity('${activity.id}')">
                                    Delete
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            `;
        }).join('');

        this.updateActivityFilter();
        
        // Generate date/time options for each activity
        setTimeout(() => {
            this.generateActivityDateTimeOptions();
        }, 100);
    }

    getFilteredActivities() {
        return this.activities.filter(activity => {
            // Search filter
            if (this.searchQuery) {
                const matchesSearch = activity.name.toLowerCase().includes(this.searchQuery) ||
                                    activity.group.toLowerCase().includes(this.searchQuery) ||
                                    this.bookings.some(booking => 
                                        booking.activityId === activity.id &&
                                        (booking.customerName.toLowerCase().includes(this.searchQuery) ||
                                         booking.customerEmail.toLowerCase().includes(this.searchQuery))
                                    );
                if (!matchesSearch) return false;
            }

            // Activity filter
            if (this.currentFilters.activity && activity.id !== this.currentFilters.activity) {
                return false;
            }

            // Status filter
            if (this.currentFilters.status) {
                const hasBookingWithStatus = this.bookings.some(booking => 
                    booking.activityId === activity.id && booking.status === this.currentFilters.status
                );
                if (!hasBookingWithStatus) return false;
            }

            // Date filter
            if (this.currentFilters.date) {
                const activityDate = new Date(activity.date);
                const today = new Date();
                
                switch (this.currentFilters.date) {
                    case 'today':
                        if (!this.isSameDay(activityDate, today)) return false;
                        break;
                    case 'week':
                        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                        if (activityDate < today || activityDate > weekFromNow) return false;
                        break;
                    case 'month':
                        const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                        if (activityDate < today || activityDate > monthFromNow) return false;
                        break;
                }
            }


            return true;
        });
    }

    updateActivityFilter() {
        const activityFilter = document.getElementById('activityFilter');
        const currentValue = activityFilter.value;
        
        activityFilter.innerHTML = '<option value="">All Activities</option>' +
            this.activities.map(activity => 
                `<option value="${activity.id}">${activity.name}</option>`
            ).join('');
        
        activityFilter.value = currentValue;
    }

    clearFilters() {
        this.searchQuery = '';
        this.currentFilters = { activity: '', status: '', date: '' };
        this.activitySelectedDateTime = {};
        
        document.getElementById('searchInput').value = '';
        document.getElementById('activityFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFilter').value = '';
        
        // Clear selected datetime UI
        document.querySelectorAll('.activity-datetime-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        this.renderActivities();
    }

    updateStats() {
        const totalBookings = this.bookings.filter(booking => booking.status === 'confirmed').length;
        const totalCustomers = new Set(this.bookings.map(booking => booking.customerEmail)).size;
        const totalActivities = this.activities.length;
        
        const totalCapacity = this.activities.reduce((sum, activity) => sum + activity.capacity, 0);
        const occupancyRate = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;

        document.getElementById('totalBookings').textContent = totalBookings;
        document.getElementById('totalCustomers').textContent = totalCustomers;
        document.getElementById('totalActivities').textContent = totalActivities;
        document.getElementById('occupancyRate').textContent = `${occupancyRate}%`;
    }

    // Modal functions
    openAddBookingModal(activityId) {
        // Set the activity ID in the hidden input
        const activityIdInput = document.getElementById('selectedActivityId');
        if (activityIdInput) {
            activityIdInput.value = activityId;
        }
        
        // Clear the form
        const form = document.getElementById('addBookingForm');
        if (form) {
            form.reset();
            // Reset the activity ID after clearing
            activityIdInput.value = activityId;
        }
        
        // Show the modal
        this.showModal('addBookingModal');
        
        // Focus on the first input
        const firstInput = document.getElementById('customerName');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }


    openEditBookingModal(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        document.getElementById('editBookingId').value = booking.id;
        document.getElementById('editActivityId').value = booking.activityId;
        document.getElementById('editCustomerName').value = booking.customerName;
        document.getElementById('editCustomerEmail').value = booking.customerEmail;
        document.getElementById('editCustomerPhone').value = booking.customerPhone;
        document.getElementById('editBookingDate').value = booking.bookingDate ? booking.bookingDate.split('T')[0] : '';
        document.getElementById('editBookingTime').value = booking.bookingTime || '';
        document.getElementById('editBookingStatus').value = booking.status;

        this.showModal('editBookingModal');
    }

    openEditActivityModal(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;

        document.getElementById('editActivityId').value = activity.id;
        document.getElementById('editActivityName').value = activity.name;
        document.getElementById('editActivityDate').value = activity.date;
        document.getElementById('editActivityTime').value = activity.time;
        document.getElementById('editActivityCapacity').value = activity.capacity;
        document.getElementById('editActivityGroup').value = activity.group;

        this.showModal('editActivityModal');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        
        // Clear selected date/time display if closing add booking modal
        if (modalId === 'addBookingModal') {
            const dateTimeDisplay = document.getElementById('selectedDateTimeDisplay');
            if (dateTimeDisplay) {
                dateTimeDisplay.remove();
            }
        }
    }

    // Form handlers
    handleAddBooking() {
        console.log('Add booking function called');
        const form = document.getElementById('addBookingForm');
        const formData = new FormData(form);
        
        // Get form values
        const activityId = formData.get('selectedActivityId') || document.getElementById('selectedActivityId').value;
        const customerName = formData.get('customerName') || document.getElementById('customerName').value;
        const customerEmail = formData.get('customerEmail') || document.getElementById('customerEmail').value;
        const customerPhone = formData.get('customerPhone') || document.getElementById('customerPhone').value;
        const bookingStatus = formData.get('bookingStatus') || document.getElementById('bookingStatus').value;
        
        console.log('Form values:', { activityId, customerName, customerEmail, customerPhone, bookingStatus });

        // Validate required fields
        if (!activityId || !customerName || !customerEmail || !customerPhone || !bookingStatus) {
            this.showMessage('Please fill in all required fields!', 'error');
            return;
        }

        // Check if activity exists
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) {
            this.showMessage('Activity not found!', 'error');
            return;
        }

        // Get the selected date/time for this activity
        const selectedDateTime = this.activitySelectedDateTime?.[activityId];
        
        
        // Require a time slot selection before allowing booking
        if (!selectedDateTime) {
            this.showMessage('Please select a date and time slot before adding a booking!', 'error');
            return;
        }
        
        // Get the capacity for the specific time slot
        let timeSlotCapacity = this.getTimeSlotCapacity(activityId, selectedDateTime.date, selectedDateTime.time);
        
        // Check capacity for the specific date/time slot
        const currentBookings = this.bookings.filter(b => 
            b.activityId === activityId && 
            b.status === 'confirmed' &&
            b.bookingDate === selectedDateTime.date &&
            b.bookingTime === selectedDateTime.time
        ).length;
        
        if (currentBookings >= timeSlotCapacity) {
            this.showMessage(`This time slot is full! Capacity: ${timeSlotCapacity}`, 'error');
            return;
        }
        
        // Use the selected date/time
        const bookingDate = selectedDateTime.date;
        const bookingTime = selectedDateTime.time;


        // Create booking
        const booking = {
            id: Date.now().toString(),
            activityId: activityId,
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerPhone: customerPhone.trim(),
            bookingDate: bookingDate,
            bookingTime: bookingTime,
            status: bookingStatus,
            createdAt: new Date().toISOString()
        };

        // Add booking
        this.bookings.push(booking);
        
        // Add to history
        this.addToHistory('add_booking', {
            bookingId: booking.id,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            activityId: booking.activityId,
            status: booking.status
        });
        
        // Send notification to customer
        this.sendNotification(booking.customerEmail, 'add_booking', booking);
        
        // Save and update UI
        this.saveData();
        this.renderActivities();
        this.updateStats();
        this.updateSummaryStats();
        
        // Clear form and close modal
        form.reset();
        this.closeModal('addBookingModal');
        
        // Show success message with time slot info
        const timeSlotInfo = ` for ${this.formatDate(selectedDateTime.date)} at ${this.formatTime(selectedDateTime.time)}`;
        this.showMessage(`Booking added successfully${timeSlotInfo}! Customer has been notified.`, 'success');
    }

    handleEditBooking() {
        const formData = new FormData(document.getElementById('editBookingForm'));
        const bookingId = formData.get('editBookingId');
        
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
            const oldData = {
                customerName: booking.customerName,
                customerEmail: booking.customerEmail,
                customerPhone: booking.customerPhone,
                bookingDate: booking.bookingDate,
                bookingTime: booking.bookingTime,
                status: booking.status
            };
            
            booking.customerName = formData.get('customerName');
            booking.customerEmail = formData.get('customerEmail');
            booking.customerPhone = formData.get('customerPhone');
            booking.bookingDate = formData.get('bookingDate');
            booking.bookingTime = formData.get('bookingTime');
            booking.status = formData.get('bookingStatus');
            
            // Add to history
            this.addToHistory('edit_booking', {
                bookingId: booking.id,
                oldData: oldData,
                newData: {
                    customerName: booking.customerName,
                    customerEmail: booking.customerEmail,
                    customerPhone: booking.customerPhone,
                    bookingDate: booking.bookingDate,
                    bookingTime: booking.bookingTime,
                    status: booking.status
                },
                activityId: booking.activityId
            });
            
            // Send notification to customer
            this.sendNotification(booking.customerEmail, 'edit_booking', booking);
            
            this.saveData();
            this.renderActivities();
            this.updateStats();
            this.updateSummaryStats();
            this.closeModal('editBookingModal');
            this.showMessage('Booking updated successfully! Customer has been notified.', 'success');
        }
    }

    handleEditActivity() {
        const formData = new FormData(document.getElementById('editActivityForm'));
        const activityId = formData.get('editActivityId');
        
        const activity = this.activities.find(a => a.id === activityId);
        if (activity) {
            activity.name = formData.get('activityName');
            activity.date = formData.get('activityDate');
            activity.time = formData.get('activityTime');
            activity.capacity = parseInt(formData.get('activityCapacity'));
            activity.group = formData.get('activityGroup');
            
            this.saveData();
            this.renderActivities();
            this.updateStats();
            this.closeModal('editActivityModal');
            this.showMessage('Activity updated successfully!', 'success');
        }
    }

    deleteBooking(bookingId) {
        if (confirm('Are you sure you want to delete this booking? The customer will be notified of the cancellation.')) {
            const booking = this.bookings.find(b => b.id === bookingId);
            if (booking) {
                // Add to history
                this.addToHistory('delete_booking', {
                    bookingId: booking.id,
                    customerName: booking.customerName,
                    customerEmail: booking.customerEmail,
                    activityId: booking.activityId,
                    status: booking.status
                });
                
                // Send notification to customer
                this.sendNotification(booking.customerEmail, 'delete_booking', booking);
            }
            
            this.bookings = this.bookings.filter(b => b.id !== bookingId);
            this.saveData();
            this.renderActivities();
            this.updateStats();
            this.updateSummaryStats();
            this.showMessage('Booking deleted successfully! Customer has been notified of the cancellation.', 'success');
        }
    }

    deleteActivity(activityId) {
        if (confirm('Are you sure you want to delete this activity? This will also delete all associated bookings.')) {
            this.activities = this.activities.filter(a => a.id !== activityId);
            this.bookings = this.bookings.filter(b => b.activityId !== activityId);
            this.saveData();
            this.renderActivities();
            this.updateStats();
            this.showMessage('Activity deleted successfully!', 'success');
        }
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
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
        return `${displayHour}:${minutes} ${ampm}`;
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    addResetButton() {
        // Add a reset button for testing
        const headerActions = document.querySelector('.header-actions');
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-secondary';
        resetBtn.innerHTML = '<i class="fas fa-refresh"></i> Reset Data';
        resetBtn.style.marginLeft = '1rem';
        resetBtn.addEventListener('click', () => {
            if (confirm('This will clear all data and reload sample data. Continue?')) {
                localStorage.removeItem('activities');
                localStorage.removeItem('bookings');
                this.loadData();
                this.renderActivities();
                this.updateStats();
                this.showMessage('Data reset successfully!', 'success');
            }
        });
        headerActions.appendChild(resetBtn);
    }

    showMessage(message, type) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#10b981' : '#dc2626'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // History tracking functions
    addToHistory(action, details) {
        const historyEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: action, // 'add_booking', 'edit_booking', 'delete_booking', 'add_activity', 'edit_activity', 'delete_activity'
            details: details,
            admin: 'Admin User' // In real app, this would be the logged-in admin
        };
        
        this.editHistory.unshift(historyEntry); // Add to beginning
        this.saveData();
    }

    // Notification functions
    sendNotification(customerEmail, action, bookingDetails) {
        const notification = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            customerEmail: customerEmail,
            action: action,
            bookingDetails: bookingDetails,
            status: 'pending', // 'pending', 'sent', 'failed'
            message: this.generateNotificationMessage(action, bookingDetails)
        };
        
        this.notifications.push(notification);
        this.saveData();
        
        // In a real application, this would send an actual email
        console.log(`📧 Notification sent to ${customerEmail}:`, notification.message);
    }

    generateNotificationMessage(action, bookingDetails) {
        const activity = this.activities.find(a => a.id === bookingDetails.activityId);
        const activityName = activity ? activity.name : 'Unknown Activity';
        const activityDate = activity ? this.formatDate(activity.date) : 'Unknown Date';
        const activityTime = activity ? this.formatTime(activity.time) : 'Unknown Time';
        
        switch (action) {
            case 'add_booking':
                return `✅ Your booking for "${activityName}" on ${activityDate} at ${activityTime} has been confirmed!`;
            case 'edit_booking':
                return `📝 Your booking for "${activityName}" on ${activityDate} at ${activityTime} has been updated.`;
            case 'delete_booking':
                return `❌ Your booking for "${activityName}" on ${activityDate} at ${activityTime} has been cancelled. Please contact us if this was an error.`;
            case 'status_change':
                return `🔄 Your booking status for "${activityName}" on ${activityDate} at ${activityTime} has been changed to ${bookingDetails.status}.`;
            default:
                return `📋 Update regarding your booking for "${activityName}" on ${activityDate} at ${activityTime}.`;
        }
    }

    // History display helper functions
    getActivityHistory(activityId) {
        return this.editHistory.filter(history => 
            history.details.activityId === activityId
        );
    }

    getHistoryIcon(action) {
        switch (action) {
            case 'add_booking': return 'history-add';
            case 'edit_booking': return 'history-edit';
            case 'delete_booking': return 'history-delete';
            case 'add_activity': return 'history-add';
            case 'edit_activity': return 'history-edit';
            case 'delete_activity': return 'history-delete';
            default: return 'history-default';
        }
    }

    getHistoryIconClass(action) {
        switch (action) {
            case 'add_booking': return 'fa-plus-circle';
            case 'edit_booking': return 'fa-edit';
            case 'delete_booking': return 'fa-trash';
            case 'add_activity': return 'fa-plus-circle';
            case 'edit_activity': return 'fa-edit';
            case 'delete_activity': return 'fa-trash';
            default: return 'fa-info-circle';
        }
    }

    getHistoryActionText(action) {
        switch (action) {
            case 'add_booking': return 'Booking Added';
            case 'edit_booking': return 'Booking Edited';
            case 'delete_booking': return 'Booking Deleted';
            case 'add_activity': return 'Activity Added';
            case 'edit_activity': return 'Activity Edited';
            case 'delete_activity': return 'Activity Deleted';
            default: return 'Action Performed';
        }
    }

    getHistoryDetails(history) {
        switch (history.action) {
            case 'add_booking':
                return `Added ${history.details.customerName} (${history.details.customerEmail})`;
            case 'edit_booking':
                return `Updated ${history.details.newData.customerName} (${history.details.newData.customerEmail})`;
            case 'delete_booking':
                return `Removed ${history.details.customerName} (${history.details.customerEmail})`;
            case 'add_activity':
                return `Created new activity`;
            case 'edit_activity':
                return `Updated activity details`;
            case 'delete_activity':
                return `Removed activity`;
            default:
                return 'Action performed';
        }
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    openHistoryModal(activityId) {
        // This would open a modal showing full history for the activity
        const activity = this.activities.find(a => a.id === activityId);
        const history = this.getActivityHistory(activityId);
        
        alert(`Full history for ${activity ? activity.name : 'Activity'}:\n\n` + 
              history.map(h => `${this.getHistoryActionText(h.action)} - ${this.getHistoryDetails(h)} (${this.formatTimeAgo(h.timestamp)})`).join('\n'));
    }

    // Recent Changes Dashboard Functions
    renderRecentChangesDashboard() {
        this.updateHistoryStats();
        this.updateSummaryStats();
        this.renderRecentChangesList();
    }

    toggleRecentChanges() {
        const dashboard = document.getElementById('recentChangesDashboard');
        const toggleIcon = document.getElementById('toggleIcon');
        
        if (dashboard.style.display === 'none') {
            // Show dashboard
            dashboard.style.display = 'block';
            toggleIcon.classList.add('rotated');
            this.renderRecentChangesDashboard();
        } else {
            // Hide dashboard
            dashboard.style.display = 'none';
            toggleIcon.classList.remove('rotated');
        }
    }

    updateSummaryStats() {
        const totalChanges = this.editHistory.length;
        const today = new Date().toDateString();
        const todayChanges = this.editHistory.filter(history => 
            new Date(history.timestamp).toDateString() === today
        ).length;
        const pendingNotifications = this.notifications.filter(notification => 
            notification.status === 'pending'
        ).length;

        document.getElementById('totalChangesSummary').textContent = totalChanges;
        document.getElementById('todayChangesSummary').textContent = todayChanges;
        document.getElementById('pendingNotificationsSummary').textContent = pendingNotifications;
    }

    updateHistoryStats() {
        const totalChanges = this.editHistory.length;
        const today = new Date().toDateString();
        const todayChanges = this.editHistory.filter(history => 
            new Date(history.timestamp).toDateString() === today
        ).length;
        const pendingNotifications = this.notifications.filter(notification => 
            notification.status === 'pending'
        ).length;

        document.getElementById('totalChanges').textContent = totalChanges;
        document.getElementById('todayChanges').textContent = todayChanges;
        document.getElementById('pendingNotifications').textContent = pendingNotifications;
    }

    renderRecentChangesList() {
        const container = document.getElementById('recentChangesList');
        const recentHistory = this.editHistory.slice(0, 10); // Show last 10 changes

        if (recentHistory.length === 0) {
            container.innerHTML = `
                <div class="no-recent-changes">
                    <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 1rem; color: #d1d5db;"></i>
                    <p>No recent changes</p>
                    <p style="font-size: 0.75rem; margin-top: 0.5rem;">Changes will appear here as you manage bookings</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentHistory.map(history => {
            const activity = this.activities.find(a => a.id === history.details.activityId);
            const activityName = activity ? activity.name : 'Unknown Activity';
            
            return `
                <div class="dashboard-history-item">
                    <div class="dashboard-history-icon ${this.getHistoryIcon(history.action)}">
                        <i class="fas ${this.getHistoryIconClass(history.action)}"></i>
                    </div>
                    <div class="dashboard-history-content">
                        <div class="dashboard-history-action">${this.getHistoryActionText(history.action)}</div>
                        <div class="dashboard-history-details">${this.getHistoryDetails(history)}</div>
                        <div class="dashboard-history-meta">
                            <div class="dashboard-history-time">
                                <i class="fas fa-clock"></i>
                                ${this.formatTimeAgo(history.timestamp)}
                            </div>
                            <div class="dashboard-history-activity">
                                <i class="fas fa-calendar"></i>
                                ${activityName}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    refreshHistory() {
        this.renderRecentChangesDashboard();
        this.showMessage('History refreshed!', 'success');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
            this.editHistory = [];
            this.notifications = [];
            this.saveData();
            this.renderRecentChangesDashboard();
            this.showMessage('History cleared successfully!', 'success');
        }
    }
}

// Initialize the booking manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.bookingManager = new BookingManager();
});

// Listen for storage changes to sync with activity creation
window.addEventListener('storage', (e) => {
    if (e.key === 'amber_activities_data' && window.bookingManager) {
        window.bookingManager.loadData();
        window.bookingManager.renderActivities();
        window.bookingManager.updateStats();
    }
});

// Also listen for custom events from shared data manager
window.addEventListener('activityUpdated', () => {
    if (window.bookingManager) {
        window.bookingManager.loadData();
        window.bookingManager.renderActivities();
        window.bookingManager.updateStats();
    }
});


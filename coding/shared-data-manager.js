// Shared Data Manager for Admin Dashboard and Create Class Pages
class SharedDataManager {
    constructor() {
        this.storageKey = 'amber_activities_data';
        this.activities = this.loadFromStorage();
    }

    // Load data from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.getDefaultData();
        } catch (error) {
            console.error('Error loading data from storage:', error);
            return this.getDefaultData();
        }
    }

    // Save data to localStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.activities));
            return true;
        } catch (error) {
            console.error('Error saving data to storage:', error);
            return false;
        }
    }

    // Get default sample data
    getDefaultData() {
        return [
            {
                id: 1,
                name: 'Yoga - effefefe',
                description: 'effefe',
                capacity: 8,
                currentBookings: 0,
                duration: 120,
                image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                times: [
                    { date: '2025-09-16 18:32', available: true },
                    { date: '2025-10-02 18:33', available: true },
                    { date: '2025-09-18 18:33', available: false, selected: true }
                ],
                status: 'active',
                type: 'yoga',
                activityType: 'yoga',
                className: 'Yoga - effefefe',
                timeSlots: [
                    {
                        date: '2025-09-16',
                        time: '18:32',
                        capacity: 8,
                        price: 0,
                        duration: 120,
                        status: 'active'
                    },
                    {
                        date: '2025-10-02',
                        time: '18:33',
                        capacity: 8,
                        price: 0,
                        duration: 120,
                        status: 'active'
                    },
                    {
                        date: '2025-09-18',
                        time: '18:33',
                        capacity: 8,
                        price: 0,
                        duration: 120,
                        status: 'closed'
                    }
                ]
            },
            {
                id: 2,
                name: 'Yoga - effefefe',
                description: 'effefe',
                capacity: 8,
                currentBookings: 0,
                duration: 120,
                image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                times: [
                    { date: '2025-09-16 18:32', available: true },
                    { date: '2025-10-02 18:33', available: true },
                    { date: '2025-09-18 18:33', available: false, selected: true }
                ],
                status: 'active',
                type: 'yoga',
                activityType: 'yoga',
                className: 'Yoga - effefefe',
                timeSlots: [
                    {
                        date: '2025-09-16',
                        time: '18:32',
                        capacity: 8,
                        price: 0,
                        duration: 120,
                        status: 'active'
                    },
                    {
                        date: '2025-10-02',
                        time: '18:33',
                        capacity: 8,
                        price: 0,
                        duration: 120,
                        status: 'active'
                    },
                    {
                        date: '2025-09-18',
                        time: '18:33',
                        capacity: 8,
                        price: 0,
                        duration: 120,
                        status: 'closed'
                    }
                ]
            }
        ];
    }

    // Get all activities
    getAllActivities() {
        return [...this.activities];
    }

    // Get activity by ID
    getActivityById(id) {
        return this.activities.find(activity => activity.id === parseInt(id));
    }

    // Add new activity
    addActivity(activityData) {
        try {
            console.log('Adding activity with data:', activityData);
            
            const newActivity = {
                id: Date.now(),
                ...activityData,
                currentBookings: 0,
                status: 'active',
                // Ensure both type and activityType are set for compatibility
                type: activityData.activityType,
                // Ensure image is stored as a string (data URL or regular URL)
                image: typeof activityData.image === 'string' ? activityData.image : 
                       (activityData.image ? 'https://via.placeholder.com/400x200/667eea/ffffff?text=Activity+Image' : 'https://via.placeholder.com/400x200/667eea/ffffff?text=Activity+Image'),
                times: activityData.timeSlots ? activityData.timeSlots.map(slot => ({
                    date: `${slot.date} ${slot.time}`,
                    available: slot.status === 'active',
                    selected: false,
                    capacity: slot.capacity || activityData.capacity,
                    duration: slot.duration || activityData.duration,
                    currentBookings: 0
                })) : []
            };
            
            console.log('Created new activity:', newActivity);
            
            this.activities.push(newActivity);
            console.log('Activities after adding:', this.activities);
            
            const saveResult = this.saveToStorage();
            console.log('Save to storage result:', saveResult);
            
            return newActivity;
        } catch (error) {
            console.error('Error in addActivity:', error);
            throw error;
        }
    }

    // Update existing activity
    updateActivity(id, activityData) {
        const index = this.activities.findIndex(activity => activity.id === parseInt(id));
        if (index !== -1) {
            this.activities[index] = {
                ...this.activities[index],
                ...activityData,
                // Ensure both type and activityType are set for compatibility
                type: activityData.activityType || this.activities[index].type,
                // Ensure image is stored as a string (data URL or regular URL)
                image: typeof activityData.image === 'string' ? activityData.image : 
                       (activityData.image ? this.activities[index].image : this.activities[index].image),
                times: activityData.timeSlots ? activityData.timeSlots.map(slot => ({
                    date: `${slot.date} ${slot.time}`,
                    available: slot.status === 'active',
                    selected: false,
                    capacity: slot.capacity || activityData.capacity,
                    duration: slot.duration || activityData.duration,
                    currentBookings: 0
                })) : this.activities[index].times
            };
            this.saveToStorage();
            return this.activities[index];
        }
        return null;
    }

    // Delete activity
    deleteActivity(id) {
        const index = this.activities.findIndex(activity => activity.id === parseInt(id));
        if (index !== -1) {
            this.activities.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // Get activity for editing (includes all form fields)
    getActivityForEdit(id) {
        const activity = this.getActivityById(id);
        if (!activity) return null;

        return {
            activityType: activity.activityType || activity.type || 'yoga',
            className: activity.className || activity.name,
            description: activity.description,
            image: activity.image,
            timeSlots: activity.timeSlots || activity.times.map(time => ({
                date: time.date.split(' ')[0],
                time: time.date.split(' ')[1],
                capacity: time.capacity || activity.capacity,
                price: 0,
                duration: time.duration || activity.duration,
                status: time.available ? 'active' : 'closed'
            }))
        };
    }

    // Convert activity for dashboard display
    getActivityForDashboard(activity) {
        return {
            id: activity.id,
            name: activity.className || activity.name,
            description: activity.description,
            capacity: activity.capacity,
            currentBookings: activity.currentBookings || 0,
            duration: activity.duration,
            image: activity.image,
            times: activity.times || activity.timeSlots.map(slot => ({
                date: `${slot.date} ${slot.time}`,
                available: slot.status === 'active',
                selected: false
            })),
            status: activity.status,
            type: activity.type || activity.activityType
        };
    }

    // Get dashboard activities
    getDashboardActivities() {
        return this.activities.map(activity => this.getActivityForDashboard(activity));
    }

    // Reset to default data
    resetData() {
        this.activities = this.getDefaultData();
        this.saveToStorage();
        return this.activities;
    }

    // Get statistics
    getStatistics() {
        const totalBookings = this.activities.reduce((sum, activity) => sum + (activity.currentBookings || 0), 0);
        const activeCustomers = new Set(this.activities.flatMap(a => a.bookings || [])).size;
        const activeActivities = this.activities.filter(a => a.status === 'active').length;
        const totalCapacity = this.activities.reduce((sum, a) => sum + a.capacity, 0);
        const occupancyRate = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;

        return {
            totalBookings,
            activeCustomers,
            activeActivities,
            occupancyRate
        };
    }

    // Set activity for editing (store in sessionStorage for edit mode)
    setActivityForEdit(activityId) {
        sessionStorage.setItem('editing_activity_id', activityId);
    }

    // Get activity being edited
    getEditingActivityId() {
        return sessionStorage.getItem('editing_activity_id');
    }

    // Clear editing activity
    clearEditingActivity() {
        sessionStorage.removeItem('editing_activity_id');
    }

    // Check if we're in edit mode
    isEditMode() {
        return !!this.getEditingActivityId();
    }
}

// Create global instance
window.sharedDataManager = new SharedDataManager();

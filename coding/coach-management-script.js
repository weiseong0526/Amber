class CoachManager {
    constructor() {
        this.coaches = [];
        this.selectedCoaches = new Set();
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderCoaches();
        this.updateStats();
    }

    loadData() {
        // Clear existing data to ensure fresh sample data loads
        localStorage.removeItem('coaches');
        
        const savedCoaches = localStorage.getItem('coaches');
        if (savedCoaches) {
            this.coaches = JSON.parse(savedCoaches);
        } else {
            this.createSampleData();
        }
    }

    createSampleData() {
        const sampleCoaches = [
            {
                id: '1',
                firstName: 'Ali',
                lastName: 'Kau',
                email: 'ali.kau@example.com',
                phone: '012-2345678',
                specialization: 'yoga',
                customSpecialization: '',
                status: 'active',
                bio: 'Experienced yoga instructor with 5+ years of teaching experience.'
            },
            {
                id: '2',
                firstName: 'Kau',
                lastName: 'Mahu',
                email: 'kau.mahu@example.com',
                phone: '013-9876543',
                specialization: 'weaving',
                customSpecialization: '',
                status: 'active',
                bio: 'Master weaver specializing in traditional techniques.'
            },
            {
                id: '3',
                firstName: 'Awk',
                lastName: 'Mahu',
                email: 'awk.mahu@example.com',
                phone: '014-5678901',
                specialization: 'yoga',
                customSpecialization: '',
                status: 'active',
                bio: 'Certified yoga instructor focused on beginner-friendly classes.'
            },
            {
                id: '4',
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'sarah.johnson@example.com',
                phone: '015-1234567',
                specialization: 'fitness',
                customSpecialization: '',
                status: 'inactive',
                bio: 'Personal trainer specializing in strength and conditioning.'
            },
            {
                id: '5',
                firstName: 'Michael',
                lastName: 'Chen',
                email: 'michael.chen@example.com',
                phone: '016-9876543',
                specialization: 'dance',
                customSpecialization: '',
                status: 'pending',
                bio: 'Professional dancer and choreographer with international experience.'
            },
            {
                id: '6',
                firstName: 'Emma',
                lastName: 'Wilson',
                email: 'emma.wilson@example.com',
                phone: '017-4567890',
                specialization: 'art',
                customSpecialization: '',
                status: 'active',
                bio: 'Visual artist and art therapy specialist.'
            },
            {
                id: '7',
                firstName: 'David',
                lastName: 'Brown',
                email: 'david.brown@example.com',
                phone: '018-2345678',
                specialization: 'other',
                customSpecialization: 'Meditation Coach',
                status: 'active',
                bio: 'Meditation and mindfulness coach with 10+ years experience.'
            }
        ];

        this.coaches = sampleCoaches;
        this.saveData();
    }

    saveData() {
        localStorage.setItem('coaches', JSON.stringify(this.coaches));
    }

    setupEventListeners() {
        // Custom specialization toggle
        const specializationSelect = document.getElementById('coachSpecialization');
        if (specializationSelect) {
            specializationSelect.addEventListener('change', () => this.toggleCustomSpecialization('add'));
        }
    }

    renderCoaches() {
        const tbody = document.getElementById('coachesTableBody');
        if (!tbody) return;

        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        let filteredCoaches = this.coaches.filter(coach => {
            const fullName = `${coach.firstName} ${coach.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm) || 
                                coach.email.toLowerCase().includes(searchTerm) ||
                                coach.phone.includes(searchTerm);
            
            const matchesCategory = !categoryFilter || coach.specialization === categoryFilter;
            const matchesStatus = !statusFilter || coach.status === statusFilter;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });

        tbody.innerHTML = filteredCoaches.map(coach => `
            <tr data-coach-id="${coach.id}">
                <td>
                    <input type="checkbox" class="coach-checkbox" value="${coach.id}" 
                           onchange="coachManager.toggleCoachSelection('${coach.id}')">
                </td>
                <td>${coach.firstName} ${coach.lastName}</td>
                <td>
                    <span class="specialization-badge">
                        ${this.getSpecializationDisplay(coach.specialization, coach.customSpecialization)}
                    </span>
                </td>
                <td>${coach.phone}</td>
                <td>${coach.email}</td>
                <td>
                    <span class="status-badge ${coach.status}">${coach.status}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="coachManager.openEditModal('${coach.id}')" title="Edit Coach">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="coachManager.deleteCoach('${coach.id}')" title="Delete Coach">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updateDeleteButton();
    }

    getSpecializationDisplay(specialization, customSpecialization) {
        const specializationMap = {
            'yoga': 'Yoga Coach',
            'weaving': 'Weaving Coach',
            'fitness': 'Fitness Coach',
            'dance': 'Dance Coach',
            'art': 'Art Coach',
            'other': customSpecialization || 'Other'
        };
        return specializationMap[specialization] || specialization;
    }

    updateStats() {
        const totalCoaches = this.coaches.length;
        const activeCoaches = this.coaches.filter(c => c.status === 'active').length;
        const inactiveCoaches = this.coaches.filter(c => c.status === 'inactive').length;
        const pendingCoaches = this.coaches.filter(c => c.status === 'pending').length;

        document.getElementById('totalCoaches').textContent = totalCoaches;
        document.getElementById('activeCoaches').textContent = activeCoaches;
        document.getElementById('inactiveCoaches').textContent = inactiveCoaches;
        document.getElementById('pendingCoaches').textContent = pendingCoaches;
    }

    // Modal Functions
    openAddCoachModal() {
        document.getElementById('addCoachModal').classList.add('show');
        document.getElementById('addCoachForm').reset();
        this.toggleCustomSpecialization('add');
    }

    openEditModal(coachId) {
        const coach = this.coaches.find(c => c.id === coachId);
        if (!coach) return;

        document.getElementById('editCoachId').value = coach.id;
        document.getElementById('editCoachFirstName').value = coach.firstName;
        document.getElementById('editCoachLastName').value = coach.lastName;
        document.getElementById('editCoachEmail').value = coach.email;
        document.getElementById('editCoachPhone').value = coach.phone;
        document.getElementById('editCoachSpecialization').value = coach.specialization;
        document.getElementById('editCoachStatus').value = coach.status;
        document.getElementById('editCoachBio').value = coach.bio || '';

        if (coach.specialization === 'other') {
            document.getElementById('editCustomSpecialization').value = coach.customSpecialization || '';
        }

        this.toggleCustomSpecialization('edit');
        document.getElementById('editCoachModal').classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    toggleCustomSpecialization(type) {
        const specializationSelect = document.getElementById(`${type}CoachSpecialization`);
        const customGroup = document.getElementById(`${type}CustomSpecializationGroup`);
        const customInput = document.getElementById(`${type}CustomSpecialization`);

        if (specializationSelect.value === 'other') {
            customGroup.style.display = 'block';
            customInput.required = true;
        } else {
            customGroup.style.display = 'none';
            customInput.required = false;
            customInput.value = '';
        }
    }

    // Form Handlers
    handleAddCoach(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const specialization = formData.get('specialization');
        const customSpecialization = formData.get('customSpecialization') || '';

        const coach = {
            id: Date.now().toString(),
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('phone').trim(),
            specialization: specialization,
            customSpecialization: specialization === 'other' ? customSpecialization : '',
            status: formData.get('status'),
            bio: formData.get('bio').trim()
        };

        // Validate required fields
        if (!coach.firstName || !coach.lastName || !coach.email || !coach.phone || !coach.specialization || !coach.status) {
            this.showMessage('Please fill in all required fields!', 'error');
            return;
        }

        if (coach.specialization === 'other' && !customSpecialization.trim()) {
            this.showMessage('Please enter a custom specialization!', 'error');
            return;
        }

        // Check for duplicate email
        if (this.coaches.some(c => c.email === coach.email)) {
            this.showMessage('A coach with this email already exists!', 'error');
            return;
        }

        this.coaches.push(coach);
        this.saveData();
        this.renderCoaches();
        this.updateStats();
        
        event.target.reset();
        this.closeModal('addCoachModal');
        this.showMessage('Coach added successfully!', 'success');
    }

    handleEditCoach(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const coachId = formData.get('coachId');
        const coach = this.coaches.find(c => c.id === coachId);
        const specialization = formData.get('specialization');
        const customSpecialization = formData.get('customSpecialization') || '';

        if (!coach) {
            this.showMessage('Coach not found!', 'error');
            return;
        }

        // Update coach data
        coach.firstName = formData.get('firstName').trim();
        coach.lastName = formData.get('lastName').trim();
        coach.email = formData.get('email').trim();
        coach.phone = formData.get('phone').trim();
        coach.specialization = specialization;
        coach.customSpecialization = specialization === 'other' ? customSpecialization : '';
        coach.status = formData.get('status');
        coach.bio = formData.get('bio').trim();

        // Validate required fields
        if (!coach.firstName || !coach.lastName || !coach.email || !coach.phone || !coach.specialization || !coach.status) {
            this.showMessage('Please fill in all required fields!', 'error');
            return;
        }

        if (coach.specialization === 'other' && !customSpecialization.trim()) {
            this.showMessage('Please enter a custom specialization!', 'error');
            return;
        }

        // Check for duplicate email (excluding current coach)
        if (this.coaches.some(c => c.email === coach.email && c.id !== coachId)) {
            this.showMessage('A coach with this email already exists!', 'error');
            return;
        }

        this.saveData();
        this.renderCoaches();
        this.updateStats();
        
        this.closeModal('editCoachModal');
        this.showMessage('Coach updated successfully!', 'success');
    }

    deleteCoach(coachId) {
        if (confirm('Are you sure you want to delete this coach?')) {
            this.coaches = this.coaches.filter(c => c.id !== coachId);
            this.selectedCoaches.delete(coachId);
            this.saveData();
            this.renderCoaches();
            this.updateStats();
            this.updateDeleteButton();
            this.showMessage('Coach deleted successfully!', 'success');
        }
    }

    // Selection Functions
    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const coachCheckboxes = document.querySelectorAll('.coach-checkbox');
        
        coachCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
            const coachId = checkbox.value;
            if (selectAllCheckbox.checked) {
                this.selectedCoaches.add(coachId);
            } else {
                this.selectedCoaches.delete(coachId);
            }
        });

        this.updateDeleteButton();
        this.updateRowSelection();
    }

    toggleCoachSelection(coachId) {
        const checkbox = document.querySelector(`input[value="${coachId}"]`);
        
        if (checkbox.checked) {
            this.selectedCoaches.add(coachId);
        } else {
            this.selectedCoaches.delete(coachId);
        }

        this.updateDeleteButton();
        this.updateRowSelection();
        this.updateSelectAllCheckbox();
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const coachCheckboxes = document.querySelectorAll('.coach-checkbox');
        const checkedCount = document.querySelectorAll('.coach-checkbox:checked').length;
        
        selectAllCheckbox.checked = checkedCount === coachCheckboxes.length;
        selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < coachCheckboxes.length;
    }

    updateRowSelection() {
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const coachId = row.dataset.coachId;
            if (this.selectedCoaches.has(coachId)) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        });
    }

    updateDeleteButton() {
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        deleteBtn.disabled = this.selectedCoaches.size === 0;
    }

    deleteSelectedCoaches() {
        if (this.selectedCoaches.size === 0) return;

        const count = this.selectedCoaches.size;
        if (confirm(`Are you sure you want to delete ${count} selected coach(es)?`)) {
            this.coaches = this.coaches.filter(c => !this.selectedCoaches.has(c.id));
            this.selectedCoaches.clear();
            this.saveData();
            this.renderCoaches();
            this.updateStats();
            this.updateDeleteButton();
            this.showMessage(`${count} coach(es) deleted successfully!`, 'success');
        }
    }

    // Search and Filter Functions
    searchCoaches() {
        this.renderCoaches();
    }

    filterCoaches() {
        this.renderCoaches();
    }

    exportData() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coaches-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully!', 'success');
    }

    generateCSV() {
        const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Specialization', 'Status', 'Bio'];
        const rows = this.coaches.map(coach => [
            coach.firstName,
            coach.lastName,
            coach.email,
            coach.phone,
            this.getSpecializationDisplay(coach.specialization, coach.customSpecialization),
            coach.status,
            coach.bio || ''
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// Initialize the coach manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.coachManager = new CoachManager();
});

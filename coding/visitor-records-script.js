class VisitorManager {
    constructor() {
        this.visitors = [];
        this.currentChartType = 'daily';
        this.visitorChart = null;
        this.sourcesChart = null;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderVisitors();
        this.updateStats();
        this.initCharts();
        this.setDefaultDate();
    }

    loadData() {
        // Clear existing data to ensure fresh sample data loads
        localStorage.removeItem('visitors');
        
        const savedVisitors = localStorage.getItem('visitors');
        if (savedVisitors) {
            this.visitors = JSON.parse(savedVisitors);
        } else {
            this.createSampleData();
        }
    }

    createSampleData() {
        const sampleVisitors = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                type: 'registered',
                source: 'website',
                visitDate: '2025-01-14',
                visitTime: '10:30',
                notes: 'Interested in yoga classes'
            },
            {
                id: '2',
                name: 'Alice Lee',
                email: 'alice@example.com',
                type: 'registered',
                source: 'social_media',
                visitDate: '2025-01-14',
                visitTime: '14:45',
                notes: 'Referred by friend'
            },
            {
                id: '3',
                name: 'Guest User',
                email: 'Unknown',
                type: 'unregistered',
                source: 'walk_in',
                visitDate: '2025-01-14',
                visitTime: '09:15',
                notes: 'Walked in to inquire about classes'
            },
            {
                id: '4',
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                type: 'registered',
                source: 'referral',
                visitDate: '2025-01-13',
                visitTime: '16:20',
                notes: 'Referred by existing member'
            },
            {
                id: '5',
                name: 'Guest User',
                email: 'Unknown',
                type: 'unregistered',
                source: 'event',
                visitDate: '2025-01-13',
                visitTime: '11:00',
                notes: 'Attended open house event'
            },
            {
                id: '6',
                name: 'Emma Wilson',
                email: 'emma@example.com',
                type: 'registered',
                source: 'website',
                visitDate: '2025-01-12',
                visitTime: '13:30',
                notes: 'Booked online for trial class'
            },
            {
                id: '7',
                name: 'Guest User',
                email: 'Unknown',
                type: 'unregistered',
                source: 'other',
                visitDate: '2025-01-12',
                visitTime: '15:45',
                notes: 'Found through local directory'
            },
            {
                id: '8',
                name: 'Lisa Garcia',
                email: 'lisa@example.com',
                type: 'registered',
                source: 'social_media',
                visitDate: '2025-01-11',
                visitTime: '10:00',
                notes: 'Saw Instagram ad'
            },
            {
                id: '9',
                name: 'Guest User',
                email: 'Unknown',
                type: 'unregistered',
                source: 'walk_in',
                visitDate: '2025-01-11',
                visitTime: '17:30',
                notes: 'Passing by, interested in membership'
            },
            {
                id: '10',
                name: 'Maria Rodriguez',
                email: 'maria@example.com',
                type: 'registered',
                source: 'referral',
                visitDate: '2025-01-10',
                visitTime: '12:15',
                notes: 'Referred by family member'
            }
        ];

        this.visitors = sampleVisitors;
        this.saveData();
    }

    saveData() {
        localStorage.setItem('visitors', JSON.stringify(this.visitors));
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.renderVisitors();
            });
        }
    }

    renderVisitors() {
        const tbody = document.getElementById('visitorTableBody');
        if (!tbody) return;

        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        const sourceFilter = document.getElementById('sourceFilter')?.value || '';
        const dateFilter = document.getElementById('dateFilter')?.value || '';

        let filteredVisitors = this.visitors.filter(visitor => {
            // Search filter
            const matchesSearch = visitor.name.toLowerCase().includes(searchTerm) ||
                                visitor.email.toLowerCase().includes(searchTerm);
            
            // Type filter
            const matchesType = !typeFilter || visitor.type === typeFilter;
            
            // Source filter
            const matchesSource = !sourceFilter || visitor.source === sourceFilter;
            
            // Date filter
            let matchesDate = true;
            if (dateFilter) {
                const visitDate = new Date(visitor.visitDate);
                const today = new Date();
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                
                switch (dateFilter) {
                    case 'today':
                        matchesDate = visitDate.toDateString() === new Date().toDateString();
                        break;
                    case 'week':
                        matchesDate = visitDate >= startOfWeek;
                        break;
                    case 'month':
                        matchesDate = visitDate >= startOfMonth;
                        break;
                }
            }
            
            return matchesSearch && matchesType && matchesSource && matchesDate;
        });

        tbody.innerHTML = filteredVisitors.map((visitor, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${visitor.name}</td>
                <td>${visitor.email}</td>
                <td><span class="visitor-type ${visitor.type}">${visitor.type}</span></td>
                <td>${this.formatDate(visitor.visitDate)}</td>
                <td>${this.formatTime(visitor.visitTime)}</td>
                <td><span class="visitor-source">${this.formatSource(visitor.source)}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="visitorManager.openEditModal('${visitor.id}')" title="Edit Visitor">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="visitorManager.deleteVisitor('${visitor.id}')" title="Delete Visitor">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const totalVisitors = this.visitors.length;
        const registeredVisitors = this.visitors.filter(v => v.type === 'registered').length;
        const unregisteredVisitors = this.visitors.filter(v => v.type === 'unregistered').length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayVisitors = this.visitors.filter(v => v.visitDate === today).length;

        document.getElementById('totalVisitors').textContent = totalVisitors;
        document.getElementById('registeredVisitors').textContent = registeredVisitors;
        document.getElementById('unregisteredVisitors').textContent = unregisteredVisitors;
        document.getElementById('todayVisitors').textContent = todayVisitors;
    }

    initCharts() {
        this.initVisitorChart();
        this.initSourcesChart();
    }

    initVisitorChart() {
        const ctx = document.getElementById('visitorChart');
        if (!ctx) return;

        this.visitorChart = new Chart(ctx, {
            type: 'bar',
            data: this.getVisitorChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    initSourcesChart() {
        const ctx = document.getElementById('sourcesChart');
        if (!ctx) return;

        this.sourcesChart = new Chart(ctx, {
            type: 'doughnut',
            data: this.getSourcesChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    getVisitorChartData() {
        if (this.currentChartType === 'daily') {
            return this.getDailyChartData();
        } else {
            return this.getMonthlyChartData();
        }
    }

    getDailyChartData() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];
        
        this.visitors.forEach(visitor => {
            const date = new Date(visitor.visitDate);
            const dayOfWeek = date.getDay();
            const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday to 6
            dayCounts[adjustedDay]++;
        });

        return {
            labels: days,
            datasets: [{
                data: dayCounts,
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#06b6d4',
                    '#84cc16'
                ],
                borderWidth: 0
            }]
        };
    }

    getMonthlyChartData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthCounts = new Array(12).fill(0);
        
        this.visitors.forEach(visitor => {
            const date = new Date(visitor.visitDate);
            const month = date.getMonth();
            monthCounts[month]++;
        });

        return {
            labels: months,
            datasets: [{
                data: monthCounts,
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#06b6d4',
                    '#84cc16',
                    '#f97316',
                    '#ec4899',
                    '#6366f1',
                    '#14b8a6',
                    '#a855f7'
                ],
                borderWidth: 0
            }]
        };
    }

    getSourcesChartData() {
        const sourceCounts = {};
        this.visitors.forEach(visitor => {
            sourceCounts[visitor.source] = (sourceCounts[visitor.source] || 0) + 1;
        });

        const sources = Object.keys(sourceCounts);
        const counts = Object.values(sourceCounts);
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

        return {
            labels: sources.map(source => this.formatSource(source)),
            datasets: [{
                data: counts,
                backgroundColor: colors.slice(0, sources.length),
                borderWidth: 0
            }]
        };
    }

    toggleChart(type) {
        this.currentChartType = type;
        
        // Update button states
        document.getElementById('dailyBtn').classList.toggle('active', type === 'daily');
        document.getElementById('monthlyBtn').classList.toggle('active', type === 'monthly');
        
        // Update chart data
        if (this.visitorChart) {
            this.visitorChart.data = this.getVisitorChartData();
            this.visitorChart.update();
        }
    }

    // Modal Functions
    openAddVisitorModal() {
        this.setDefaultDate();
        document.getElementById('addVisitorModal').classList.add('show');
    }

    openEditModal(visitorId) {
        const visitor = this.visitors.find(v => v.id === visitorId);
        if (!visitor) return;

        document.getElementById('editVisitorId').value = visitor.id;
        document.getElementById('editVisitorName').value = visitor.name;
        document.getElementById('editVisitorEmail').value = visitor.email;
        document.getElementById('editVisitorType').value = visitor.type;
        document.getElementById('editVisitorSource').value = visitor.source;
        document.getElementById('editVisitDate').value = visitor.visitDate;
        document.getElementById('editVisitTime').value = visitor.visitTime;
        document.getElementById('editVisitorNotes').value = visitor.notes || '';

        document.getElementById('editVisitorModal').classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
        
        document.getElementById('visitDate').value = today;
        document.getElementById('visitTime').value = timeString;
    }

    // Form Handlers
    handleAddVisitor(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const visitorType = formData.get('visitorType');
        
        const visitor = {
            id: Date.now().toString(),
            name: visitorType === 'unregistered' ? 'Guest User' : formData.get('visitorName').trim(),
            email: visitorType === 'unregistered' ? 'Unknown' : formData.get('visitorEmail').trim(),
            type: visitorType,
            source: formData.get('visitorSource'),
            visitDate: formData.get('visitDate'),
            visitTime: formData.get('visitTime'),
            notes: formData.get('visitorNotes').trim()
        };

        // Validate required fields (except name/email for unregistered visitors)
        if (visitorType === 'registered') {
            if (!formData.get('visitorName').trim() || !formData.get('visitorEmail').trim()) {
                this.showMessage('Please fill in name and email for registered visitors!', 'error');
                return;
            }
        }
        
        if (!visitor.type || !visitor.source || !visitor.visitDate || !visitor.visitTime) {
            this.showMessage('Please fill in all required fields!', 'error');
            return;
        }

        this.visitors.push(visitor);
        this.saveData();
        this.renderVisitors();
        this.updateStats();
        this.updateCharts();
        
        event.target.reset();
        this.closeModal('addVisitorModal');
        this.showMessage('Visitor added successfully!', 'success');
    }

    handleEditVisitor(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const visitorId = formData.get('visitorId');
        const visitor = this.visitors.find(v => v.id === visitorId);
        const visitorType = formData.get('visitorType');
        
        if (!visitor) {
            this.showMessage('Visitor not found!', 'error');
            return;
        }

        // Update visitor data
        visitor.name = visitorType === 'unregistered' ? 'Guest User' : formData.get('visitorName').trim();
        visitor.email = visitorType === 'unregistered' ? 'Unknown' : formData.get('visitorEmail').trim();
        visitor.type = visitorType;
        visitor.source = formData.get('visitorSource');
        visitor.visitDate = formData.get('visitDate');
        visitor.visitTime = formData.get('visitTime');
        visitor.notes = formData.get('visitorNotes').trim();

        // Validate required fields (except name/email for unregistered visitors)
        if (visitorType === 'registered') {
            if (!formData.get('visitorName').trim() || !formData.get('visitorEmail').trim()) {
                this.showMessage('Please fill in name and email for registered visitors!', 'error');
                return;
            }
        }
        
        if (!visitor.type || !visitor.source || !visitor.visitDate || !visitor.visitTime) {
            this.showMessage('Please fill in all required fields!', 'error');
            return;
        }

        this.saveData();
        this.renderVisitors();
        this.updateStats();
        this.updateCharts();
        
        this.closeModal('editVisitorModal');
        this.showMessage('Visitor updated successfully!', 'success');
    }

    deleteVisitor(visitorId) {
        if (confirm('Are you sure you want to delete this visitor record?')) {
            this.visitors = this.visitors.filter(v => v.id !== visitorId);
            this.saveData();
            this.renderVisitors();
            this.updateStats();
            this.updateCharts();
            this.showMessage('Visitor deleted successfully!', 'success');
        }
    }

    updateCharts() {
        if (this.visitorChart) {
            this.visitorChart.data = this.getVisitorChartData();
            this.visitorChart.update();
        }
        
        if (this.sourcesChart) {
            this.sourcesChart.data = this.getSourcesChartData();
            this.sourcesChart.update();
        }
    }

    exportData() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visitor-records-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully!', 'success');
    }

    resetData() {
        if (confirm('Are you sure you want to reset all visitor data? This action cannot be undone.')) {
            localStorage.removeItem('visitors');
            this.createSampleData();
            this.renderVisitors();
            this.updateStats();
            this.updateCharts();
            this.showMessage('Data reset successfully!', 'success');
        }
    }

    applyFilters() {
        this.renderVisitors();
    }

    clearFilters() {
        document.getElementById('typeFilter').value = '';
        document.getElementById('sourceFilter').value = '';
        document.getElementById('dateFilter').value = '';
        this.renderVisitors();
    }

    toggleVisitorFields() {
        const visitorType = document.getElementById('visitorType').value;
        const nameField = document.getElementById('visitorName');
        const emailField = document.getElementById('visitorEmail');
        
        if (visitorType === 'unregistered') {
            nameField.value = 'Guest User';
            emailField.value = 'Unknown';
            nameField.disabled = true;
            emailField.disabled = true;
            nameField.style.backgroundColor = '#f3f4f6';
            emailField.style.backgroundColor = '#f3f4f6';
        } else {
            nameField.value = '';
            emailField.value = '';
            nameField.disabled = false;
            emailField.disabled = false;
            nameField.style.backgroundColor = 'white';
            emailField.style.backgroundColor = 'white';
        }
    }

    toggleEditVisitorFields() {
        const visitorType = document.getElementById('editVisitorType').value;
        const nameField = document.getElementById('editVisitorName');
        const emailField = document.getElementById('editVisitorEmail');
        
        if (visitorType === 'unregistered') {
            nameField.value = 'Guest User';
            emailField.value = 'Unknown';
            nameField.disabled = true;
            emailField.disabled = true;
            nameField.style.backgroundColor = '#f3f4f6';
            emailField.style.backgroundColor = '#f3f4f6';
        } else {
            nameField.disabled = false;
            emailField.disabled = false;
            nameField.style.backgroundColor = 'white';
            emailField.style.backgroundColor = 'white';
        }
    }

    generateCSV() {
        const headers = ['Name', 'Email', 'Type', 'Source', 'Visit Date', 'Visit Time', 'Notes'];
        const rows = this.visitors.map(visitor => [
            visitor.name,
            visitor.email,
            visitor.type,
            this.formatSource(visitor.source),
            this.formatDate(visitor.visitDate),
            this.formatTime(visitor.visitTime),
            visitor.notes || ''
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
    }

    // Utility Functions
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

    formatSource(source) {
        const sourceMap = {
            'website': 'Website',
            'social_media': 'Social Media',
            'referral': 'Referral',
            'walk_in': 'Walk-in',
            'event': 'Event',
            'other': 'Other'
        };
        return sourceMap[source] || source;
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

// Initialize the visitor manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.visitorManager = new VisitorManager();
});

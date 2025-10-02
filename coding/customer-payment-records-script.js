class PaymentManager {
    constructor() {
        this.payments = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderPayments();
        this.updateStats();
        this.updateTotalIncome();
    }

    loadData() {
        // Clear existing data to ensure fresh sample data loads
        localStorage.removeItem('payments');
        
        const savedPayments = localStorage.getItem('payments');
        if (savedPayments) {
            this.payments = JSON.parse(savedPayments);
        } else {
            this.createSampleData();
        }
    }

    createSampleData() {
        const samplePayments = [
            {
                id: '1',
                customerName: 'Ali kau',
                activity: 'yoga',
                activityDate: '2025-08-22',
                activityTime: '20:00',
                paymentDate: '2025-08-22',
                paymentMethod: 'credit_card',
                amount: 50.00,
                status: 'paid',
                notes: 'Payment completed successfully'
            },
            {
                id: '2',
                customerName: 'Kau mahu',
                activity: 'yoga',
                activityDate: '2025-08-22',
                activityTime: '20:00',
                paymentDate: '2025-08-22',
                paymentMethod: 'bank_transfer',
                amount: 50.00,
                status: 'pending',
                notes: 'Bank transfer in progress'
            },
            {
                id: '3',
                customerName: 'Awk Mahu',
                activity: 'yoga',
                activityDate: '2025-08-22',
                activityTime: '20:00',
                paymentDate: '2025-08-22',
                paymentMethod: 'tng_ewallet',
                amount: 50.00,
                status: 'failed',
                notes: 'Payment failed due to insufficient funds'
            },
            {
                id: '4',
                customerName: 'Sarah Johnson',
                activity: 'weaving',
                activityDate: '2025-08-21',
                activityTime: '14:00',
                paymentDate: '2025-08-21',
                paymentMethod: 'credit_card',
                amount: 75.00,
                status: 'paid',
                notes: 'Weaving workshop payment'
            },
            {
                id: '5',
                customerName: 'Michael Chen',
                activity: 'fitness',
                activityDate: '2025-08-21',
                activityTime: '18:00',
                paymentDate: '2025-08-21',
                paymentMethod: 'tng_ewallet',
                amount: 60.00,
                status: 'paid',
                notes: 'Fitness class payment'
            },
            {
                id: '6',
                customerName: 'Emma Wilson',
                activity: 'dance',
                activityDate: '2025-08-20',
                activityTime: '19:00',
                paymentDate: '2025-08-20',
                paymentMethod: 'bank_transfer',
                amount: 45.00,
                status: 'pending',
                notes: 'Dance class payment pending'
            },
            {
                id: '7',
                customerName: 'David Brown',
                activity: 'art',
                activityDate: '2025-08-20',
                activityTime: '16:00',
                paymentDate: '2025-08-20',
                paymentMethod: 'cash',
                amount: 40.00,
                status: 'paid',
                notes: 'Cash payment received'
            },
            {
                id: '8',
                customerName: 'Lisa Garcia',
                activity: 'yoga',
                activityDate: '2025-08-19',
                activityTime: '09:00',
                paymentDate: '2025-08-19',
                paymentMethod: 'credit_card',
                amount: 50.00,
                status: 'paid',
                notes: 'Morning yoga session'
            }
        ];

        this.payments = samplePayments;
        this.saveData();
    }

    saveData() {
        localStorage.setItem('payments', JSON.stringify(this.payments));
    }

    setupEventListeners() {
        // Set default dates
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('activityDate').value = today;
        document.getElementById('paymentDate').value = today;
    }

    renderPayments() {
        const tbody = document.getElementById('paymentTableBody');
        if (!tbody) return;

        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const paymentDateFilter = document.getElementById('paymentDateFilter')?.value || '';
        const methodFilter = document.getElementById('methodFilter')?.value || '';

        let filteredPayments = this.payments.filter(payment => {
            const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm);
            const matchesDate = !paymentDateFilter || payment.paymentDate === paymentDateFilter;
            const matchesMethod = !methodFilter || payment.paymentMethod === methodFilter;
            
            return matchesSearch && matchesDate && matchesMethod;
        });

        tbody.innerHTML = filteredPayments.map(payment => `
            <tr>
                <td>${payment.customerName}</td>
                <td>${this.formatActivity(payment.activity)}</td>
                <td>${this.formatDate(payment.activityDate)}</td>
                <td>${this.formatTime(payment.activityTime)}</td>
                <td>${this.formatDate(payment.paymentDate)}</td>
                <td>
                    <span class="method-badge">
                        ${this.formatPaymentMethod(payment.paymentMethod)}
                    </span>
                </td>
                <td class="amount">RM ${payment.amount.toFixed(2)}</td>
                <td>
                    <span class="status-badge ${payment.status}">${payment.status}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="paymentManager.openEditModal('${payment.id}')" title="Edit Payment">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="paymentManager.deletePayment('${payment.id}')" title="Delete Payment">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const totalPayments = this.payments.length;
        const paidPayments = this.payments.filter(p => p.status === 'paid').length;
        const pendingPayments = this.payments.filter(p => p.status === 'pending').length;
        const failedPayments = this.payments.filter(p => p.status === 'failed').length;

        document.getElementById('totalPayments').textContent = totalPayments;
        document.getElementById('paidPayments').textContent = paidPayments;
        document.getElementById('pendingPayments').textContent = pendingPayments;
        document.getElementById('failedPayments').textContent = failedPayments;
    }

    updateTotalIncome() {
        const totalIncome = this.payments
            .filter(p => p.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);
        
        document.getElementById('totalIncome').textContent = `RM ${totalIncome.toFixed(2)}`;
    }

    // Modal Functions
    openAddPaymentModal() {
        this.setDefaultDates();
        document.getElementById('addPaymentModal').classList.add('show');
        document.getElementById('addPaymentForm').reset();
    }

    openEditModal(paymentId) {
        const payment = this.payments.find(p => p.id === paymentId);
        if (!payment) return;

        document.getElementById('editPaymentId').value = payment.id;
        document.getElementById('editCustomerName').value = payment.customerName;
        document.getElementById('editActivity').value = payment.activity;
        document.getElementById('editActivityDate').value = payment.activityDate;
        document.getElementById('editActivityTime').value = payment.activityTime;
        document.getElementById('editPaymentDate').value = payment.paymentDate;
        document.getElementById('editPaymentMethod').value = payment.paymentMethod;
        document.getElementById('editAmount').value = payment.amount;
        document.getElementById('editStatus').value = payment.status;
        document.getElementById('editNotes').value = payment.notes || '';

        document.getElementById('editPaymentModal').classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    // Form Handlers
    handleAddPayment(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        
        const payment = {
            id: Date.now().toString(),
            customerName: formData.get('customerName').trim(),
            activity: formData.get('activity'),
            activityDate: formData.get('activityDate'),
            activityTime: formData.get('activityTime'),
            paymentDate: formData.get('paymentDate'),
            paymentMethod: formData.get('paymentMethod'),
            amount: parseFloat(formData.get('amount')),
            status: formData.get('status'),
            notes: formData.get('notes').trim()
        };

        // Validate required fields
        if (!payment.customerName || !payment.activity || !payment.activityDate || 
            !payment.activityTime || !payment.paymentDate || !payment.paymentMethod || 
            !payment.amount || !payment.status) {
            this.showMessage('Please fill in all required fields!', 'error');
            return;
        }

        if (payment.amount <= 0) {
            this.showMessage('Amount must be greater than 0!', 'error');
            return;
        }

        this.payments.push(payment);
        this.saveData();
        this.renderPayments();
        this.updateStats();
        this.updateTotalIncome();
        
        event.target.reset();
        this.closeModal('addPaymentModal');
        this.showMessage('Payment added successfully!', 'success');
    }

    handleEditPayment(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const paymentId = formData.get('paymentId');
        const payment = this.payments.find(p => p.id === paymentId);

        if (!payment) {
            this.showMessage('Payment not found!', 'error');
            return;
        }

        // Update payment data
        payment.customerName = formData.get('customerName').trim();
        payment.activity = formData.get('activity');
        payment.activityDate = formData.get('activityDate');
        payment.activityTime = formData.get('activityTime');
        payment.paymentDate = formData.get('paymentDate');
        payment.paymentMethod = formData.get('paymentMethod');
        payment.amount = parseFloat(formData.get('amount'));
        payment.status = formData.get('status');
        payment.notes = formData.get('notes').trim();

        // Validate required fields
        if (!payment.customerName || !payment.activity || !payment.activityDate || 
            !payment.activityTime || !payment.paymentDate || !payment.paymentMethod || 
            !payment.amount || !payment.status) {
            this.showMessage('Please fill in all required fields!', 'error');
            return;
        }

        if (payment.amount <= 0) {
            this.showMessage('Amount must be greater than 0!', 'error');
            return;
        }

        this.saveData();
        this.renderPayments();
        this.updateStats();
        this.updateTotalIncome();
        
        this.closeModal('editPaymentModal');
        this.showMessage('Payment updated successfully!', 'success');
    }

    deletePayment(paymentId) {
        if (confirm('Are you sure you want to delete this payment record?')) {
            this.payments = this.payments.filter(p => p.id !== paymentId);
            this.saveData();
            this.renderPayments();
            this.updateStats();
            this.updateTotalIncome();
            this.showMessage('Payment deleted successfully!', 'success');
        }
    }

    // Search and Filter Functions
    searchPayments() {
        this.renderPayments();
    }

    filterPayments() {
        this.renderPayments();
    }

    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('paymentDateFilter').value = '';
        document.getElementById('methodFilter').value = '';
        this.renderPayments();
    }

    exportData() {
        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-records-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showMessage('Data exported successfully!', 'success');
    }

    generateCSV() {
        const headers = ['Customer Name', 'Activity', 'Activity Date', 'Time', 'Payment Date', 'Method', 'Amount', 'Status', 'Notes'];
        const rows = this.payments.map(payment => [
            payment.customerName,
            this.formatActivity(payment.activity),
            this.formatDate(payment.activityDate),
            this.formatTime(payment.activityTime),
            this.formatDate(payment.paymentDate),
            this.formatPaymentMethod(payment.paymentMethod),
            payment.amount.toFixed(2),
            payment.status,
            payment.notes || ''
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

    formatActivity(activity) {
        const activityMap = {
            'yoga': 'Yoga',
            'weaving': 'Weaving',
            'fitness': 'Fitness',
            'dance': 'Dance',
            'art': 'Art'
        };
        return activityMap[activity] || activity;
    }

    formatPaymentMethod(method) {
        const methodMap = {
            'credit_card': 'Credit Card',
            'bank_transfer': 'Bank Transfer',
            'tng_ewallet': 'TNG E-Wallet',
            'cash': 'Cash',
            'other': 'Other'
        };
        return methodMap[method] || method;
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

// Initialize the payment manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.paymentManager = new PaymentManager();
});

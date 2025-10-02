class ReviewManager {
    constructor() {
        this.reviews = [];
        this.activities = [];
        this.currentFilters = {
            rating: '',
            activity: '',
            dateFrom: '',
            dateTo: ''
        };
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderReviews();
        this.updateStats();
    }

    loadData() {
        // Load activities from localStorage
        const savedActivities = localStorage.getItem('activities');
        if (savedActivities) {
            this.activities = JSON.parse(savedActivities);
        }

        // Load reviews from localStorage
        const savedReviews = localStorage.getItem('reviews');
        if (savedReviews) {
            this.reviews = JSON.parse(savedReviews);
        }

        // If no reviews exist, create some sample data
        if (this.reviews.length === 0) {
            this.createSampleReviews();
        }
    }

    createSampleReviews() {
        const sampleReviews = [
            {
                id: '1',
                activityId: '1',
                activityName: 'Yoga - Beginner',
                customerName: 'Alice Tan',
                customerEmail: 'alice@example.com',
                rating: 5,
                comment: 'Amazing experience! The instructor was very patient and helpful. I learned so much in just one session.',
                tags: ['Relaxing', 'Beginner-friendly', 'Peaceful'],
                reviewDate: '2025-01-15',
                reviewTime: '14:30',
                adminReply: '',
                adminReplyDate: '',
                created: new Date().toISOString()
            },
            {
                id: '2',
                activityId: '1',
                activityName: 'Yoga - Beginner',
                customerName: 'John Lim',
                customerEmail: 'john@example.com',
                rating: 4,
                comment: 'Great class! The poses were challenging but achievable. Looking forward to the next session.',
                tags: ['Challenging', 'Educational'],
                reviewDate: '2025-01-14',
                reviewTime: '09:15',
                adminReply: 'Thank you for your feedback, John! We\'re glad you enjoyed the class. See you next week!',
                adminReplyDate: '2025-01-14',
                adminReplyTime: '10:30',
                created: new Date().toISOString()
            },
            {
                id: '3',
                activityId: '2',
                activityName: 'Weaving Workshop',
                customerName: 'Sarah Wilson',
                customerEmail: 'sarah@example.com',
                rating: 5,
                comment: 'Absolutely loved this workshop! The instructor was knowledgeable and the materials were high quality.',
                tags: ['Creative', 'Educational', 'Fun'],
                reviewDate: '2025-01-13',
                reviewTime: '16:45',
                adminReply: '',
                adminReplyDate: '',
                created: new Date().toISOString()
            },
            {
                id: '4',
                activityId: '3',
                activityName: 'Fitness Bootcamp',
                customerName: 'Mike Chen',
                customerEmail: 'mike@example.com',
                rating: 3,
                comment: 'The workout was intense but good. However, the class was a bit crowded and hard to follow the instructor.',
                tags: ['Intense', 'Crowded'],
                reviewDate: '2025-01-12',
                reviewTime: '18:20',
                adminReply: 'Thank you for your honest feedback, Mike. We\'re working on reducing class sizes to improve the experience for everyone.',
                adminReplyDate: '2025-01-12',
                adminReplyTime: '19:45',
                created: new Date().toISOString()
            },
            {
                id: '5',
                activityId: '1',
                activityName: 'Yoga - Beginner',
                customerName: 'Emma Davis',
                customerEmail: 'emma@example.com',
                rating: 5,
                comment: 'Perfect for beginners! The instructor explained everything clearly and made me feel comfortable.',
                tags: ['Beginner-friendly', 'Comfortable', 'Clear instruction'],
                reviewDate: '2025-01-11',
                reviewTime: '11:30',
                adminReply: '',
                adminReplyDate: '',
                created: new Date().toISOString()
            }
        ];

        this.reviews = sampleReviews;
        this.saveData();
    }

    saveData() {
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderReviews();
        });

        // Filter functionality
        const ratingFilter = document.getElementById('ratingFilter');
        const activityFilter = document.getElementById('activityFilter');
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        const resetFiltersBtn = document.getElementById('resetFiltersBtn');

        ratingFilter.addEventListener('change', (e) => {
            this.currentFilters.rating = e.target.value;
            this.renderReviews();
        });

        activityFilter.addEventListener('change', (e) => {
            this.currentFilters.activity = e.target.value;
            this.renderReviews();
        });

        dateFrom.addEventListener('change', (e) => {
            this.currentFilters.dateFrom = e.target.value;
            this.renderReviews();
        });

        dateTo.addEventListener('change', (e) => {
            this.currentFilters.dateTo = e.target.value;
            this.renderReviews();
        });

        resetFiltersBtn.addEventListener('click', () => {
            this.clearFilters();
        });

        // Modal functionality
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Reply Modal
        const replyModal = document.getElementById('replyModal');
        const closeReplyModal = document.getElementById('closeReplyModal');
        const cancelReply = document.getElementById('cancelReply');
        const replyForm = document.getElementById('replyForm');

        closeReplyModal.addEventListener('click', () => {
            this.closeModal('replyModal');
        });

        cancelReply.addEventListener('click', () => {
            this.closeModal('replyModal');
        });

        replyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleReply();
        });

        // Edit Review Modal
        const editReviewModal = document.getElementById('editReviewModal');
        const closeEditReviewModal = document.getElementById('closeEditReviewModal');
        const cancelEditReview = document.getElementById('cancelEditReview');
        const editReviewForm = document.getElementById('editReviewForm');

        closeEditReviewModal.addEventListener('click', () => {
            this.closeModal('editReviewModal');
        });

        cancelEditReview.addEventListener('click', () => {
            this.closeModal('editReviewModal');
        });

        editReviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditReview();
        });

        // Close modals when clicking outside
        [replyModal, editReviewModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    renderReviews() {
        const container = document.getElementById('reviewsContainer');
        const emptyState = document.getElementById('emptyState');
        
        const filteredReviews = this.getFilteredReviews();
        
        if (filteredReviews.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';

        container.innerHTML = filteredReviews.map(review => {
            const activity = this.activities.find(a => a.id === review.activityId);
            const activityName = activity ? activity.name : review.activityName;
            
            return `
                <div class="review-card" data-review-id="${review.id}">
                    <div class="review-header">
                        <div class="review-activity">
                            <i class="fas fa-map-pin"></i>
                            <h3>${activityName}</h3>
                        </div>
                    </div>
                    
                    <div class="review-content">
                        <div class="review-customer">
                            <span class="review-customer-name">${review.customerName}</span>
                            <span class="review-customer-email">(${review.customerEmail})</span>
                            <div class="review-customer-date">
                                <i class="fas fa-calendar"></i>
                                <span>${this.formatDate(review.reviewDate)}</span>
                                <i class="fas fa-clock"></i>
                                <span>${review.reviewTime || '12:00'}</span>
                            </div>
                        </div>
                        <div class="review-rating">
                            ${this.renderStars(review.rating)}
                        </div>
                        <p class="review-comment">${review.comment}</p>
                        <div class="review-tags">
                            ${review.tags.map(tag => `<span class="review-tag">${tag}</span>`).join('')}
                        </div>
                    </div>

                    ${review.adminReply ? `
                        <div class="admin-reply">
                            <div class="admin-reply-header">
                                <span class="admin-reply-title">Admin Reply</span>
                                <div class="admin-reply-actions">
                                    <div class="admin-reply-datetime">
                                        <i class="fas fa-calendar"></i>
                                        <span>${this.formatDate(review.adminReplyDate)}</span>
                                        <i class="fas fa-clock"></i>
                                        <span>${review.adminReplyTime || '12:00'}</span>
                                    </div>
                                    <button class="btn-delete-reply" onclick="reviewManager.deleteAdminReply('${review.id}')" title="Delete Reply">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="admin-reply-content">${review.adminReply}</div>
                        </div>
                    ` : ''}
                    
                    <div class="review-actions">
                        <button class="btn-reply" onclick="reviewManager.openReplyModal('${review.id}')">
                            <i class="fas fa-reply"></i>
                            ${review.adminReply ? 'Edit Reply' : 'Reply'}
                        </button>
                        <button class="btn-edit" onclick="reviewManager.openEditReviewModal('${review.id}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="btn-delete" onclick="reviewManager.deleteReview('${review.id}')">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getFilteredReviews() {
        return this.reviews.filter(review => {
            // Search filter
            if (this.searchQuery) {
                const matchesSearch = review.customerName.toLowerCase().includes(this.searchQuery) ||
                                    review.customerEmail.toLowerCase().includes(this.searchQuery) ||
                                    review.comment.toLowerCase().includes(this.searchQuery) ||
                                    review.activityName.toLowerCase().includes(this.searchQuery) ||
                                    review.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
                if (!matchesSearch) return false;
            }

            // Rating filter
            if (this.currentFilters.rating && review.rating !== parseInt(this.currentFilters.rating)) {
                return false;
            }

            // Activity filter
            if (this.currentFilters.activity && review.activityId !== this.currentFilters.activity) {
                return false;
            }

            // Date filters
            if (this.currentFilters.dateFrom) {
                const reviewDate = new Date(review.reviewDate);
                const fromDate = new Date(this.currentFilters.dateFrom);
                if (reviewDate < fromDate) return false;
            }

            if (this.currentFilters.dateTo) {
                const reviewDate = new Date(review.reviewDate);
                const toDate = new Date(this.currentFilters.dateTo);
                if (reviewDate > toDate) return false;
            }

            return true;
        });
    }

    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star star"></i>';
            } else {
                stars += '<i class="far fa-star star empty"></i>';
            }
        }
        return stars;
    }

    updateStats() {
        const totalReviews = this.reviews.length;
        const averageRating = totalReviews > 0 ? 
            (this.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1) : 0;
        const repliedReviews = this.reviews.filter(review => review.adminReply).length;
        const pendingReviews = totalReviews - repliedReviews;

        document.getElementById('totalReviews').textContent = totalReviews;
        document.getElementById('averageRating').textContent = averageRating;
        document.getElementById('repliedReviews').textContent = repliedReviews;
        document.getElementById('pendingReviews').textContent = pendingReviews;

        // Update activity filter
        this.updateActivityFilter();
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
        this.currentFilters = { rating: '', activity: '', dateFrom: '', dateTo: '' };
        
        document.getElementById('searchInput').value = '';
        document.getElementById('ratingFilter').value = '';
        document.getElementById('activityFilter').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        
        this.renderReviews();
    }

    // Modal functions
    openReplyModal(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) return;

        document.getElementById('reviewId').value = reviewId;
        document.getElementById('reviewActivityName').textContent = review.activityName;
        document.getElementById('reviewRatingDisplay').innerHTML = this.renderStars(review.rating);
        document.getElementById('reviewComment').textContent = review.comment;
        document.getElementById('reviewTags').innerHTML = review.tags.map(tag => 
            `<span class="review-tag">${tag}</span>`
        ).join('');
        document.getElementById('reviewCustomerName').textContent = review.customerName;
        document.getElementById('reviewDate').textContent = `${this.formatDate(review.reviewDate)} at ${review.reviewTime || '12:00'}`;
        document.getElementById('adminReply').value = review.adminReply || '';

        this.showModal('replyModal');
    }

    openEditReviewModal(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) return;

        document.getElementById('editReviewId').value = reviewId;
        document.getElementById('editActivityId').value = review.activityId;
        document.getElementById('editCustomerName').value = review.customerName;
        document.getElementById('editCustomerEmail').value = review.customerEmail;
        document.getElementById('editRating').value = review.rating;
        document.getElementById('editComment').value = review.comment;
        document.getElementById('editTags').value = review.tags.join(', ');

        // Update activity dropdown
        const activitySelect = document.getElementById('editActivityId');
        activitySelect.innerHTML = '<option value="">Select Activity</option>' +
            this.activities.map(activity => 
                `<option value="${activity.id}">${activity.name}</option>`
            ).join('');
        activitySelect.value = review.activityId;

        this.showModal('editReviewModal');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    // Form handlers
    handleReply() {
        const reviewId = document.getElementById('reviewId').value;
        const adminReply = document.getElementById('adminReply').value.trim();

        if (!adminReply) {
            this.showMessage('Please enter a reply!', 'error');
            return;
        }

        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            const now = new Date();
            review.adminReply = adminReply;
            review.adminReplyDate = now.toISOString().split('T')[0];
            review.adminReplyTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
            this.saveData();
            this.renderReviews();
            this.updateStats();
            this.closeModal('replyModal');
            this.showMessage('Reply sent successfully!', 'success');
        }
    }

    handleEditReview() {
        const formData = new FormData(document.getElementById('editReviewForm'));
        const reviewId = formData.get('editReviewId');
        
        const review = this.reviews.find(r => r.id === reviewId);
        if (review) {
            review.activityId = formData.get('activityId');
            review.customerName = formData.get('customerName');
            review.customerEmail = formData.get('customerEmail');
            review.rating = parseInt(formData.get('rating'));
            review.comment = formData.get('comment');
            review.tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag);
            
            // Update activity name
            const activity = this.activities.find(a => a.id === review.activityId);
            if (activity) {
                review.activityName = activity.name;
            }
            
            this.saveData();
            this.renderReviews();
            this.updateStats();
            this.closeModal('editReviewModal');
            this.showMessage('Review updated successfully!', 'success');
        }
    }

    deleteReview(reviewId) {
        if (confirm('Are you sure you want to delete this review?')) {
            this.reviews = this.reviews.filter(r => r.id !== reviewId);
            this.saveData();
            this.renderReviews();
            this.updateStats();
            this.showMessage('Review deleted successfully!', 'success');
        }
    }

    deleteAdminReply(reviewId) {
        if (confirm('Are you sure you want to delete this admin reply?')) {
            const review = this.reviews.find(r => r.id === reviewId);
            if (review) {
                review.adminReply = '';
                review.adminReplyDate = '';
                review.adminReplyTime = '';
                this.saveData();
                this.renderReviews();
                this.updateStats();
                this.showMessage('Admin reply deleted successfully!', 'success');
            }
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
}

// Initialize the review manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.reviewManager = new ReviewManager();
});

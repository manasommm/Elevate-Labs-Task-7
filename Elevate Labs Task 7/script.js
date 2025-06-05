class UserDataFetcher {
    constructor() {
        this.apiUrl = 'https://jsonplaceholder.typicode.com/users';
        this.users = [];
        this.filteredUsers = [];
        this.isLoading = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.fetchUserData();
    }
    
    initializeElements() {
        this.userContainer = document.getElementById('userContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.searchInput = document.getElementById('searchInput');
        this.userCount = document.getElementById('userCount');
        this.lastUpdated = document.getElementById('lastUpdated');
        this.noResults = document.getElementById('noResults');
        this.refreshSpinner = document.getElementById('refreshSpinner');
    }
    
    attachEventListeners() {
        this.refreshBtn.addEventListener('click', () => this.handleRefresh());
        this.clearBtn.addEventListener('click', () => this.clearData());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.handleRefresh();
            }
        });
    }
    
    async fetchUserData() {
        this.setLoadingState(true);
        this.hideError();
        
        try {
            const response = await fetch(this.apiUrl);
            
            // Check if response is successful
            if (!response.ok) {
                // Handle different HTTP status codes with custom messages
                if (response.status === 404) {
                    throw new Error('404: Users data not found');
                }
                if (response.status === 500) {
                    throw new Error('500: Internal server error');
                }
                throw new Error(`HTTP Error: ${response.status}`);
            }
            
            const userData = await response.json();
            this.users = userData;
            this.filteredUsers = [...userData];
            this.displayUsers(this.filteredUsers);
            this.updateStats();
            this.updateLastUpdatedTime();
            
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    handleError(error) {
        let errorText = 'An unexpected error occurred';
        
        // Handle different types of errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorText = 'Network error: Please check your internet connection';
        } else if (error.message.includes('CORS')) {
            errorText = 'CORS error: Unable to access the API from this domain';
        } else if (error.message.includes('HTTP Error')) {
            errorText = `Server error: ${error.message}`;
        } else {
            errorText = error.message;
        }
        
        this.showError(errorText);
        console.error('Fetch error:', error);
    }
    
    displayUsers(users) {
        if (users.length === 0) {
            this.userContainer.innerHTML = '';
            this.showNoResults();
            return;
        }
        
        this.hideNoResults();
        
        const userCards = users.map(user => this.createUserCard(user)).join('');
        this.userContainer.innerHTML = userCards;
        
        // Add animation to newly loaded cards
        this.animateCards();
    }
    
    createUserCard(user) {
        const address = `${user.address.street}, ${user.address.suite}, ${user.address.city}, ${user.address.zipcode}`;
        const phone = user.phone.split(' ')[0]; // Clean up phone format
        
        return `
            <div class="user-card" data-user-id="${user.id}">
                <div class="user-header">
                    <div class="user-avatar">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-basic-info">
                        <h3 class="user-name">${user.name}</h3>
                        <p class="user-username">@${user.username}</p>
                    </div>
                </div>
                
                <div class="user-details">
                    <div class="detail-item">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">
                            <a href="mailto:${user.email}">${user.email}</a>
                        </span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">
                            <a href="tel:${phone}">${phone}</a>
                        </span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value">${address}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Website:</span>
                        <span class="detail-value">
                            <a href="http://${user.website}" target="_blank">${user.website}</a>
                        </span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Company:</span>
                        <span class="detail-value">${user.company.name}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    handleSearch(searchTerm) {
        const filtered = this.users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.company.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.filteredUsers = filtered;
        this.displayUsers(filtered);
        this.updateStats();
    }
    
    async handleRefresh() {
        if (this.isLoading) return;
        
        this.refreshBtn.classList.add('loading');
        await this.fetchUserData();
        this.refreshBtn.classList.remove('loading');
        this.searchInput.value = '';
    }
    
    clearData() {
        this.userContainer.innerHTML = '';
        this.users = [];
        this.filteredUsers = [];
        this.searchInput.value = '';
        this.updateStats();
        this.hideError();
        this.hideNoResults();
    }
    
    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        this.loadingSpinner.classList.toggle('hidden', !isLoading);
        this.refreshBtn.disabled = isLoading;
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
    }
    
    hideError() {
        this.errorMessage.classList.add('hidden');
    }
    
    showNoResults() {
        this.noResults.classList.remove('hidden');
    }
    
    hideNoResults() {
        this.noResults.classList.add('hidden');
    }
    
    updateStats() {
        this.userCount.textContent = this.filteredUsers.length;
    }
    
    updateLastUpdatedTime() {
        const now = new Date();
        this.lastUpdated.textContent = now.toLocaleTimeString();
    }
    
    animateCards() {
        const cards = document.querySelectorAll('.user-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UserDataFetcher();
});

// Service Worker registration for offline capabilities (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(err => console.log('ServiceWorker registration failed'));
    });
}

// ============================================
// Smart Travel & Tourism Platform
// Core App Module
// ============================================

const API_BASE = '/api';

// ---- API Helper ----
async function api(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options
    };
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/pages/login.html';
                return;
            }
            throw new Error(data.message || 'Something went wrong');
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ---- Auth Helpers ----
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function getToken() {
    return localStorage.getItem('token');
}

function isLoggedIn() {
    return !!getToken();
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/pages/login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.clear();
    showToast('Logged out successfully', 'success');
    setTimeout(() => window.location.href = '/', 500);
}

// ---- Utility Functions ----
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

function timeSince(dateStr) {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
}

// ---- Modal Functions ----
function openModal(content) {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('modalContent');
    if (overlay && modal) {
        modal.innerHTML = content;
        overlay.classList.add('active');
    }
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
});

console.log('🌍 TravelSmart App Core loaded');

/**
 * public/js/api.js
 * Wrapper for Fetch API with JWT handling
 */

const API_URL = '/api';

const api = {
    getToken() {
        return localStorage.getItem('token');
    },
    
    setToken(token) {
        localStorage.setItem('token', token);
    },

    clearToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    async request(endpoint, options = {}) {
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // If FormData, remove Content-Type so browser sets it with boundary
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (response.status === 401) {
                // Token expired or invalid (but don't redirect if already on login page)
                this.clearToken();
                if (!window.location.pathname.includes('/login.html')) {
                    window.location.href = '/login.html';
                }
                throw new Error(data.message || 'Phiên đăng nhập đã hết hạn');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    get(endpoint, params = {}) {
        const qs = new URLSearchParams(params).toString();
        const url = qs ? `${endpoint}?${qs}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    post(endpoint, body) {
        const options = { method: 'POST' };
        options.body = body instanceof FormData ? body : JSON.stringify(body);
        return this.request(endpoint, options);
    },

    put(endpoint, body) {
        const options = { method: 'PUT' };
        options.body = body instanceof FormData ? body : JSON.stringify(body);
        return this.request(endpoint, options);
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },
    
    showToast(message, type = 'success') {
        // Create toast container if not exists
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icon = type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger';
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center gap-2">
                    <i class="bi ${icon} fs-5"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        container.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
};

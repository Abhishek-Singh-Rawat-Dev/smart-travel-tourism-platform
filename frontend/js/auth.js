// ============================================
// Authentication Module
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Role selector
    document.querySelectorAll('.role-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            const roleInput = document.getElementById('regRole');
            if (roleInput) roleInput.value = option.dataset.role;
        });
    });

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            btn.textContent = '⏳ Logging in...';
            btn.disabled = true;

            try {
                const data = await api('/auth/login', {
                    method: 'POST',
                    body: {
                        email: document.getElementById('loginEmail').value,
                        password: document.getElementById('loginPassword').value
                    }
                });

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => window.location.href = '/pages/dashboard.html', 800);
            } catch (error) {
                showToast(error.message || 'Login failed', 'error');
                btn.textContent = '🔐 Login';
                btn.disabled = false;
            }
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('registerBtn');
            btn.textContent = '⏳ Creating account...';
            btn.disabled = true;

            try {
                const data = await api('/auth/register', {
                    method: 'POST',
                    body: {
                        name: document.getElementById('regName').value,
                        email: document.getElementById('regEmail').value,
                        password: document.getElementById('regPassword').value,
                        phone: document.getElementById('regPhone').value,
                        role: document.getElementById('regRole').value
                    }
                });

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showToast('Account created! Redirecting...', 'success');
                setTimeout(() => window.location.href = '/pages/dashboard.html', 800);
            } catch (error) {
                showToast(error.message || 'Registration failed', 'error');
                btn.textContent = '🚀 Create Account';
                btn.disabled = false;
            }
        });
    }
});

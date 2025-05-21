// Configuration
const API_BASE_URL = 'http://localhost:8080/function';

// DOM Elements
const registerForm = document.getElementById('register-form');
const registerSuccess = document.getElementById('register-success');
const loginForm = document.getElementById('login-form');
const loginSuccess = document.getElementById('login-success');
const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

// Show error message in modal
function showError(message) {
    document.getElementById('error-message').textContent = message;
    errorModal.show();
}

// Copy text to clipboard
function copyToClipboard(elementId) {
    const copyText = document.getElementById(elementId);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand('copy');
    
    // Show tooltip or feedback
    const copyButton = copyText.nextElementSibling;
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="bi bi-check"></i> Copied!';
    setTimeout(() => {
        copyButton.innerHTML = originalText;
    }, 2000);
}

// Handle user registration
async function registerUser() {
    const username = document.getElementById('register-username').value.trim();
    
    if (!username) {
        showError('Please enter a username');
        return;
    }
    
    try {
        // Show loading state
        const registerButton = document.querySelector('#register-form button');
        const originalButtonText = registerButton.innerHTML;
        registerButton.disabled = true;
        registerButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
        
        // Step 1: Generate password
        const passwordResponse = await axios.post(`${API_BASE_URL}/generate-password`, { username });
        
        if (passwordResponse.status !== 200) {
            throw new Error('Failed to generate password');
        }
        
        const { password, qr_code: qrCode } = passwordResponse.data;
        
        // Step 2: Generate 2FA
        const twoFAResponse = await axios.post(`${API_BASE_URL}/generate-2fa`, { username });
        
        if (twoFAResponse.status !== 200) {
            throw new Error('Failed to generate 2FA');
        }
        
        // Display success UI
        registerForm.classList.add('d-none');
        registerSuccess.classList.remove('d-none');
        
        // Show generated credentials
        document.getElementById('generated-password').value = password;
        document.getElementById('qrcode-img').src = `data:image/png;base64,${twoFAResponse.data.qr_code}`;
        
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
        // Reset button state
        const registerButton = document.querySelector('#register-form button');
        if (registerButton) {
            registerButton.disabled = false;
            registerButton.innerHTML = 'Register';
        }
    }
}

// Handle user login
async function loginUser() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const twoFACode = document.getElementById('login-2fa').value.trim();
    
    if (!username || !password || !twoFACode) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        // Show loading state
        const loginButton = document.querySelector('#login-form button');
        const originalButtonText = loginButton.innerHTML;
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
        
        // Call authentication function
        const response = await axios.post(`${API_BASE_URL}/authenticate`, {
            username,
            password,
            two_fa_token: twoFACode
        });
        
        if (response.status === 200) {
            // Show success UI
            loginForm.classList.add('d-none');
            loginSuccess.classList.remove('d-none');
            document.getElementById('welcome-username').textContent = username;
            
            // In a real app, you would store the session token and redirect
            console.log('Login successful, session token:', response.data.session_token);
        } else {
            throw new Error('Authentication failed');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        if (error.response?.data?.requires_password_reset) {
            showError('Your password has expired. Please reset your password.');
        } else if (error.response?.data?.account_locked) {
            showError('Account locked. Please contact support.');
        } else {
            showError(error.response?.data?.error || 'Login failed. Please check your credentials and try again.');
        }
    } finally {
        // Reset button state
        const loginButton = document.querySelector('#login-form button');
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerHTML = 'Login';
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeTab = document.querySelector('.tab-pane.active');
                if (activeTab.id === 'register') {
                    registerUser();
                } else {
                    loginUser();
                }
            }
        });
    });
    
    // Show/hide spinner when making API calls
    const originalAxiosRequest = axios.request;
    axios.request = function(config) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner-border text-primary position-fixed';
        spinner.style.top = '20px';
        spinner.style.right = '20px';
        spinner.style.zIndex = '9999';
        document.body.appendChild(spinner);
        
        return originalAxiosRequest(config).finally(() => {
            document.body.removeChild(spinner);
        });
    };
});

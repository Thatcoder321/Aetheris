// /public/js/auth.js - The FINAL version with the Event Propagation Fix

// --- Create the Supabase Client ---
const { createClient } = window.supabase;
const SUPABASE_URL = 'https://ttocgvyuaktyxzubajjq.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0b2Nndnl1YWt0eXh6dWJhampxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjQ1MjIsImV4cCI6MjA2ODA0MDUyMn0.mkzqkHj2Lb4SwxwqbZ3YbesxPa0dIPt8gOvfdhHEwqM';


const supabase_client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class AuthManager {
    constructor() {
        this.accountButton = document.getElementById('account-button');
        this.accountDropdown = document.getElementById('account-dropdown');
        this.loginModalOverlay = document.getElementById('login-modal-overlay');
        this.githubLoginBtn = document.getElementById('github-login-btn');

        this.user = null;
        this.checkUser();
        this.attachListeners();
    }

    async checkUser() {
        const { data: { user } } = await supabase_client.auth.getUser();
        if (user) {
            this.user = user;
        } else {
            this.user = null;
        }
        this.updateUI();
    }

    updateUI() {
        if (this.user) {
            // Logged-in state
            const avatarUrl = this.user.user_metadata.avatar_url || '/images/icon-user.svg';
            this.accountButton.innerHTML = `<img src="${avatarUrl}" alt="User Avatar">`;
            this.accountDropdown.innerHTML = `<h4>${this.user.user_metadata.full_name || this.user.email}</h4><p>Your dashboard is synced.</p><button id="logout-btn">Logout</button>`;
            this.accountDropdown.querySelector('#logout-btn').addEventListener('click', () => this.logout());
        } else {
            // Logged-out (Guest) state
            this.accountButton.innerHTML = `<img src="/images/icon-user.svg" class="user-silhouette" alt="Account">`;
            this.accountDropdown.innerHTML = `<h4>Your Work is Local</h4><p>Create an account to save & sync.</p><button id="login-btn">Log In / Sign Up</button>`;
            this.accountDropdown.querySelector('#login-btn').addEventListener('click', () => this.showLoginModal());
        }
    }

    showLoginModal() {
        this.loginModalOverlay.classList.remove('hidden');
        this.accountDropdown.classList.add('hidden');
    }

    hideLoginModal() {
        this.loginModalOverlay.classList.add('hidden');
    }

    attachListeners() {
        this.accountButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.accountDropdown.classList.toggle('hidden');
        });
        
        document.addEventListener('click', (e) => {
            if (!this.accountButton.contains(e.target) && !this.accountDropdown.contains(e.target)) {
                this.accountDropdown.classList.add('hidden');
            }
        });
        
        this.loginModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.loginModalOverlay) {
                this.hideLoginModal();
            }
        });
        
        // --- THIS IS THE DEFINITIVE FIX ---
        // We are re-implementing the JavaScript listener with stopPropagation.
        if (this.githubLoginBtn) {
            this.githubLoginBtn.addEventListener('click', (e) => {
                // 1. Stop the browser's default (which is being blocked anyway).
                e.preventDefault();
                // 2. Stop the click from bubbling up to any other listeners.
                e.stopPropagation();
                // 3. Force the navigation with JavaScript.
                window.location.href = this.githubLoginBtn.href;
            });
        }
    }
    
    async logout() {
        await supabase_client.auth.signOut();
        window.location.reload(); 
    }
}

// Initialize the entire system
new AuthManager();
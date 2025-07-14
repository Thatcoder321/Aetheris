
import { supabase } from './supabaseClient.js';

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
        const { data } = await supabase.auth.getUser();
        if (data.user) {
            this.user = data.user;
        } else {
            this.user = null;
        }
        this.updateUI();
    }
    updateUI() {
        if (this.user) {
            this.accountButton.innerHTML = `<img src="${this.user.user_metadata.avatar_url}" alt="User Avatar">`;
            this.accountDropdown.innerHTML = `<h4>${this.user.user_metadata.full_name || 'User'}</h4><p>${this.user.email}</p><button id="logout-btn">Logout</button>`;
            this.accountDropdown.querySelector('#logout-btn').addEventListener('click', () => this.logout());
        } else {
            this.accountButton.innerHTML = `<img src="/images/icon-user.svg" class="user-silhouette" alt="Account">`;
            this.accountDropdown.innerHTML = `<h4>Your Work is Local</h4><p>Create an account to save & sync.</p><button id="login-btn">Log In / Sign Up</button>`;
            this.accountDropdown.querySelector('#login-btn').addEventListener('click', () => this.showLoginModal());
        }
    }
    showLoginModal() { this.loginModalOverlay.classList.remove('hidden'); this.accountDropdown.classList.add('hidden'); }
    hideLoginModal() { this.loginModalOverlay.classList.add('hidden'); }
    async loginWithGitHub() { await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.href } }); }
    async logout() { await supabase.auth.signOut(); window.location.reload(); }
    attachListeners() {
        this.accountButton.addEventListener('click', (e) => { e.stopPropagation(); this.accountDropdown.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!this.accountButton.contains(e.target) && !this.accountDropdown.contains(e.target)) this.accountDropdown.classList.add('hidden'); });
        this.loginModalOverlay.addEventListener('click', (e) => { if (e.target === this.loginModalOverlay) this.hideLoginModal(); });
        this.githubLoginBtn.addEventListener('click', () => this.loginWithGitHub());
    }
}


new AuthManager();
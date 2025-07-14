// /public/js/auth.js - The final version, using a simple cookie check.

class AuthManager {
    constructor() {
        this.accountButton = document.getElementById('account-button');
        this.accountDropdown = document.getElementById('account-dropdown');
        this.loginModalOverlay = document.getElementById('login-modal-overlay');
        this.githubLoginBtn = document.getElementById('github-login-btn');
        this.user = null; // We'll store user data like { name, avatar_url }

        this.initialize();
        this.attachStaticListeners();
    }

    async initialize() {
        // Check if our cookie exists. This is the only check we need.
        const isLoggedIn = document.cookie.includes('github_access_token=');

        if (isLoggedIn) {
            try {
                // If we're logged in, use our existing stats route to get user info.
                const response = await fetch('/api/github/stats');
                if (!response.ok) throw new Error('Could not fetch user stats');
                const userData = await response.json();
                this.user = userData;
            } catch (error) {
                console.error("Auth init error:", error);
                this.user = null; // If stats fail, treat as logged out.
            }
        }
        this.updateUI();
    }

    updateUI() {
        if (this.user) {
            // Logged-in state
            this.accountButton.innerHTML = `<img src="${this.user.avatar_url}" alt="User Avatar">`;
            this.accountDropdown.innerHTML = `<h4>${this.user.name || 'User'}</h4><p>Logged in with GitHub</p><button id="logout-btn">Logout</button>`;
            this.accountDropdown.querySelector('#logout-btn')?.addEventListener('click', () => this.logout());
        } else {
            // Logged-out state
            this.accountButton.innerHTML = `<img src="/images/icon-user.svg" class="user-silhouette" alt="Account">`;
            this.accountDropdown.innerHTML = `<h4>Your Work is Local</h4><p>Log in to save & sync.</p><button id="login-btn">Log In with GitHub</button>`;
            this.accountDropdown.querySelector('#login-btn')?.addEventListener('click', () => this.showLoginModal());
        }
    }

    showLoginModal() { this.loginModalOverlay.classList.remove('hidden'); this.accountDropdown.classList.add('hidden'); }
    hideLoginModal() { this.loginModalOverlay.classList.add('hidden'); }

    logout() {
        // To log out, we just need to delete the cookie. We'll do this via an API route.
        fetch('/api/auth/github/logout').then(() => {
            window.location.reload();
        });
    }

    attachStaticListeners() {
        this.accountButton.addEventListener('click', (e) => { e.stopPropagation(); this.accountDropdown.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!this.accountButton.contains(e.target) && !this.accountDropdown.contains(e.target)) this.accountDropdown.classList.add('hidden'); });
        this.loginModalOverlay.addEventListener('click', (e) => { if (e.target === this.loginModalOverlay) this.hideLoginModal(); });
    }
}

// Initialize the system
new AuthManager();
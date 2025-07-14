// /public/js/auth.js - The FINAL version using onAuthStateChange

// --- Create the Supabase Client ---
const { createClient } = window.supabase;
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; 
const SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';
const supabase_client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class AuthManager {
    constructor() {
        this.accountButton = document.getElementById('account-button');
        this.accountDropdown = document.getElementById('account-dropdown');
        this.loginModalOverlay = document.getElementById('login-modal-overlay');
        this.githubLoginBtn = document.getElementById('github-login-btn');

        this.user = null;
        
        // --- THIS IS THE FIX ---
        // We no longer check the user once. We now LISTEN for any change.
        this.listenForAuthStateChanges();
        this.attachListeners();
    }

    listenForAuthStateChanges() {
        // This is the official Supabase event listener.
        // It fires once on page load, and again any time the user logs in or out.
        supabase_client.auth.onAuthStateChange(async (event, session) => {
            const user = session?.user || null;
            this.user = user;
            
            // If a user is newly logged in, ensure their profile exists
            if (event === 'SIGNED_IN' && user) {
                // The upsert call silently creates the profile if it doesn't exist.
                await supabase_client.from('profiles').upsert({ id: user.id }, { onConflict: 'id' });
            }
            
            // Now, update the UI with the latest, correct user state.
            this.updateUI();
        });
    }

    updateUI() {
        if (this.user) {
            // Logged-in state
            const avatarUrl = this.user.user_metadata.avatar_url || '/images/icon-user.svg';
            this.accountButton.innerHTML = `<img src="${avatarUrl}" alt="User Avatar">`;
            this.accountDropdown.innerHTML = `<h4>${this.user.user_metadata.full_name || this.user.email}</h4><p>Your dashboard is synced.</p><button id="logout-btn">Logout</button>`;
            this.accountDropdown.querySelector('#logout-btn')?.addEventListener('click', () => this.logout());
        } else {
            // Logged-out (Guest) state
            this.accountButton.innerHTML = `<img src="/images/icon-user.svg" class="user-silhouette" alt="Account">`;
            this.accountDropdown.innerHTML = `<h4>Your Work is Local</h4><p>Create an account to save & sync.</p><button id="login-btn">Log In / Sign Up</button>`;
            this.accountDropdown.querySelector('#login-btn')?.addEventListener('click', () => this.showLoginModal());
        }
    }

    showLoginModal() {
        this.loginModalOverlay.classList.remove('hidden');
        this.accountDropdown.classList.add('hidden');
    }

    hideLoginModal() {
        this.loginModalOverlay.classList.add('hidden');
    }

    async loginWithGitHub() {
        await supabase_client.auth.signInWithOAuth({
            provider: 'github',
        });
    }

    async logout() {
        await supabase_client.auth.signOut();
        // A reload is no longer strictly necessary, but it's a clean way to reset state.
        window.location.reload(); 
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
            if (e.target === this.loginModalOverlay) this.hideLoginModal();
        });
        // We still need this listener for the button inside the modal
        this.githubLoginBtn.addEventListener('click', () => this.loginWithGitHub());
    }
}

// --- Initialize the entire system ---
new AuthManager();
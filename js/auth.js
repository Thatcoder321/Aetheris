// /public/js/auth.js - The FINAL version using the official onAuthStateChange listener

// --- Create the Supabase Client ---
// The 'supabase' variable is now globally available from the CDN script in index.html
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
        
        // We set up the listener immediately.
        this.listenForAuthChanges();
        this.attachStaticListeners();
    }

    // --- THIS IS THE CORRECT, EVENT-DRIVEN SOLUTION ---
    listenForAuthChanges() {
        // This function fires once on page load, and again every time
        // the user logs in or out. It is the perfect tool for this job.
        supabase_client.auth.onAuthStateChange(async (event, session) => {
            const user = session?.user || null;
            this.user = user;

            // When a user successfully signs in after the redirect...
            if (event === 'SIGNED_IN' && user) {
                // We ensure their profile exists in our database.
                // This is the safest place to put this logic.
                await supabase_client.from('profiles').upsert({ id: user.id }, { onConflict: 'id' });
            }
            
            // After every event, we update the UI to reflect the latest state.
            this.updateUI();
        });
    }

    updateUI() {
        if (this.user) {
            // Render Logged-In State
            const avatarUrl = this.user.user_metadata.avatar_url || '/images/icon-user.svg';
            this.accountButton.innerHTML = `<img src="${avatarUrl}" alt="User Avatar">`;
            this.accountDropdown.innerHTML = `<h4>${this.user.user_metadata.full_name || this.user.email}</h4><p>Your dashboard is synced.</p><button id="logout-btn">Logout</button>`;
            this.accountDropdown.querySelector('#logout-btn')?.addEventListener('click', () => this.logout());
        } else {
            // Render Logged-Out State
            this.accountButton.innerHTML = `<img src="/images/icon-user.svg" class="user-silhouette" alt="Account">`;
            this.accountDropdown.innerHTML = `<h4>Your Work is Local</h4><p>Create an account to save & sync.</p><button id="login-btn">Log In / Sign Up</button>`;
            this.accountDropdown.querySelector('#login-btn')?.addEventListener('click', () => this.showLoginModal());
        }
    }

    showLoginModal() { this.loginModalOverlay.classList.remove('hidden'); this.accountDropdown.classList.add('hidden'); }
    hideLoginModal() { this.loginModalOverlay.classList.add('hidden'); }

    async loginWithGitHub() {
        // This initiates the login flow.
        await supabase_client.auth.signInWithOAuth({
            provider: 'github',
        });
    }

    async logout() {
        await supabase_client.auth.signOut();
        window.location.reload(); 
    }

    attachStaticListeners() {
        this.accountButton.addEventListener('click', (e) => { e.stopPropagation(); this.accountDropdown.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!this.accountButton.contains(e.target) && !this.accountDropdown.contains(e.target)) this.accountDropdown.classList.add('hidden'); });
        this.loginModalOverlay.addEventListener('click', (e) => { if (e.target === this.loginModalOverlay) this.hideLoginModal(); });
        this.githubLoginBtn.addEventListener('click', () => this.loginWithGitHub());
    }
}

// Initialize the system
new AuthManager();
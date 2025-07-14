// /public/js/auth.js - The FINAL version using a direct "Load and Check"

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
        // We call our main logic immediately when the class is created.
        this.initialize();
        this.attachStaticListeners();
    }

    // This is our main startup function.
    async initialize() {
        const { data: { user } } = await supabase_client.auth.getUser();

        if (user) {
            // User is logged in.
            this.user = user;
            // Silently ensure their profile exists in our DB.
            await supabase_client.from('profiles').upsert({ id: user.id }, { onConflict: 'id' });
        } else {
            // User is not logged in.
            this.user = null;
        }
        
        // Now, draw the correct UI based on the result.
        this.updateUI();
    }

    updateUI() {
        if (this.user) {
            // --- RENDER LOGGED-IN STATE ---
            const avatarUrl = this.user.user_metadata.avatar_url || '/images/icon-user.svg';
            this.accountButton.innerHTML = `<img src="${avatarUrl}" alt="User Avatar">`;
            
            this.accountDropdown.innerHTML = `
                <h4>${this.user.user_metadata.full_name || this.user.email}</h4>
                <p>Your dashboard is synced.</p>
                <button id="logout-btn">Logout</button>
            `;
            // Attach listener to the NEW logout button
            this.accountDropdown.querySelector('#logout-btn')?.addEventListener('click', () => this.logout());

        } else {
            // --- RENDER LOGGED-OUT STATE ---
            this.accountButton.innerHTML = `<img src="/images/icon-user.svg" class="user-silhouette" alt="Account">`;
            
            this.accountDropdown.innerHTML = `
                <h4>Your Work is Local</h4>
                <p>Create an account to save & sync.</p>
                <button id="login-btn">Log In / Sign Up</button>
            `;
            // Attach listener to the NEW login button
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
        window.location.reload(); 
    }

    // These listeners are attached once to elements that always exist.
    attachStaticListeners() {
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
        this.githubLoginBtn.addEventListener('click', () => this.loginWithGitHub());
    }
}

// --- Initialize the entire system ---
new AuthManager();
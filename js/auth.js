const { createClient } = window.supabase;
const SUPABASE_URL = 'https://ttocgvyuaktyxzubajjq.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0b2Nndnl1YWt0eXh6dWJhampxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjQ1MjIsImV4cCI6MjA2ODA0MDUyMn0.mkzqkHj2Lb4SwxwqbZ3YbesxPa0dIPt8gOvfdhHEwqM';
const supabase_client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("--- SCRIPT START: auth.js ---");

class AuthManager {
    constructor() {
        this.accountButton = document.getElementById('account-button');
        this.accountDropdown = document.getElementById('account-dropdown');
        this.loginModalOverlay = document.getElementById('login-modal-overlay');
        this.githubLoginBtn = document.getElementById('github-login-btn');
        this.user = null;
        
        console.log("AuthManager: Constructor finished. Attaching listeners now.");
        this.listenForAuthChanges();
        this.attachStaticListeners();
    }

    listenForAuthChanges() {
        console.log("AuthManager: Attaching onAuthStateChange listener...");
        supabase_client.auth.onAuthStateChange(async (event, session) => {
            console.log(`%cAUTH STATE CHANGE FIRED! Event: ${event}`, 'color: yellow; font-weight: bold;', session);

            this.user = session?.user || null;
            console.log("AuthManager: User state is now:", this.user ? `Logged in as ${this.user.email}` : "Logged out");

            if (event === 'SIGNED_IN' && this.user) {
                console.log("AuthManager: SIGNED_IN event. Upserting profile for ID:", this.user.id);
                try {
                    await supabase_client.from('profiles').upsert({ id: this.user.id.toString() }, { onConflict: 'id' });
                } catch (error) {
                    console.error("Error creating profile:", error);
                }
            }

            console.log("AuthManager: Calling updateUI() from auth state change...");
            this.updateUI();
        });
    }

    updateUI() {
        console.log("%c--- Running updateUI() ---", "color: cyan");
        if (this.user) {
            console.log("updateUI: User EXISTS. Rendering LOGGED-IN state.");
            const avatarUrl = this.user.user_metadata.avatar_url || '/images/icon-user.svg';
            this.accountButton.innerHTML = `<img src="${avatarUrl}" alt="User Avatar">`;
            this.accountDropdown.innerHTML = `
                <h4>${this.user.user_metadata.full_name || this.user.email}</h4>
                <p>Your dashboard is synced.</p>
                <button id="logout-btn">Logout</button>
            `;
            const logoutBtn = this.accountDropdown.querySelector('#logout-btn');
            console.log("updateUI: Found logout button:", logoutBtn);
            logoutBtn?.addEventListener('click', () => this.logout());
            console.log("updateUI: >>> ATTACHED click listener to #logout-btn.");
        } else {
            console.log("updateUI: User is NULL. Rendering LOGGED-OUT state.");
            this.accountButton.innerHTML = `<img src="/images/icon-user.svg" class="user-silhouette" alt="Account">`;
            this.accountDropdown.innerHTML = `
                <h4>Your Work is Local</h4>
                <p>Create an account to save & sync.</p>
                <button id="login-btn">Log In / Sign Up</button>
            `;
            const loginBtn = this.accountDropdown.querySelector('#login-btn');
            console.log("updateUI: Found login button:", loginBtn);
            loginBtn?.addEventListener('click', () => {
                console.log("EVENT: #login-btn was clicked. Calling showLoginModal().");
                this.showLoginModal();
            });
            console.log("updateUI: >>> ATTACHED click listener to #login-btn.");
        }
        console.log("%c--- Finished updateUI() ---", "color: cyan");
    }

    showLoginModal() { 
        console.error("%c!!! CRITICAL: showLoginModal() was called. Showing modal now.", "color: red; font-size: 14px;");
        this.loginModalOverlay.classList.remove('hidden'); 
        this.accountDropdown.classList.add('hidden'); 
    }
    
    hideLoginModal() { 
        console.log("AuthManager: Hiding login modal.");
        this.loginModalOverlay.classList.add('hidden'); 
    }
    
    async loginWithGitHub() {
        console.log('AuthManager: loginWithGitHub() called. Redirecting to GitHub...');
        const { error } = await supabase_client.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: window.location.href }
        });
        if (error) {
            console.error('GitHub login error:', error);
            alert('Login failed: ' + error.message);
        }
    }

    async logout() {
        console.log("AuthManager: logout() called.");
        await supabase_client.auth.signOut();
    }

    attachStaticListeners() {
        console.log("AuthManager: Attaching STATIC listeners...");
        this.accountButton.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            e.preventDefault(); 
        
            console.log("%cEVENT: #account-button CLICKED.", "color: lime; font-weight: bold;");
          
            if (this.accountDropdown.classList.contains('hidden')) {
                console.log("Dropdown IS hidden. Removing 'hidden' class now.");
                this.accountDropdown.classList.remove('hidden');
            } else {
                console.log("Dropdown IS visible. Adding 'hidden' class now.");
                this.accountDropdown.classList.add('hidden');
            }
        });
        
        document.addEventListener('click', (e) => { 
            if (!this.accountButton.contains(e.target) && !this.accountDropdown.contains(e.target)) {
                this.accountDropdown.classList.add('hidden'); 
            }
        });
        
        this.loginModalOverlay.addEventListener('click', (e) => { 
            if (e.target === this.loginModalOverlay) { this.hideLoginModal(); }
        });
        
        this.githubLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginWithGitHub();
        });
        console.log("AuthManager: STATIC listeners attached.");
    }
}

console.log("AuthManager: Initializing new instance...");
new AuthManager();
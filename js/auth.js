// --- Start of Singleton Pattern ---
if (!window.authManagerInstance) {

    const { createClient } = window.supabase;
    const SUPABASE_URL = 'https://ttocgvyuaktyxzubajjq.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0b2Nndnl1YWt0eXh6dWJhampxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjQ1MjIsImV4cCI6MjA2ODA0MDUyMn0.mkzqkHj2Lb4SwxwqbZ3YbesxPa0dIPt8gOvfdhHEwqM';
    const supabase_client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    class AuthManager {
        constructor() {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init());
            } else {
                this.init();
            }
        }
    
        init() {
            this.accountButton = document.getElementById('account-button');
            this.accountDropdown = document.getElementById('account-dropdown');
            this.loginModalOverlay = document.getElementById('login-modal-overlay');
            this.githubLoginBtn = document.getElementById('github-login-btn');
            this.user = null;
            this.isAllowedToClick = true;
            
            console.log("AuthManager: Elements found:", {
                accountButton: !!this.accountButton,
                accountDropdown: !!this.accountDropdown,
                loginModalOverlay: !!this.loginModalOverlay,
                githubLoginBtn: !!this.githubLoginBtn
            });
            
            if (!this.accountButton || !this.accountDropdown) {
                console.error("Critical elements not found!");
                return;
            }

        
            
            this.attachStaticListeners();
            this.handleOAuthCallback().then(() => {
                this.listenForAuthChanges();
                console.log("AuthManager: OAuth callback and auth listeners initialized.");
            });
            console.log("MANUAL updateUI() call for debugging:");
            this.updateUI();
        }

        listenForAuthChanges() {
            console.log("AuthManager: Attaching onAuthStateChange listener...");
            
            supabase_client.auth.getSession().then(async ({ data: { session } }) => {
                if (session) {
                    console.log("AuthManager: Found existing session on page load:", session);
                    this.user = session.user;
                    // Wait for state.js functions to be available
                    await this.waitForStateFunctions();
                    if (typeof window.loadStateFromCloud === 'function') {
                        await window.loadStateFromCloud();
                    }
                    this.updateUI();
                } else {
                    await this.waitForStateFunctions();
                    if (typeof window.loadDefaultGuestState === 'function') {
                        window.loadDefaultGuestState();
                    }
                    this.updateUI();
                }
            });
            
            supabase_client.auth.onAuthStateChange(async (event, session) => {
                console.log(`%cAUTH STATE CHANGE: ${event}`, 'color: yellow; font-weight: bold;');
                
                const user = session?.user || null;

                if (this.user === null && user !== null) {
                    this.user = user; 
                    const isNewUser = !user.last_sign_in_at || (user.created_at === user.last_sign_in_at);

                    await this.waitForStateFunctions();
                    if (isNewUser) {
                        console.log("New user detected!");
                        await supabase_client.from('profiles').upsert({ id: this.user.id.toString() }, { onConflict: 'id' });
                        if (typeof window.saveStateToCloud === 'function') {
                            await window.saveStateToCloud();
                        }
                    } else {
                        console.log("Returning user detected!");
                        if (typeof window.loadStateFromCloud === 'function') {
                            await window.loadStateFromCloud();
                        }
                    }
                } else if (this.user !== null && user === null) {
                    console.log("User logged out");
                    this.user = null;
                    if (typeof window.loadDefaultGuestState === 'function') {
                        window.loadDefaultGuestState();
                    }
                }

                this.updateUI();
            });
        }

        async waitForStateFunctions() {
            let attempts = 0;
            while (attempts < 50 && typeof window.loadStateFromCloud !== 'function') {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            if (attempts >= 50) {
                console.warn("State functions not available after 5 seconds");
            }
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
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.logout();
                    });
                }
            } else {
                console.log("updateUI: User is NULL. Rendering LOGGED-OUT state.");
                this.accountButton.innerHTML = `<img src="/images/icon-user.svg" class="user-silhouette" alt="Account">`;
                this.accountDropdown.innerHTML = `
                    <h4>Your Work is Local</h4>
                    <p>Create an account to save & sync.</p>
                    <button id="login-btn">Log In / Sign Up</button>
                `;
                
                const loginBtn = this.accountDropdown.querySelector('#login-btn');
                if (loginBtn) {
                    loginBtn.addEventListener('click', () => this.showLoginModal());
                }
            }
            console.log("updateUI complete. Dropdown content:", this.accountDropdown.innerHTML);
        }

        showLoginModal() { 
            this.loginModalOverlay.classList.remove('hidden'); 
            this.accountDropdown.classList.add('hidden'); 
        }
        
        hideLoginModal() { 
            this.loginModalOverlay.classList.add('hidden'); 
        }
        
        async loginWithGitHub() {
            const { error } = await supabase_client.auth.signInWithOAuth({
                provider: 'github', options: { redirectTo: window.location.href }
            });
            if (error) { 
                console.error('GitHub login error:', error); 
                alert('Login failed: ' + error.message); 
            }
        }

        async logout() {
            console.log("AuthManager: Logout method called");
            try {
                const { error } = await supabase_client.auth.signOut();
                if (error) {
                    console.error('Logout error:', error);
                    alert('Logout failed: ' + error.message);
                } else {
                    console.log("AuthManager: Successfully logged out");
                    this.accountDropdown.classList.add('hidden');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('Logout failed: ' + error.message);
            }
        }
        async handleOAuthCallback() {
            // Check if we're returning from an OAuth redirect
            const { data, error } = await supabase_client.auth.getSession();
            
            if (error) {
                console.error('Error getting session after OAuth:', error);
                return;
            }
            
            if (data.session) {
                console.log('Found session after OAuth redirect:', data.session);
                this.user = data.session.user;
                await this.waitForStateFunctions();
                
                const isNewUser = !this.user.last_sign_in_at || (this.user.created_at === this.user.last_sign_in_at);
                
                if (isNewUser) {
                    console.log("New user detected after OAuth!");
                    await supabase_client.from('profiles').upsert({ 
                        id: this.user.id.toString() 
                    }, { onConflict: 'id' });
                    
                    if (typeof window.saveStateToCloud === 'function') {
                        await window.saveStateToCloud();
                    }
                } else {
                    console.log("Returning user detected after OAuth!");
                    if (typeof window.loadStateFromCloud === 'function') {
                        await window.loadStateFromCloud();
                    }
                }
                
                this.updateUI();
                this.hideLoginModal(); // Hide the login modal if it's open
            }
        }
        attachStaticListeners() {
            console.log("AuthManager: Attaching STATIC listeners...");
            
            this.accountButton.addEventListener('click', (e) => { 
                e.stopPropagation(); 
                e.preventDefault();

                if (!this.isAllowedToClick) {
                    console.log("%cIGNORING CLICK (Debouncing)", "color: gray");
                    return;
                }

                console.log("%cACCOUNT BUTTON CLICKED", "color: lime; font-weight: bold;");
                console.log("Dropdown current state:", this.accountDropdown.classList.toString());
                this.accountDropdown.classList.toggle('hidden');
                console.log("Dropdown new state:", this.accountDropdown.classList.toString());

                this.isAllowedToClick = false;
                setTimeout(() => {
                    this.isAllowedToClick = true;
                }, 200); 
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
        }
    }

    // Create the singleton instance
    window.authManagerInstance = new AuthManager();
    
    // Make supabase_client available globally
    window.supabase_client = supabase_client;
}
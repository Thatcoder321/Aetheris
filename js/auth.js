// --- Start of Singleton Pattern ---
// Check if an instance already exists on the window object.
// If it does, this script will do nothing further.
if (!window.authManagerInstance) {

    const { createClient } = window.supabase;
    const SUPABASE_URL = 'https://ttocgvyuaktyxzubajjq.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0b2Nndnl1YWt0eXh6dWJhampxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NjQ1MjIsImV4cCI6MjA2ODA0MDUyMn0.mkzqkHj2Lb4SwxwqbZ3YbesxPa0dIPt8gOvfdhHEwqM';
    const supabase_client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log("%c--- SCRIPT START: auth.js (Executing Singleton Body) ---", "color: orange; font-size: 14px;");

    class AuthManager {
        constructor() {
            this.accountButton = document.getElementById('account-button');
            this.accountDropdown = document.getElementById('account-dropdown');
            this.loginModalOverlay = document.getElementById('login-modal-overlay');
            this.githubLoginBtn = document.getElementById('github-login-btn');
            this.user = null;
            
            // --- DEBOUNCE VARIABLE ---
            this.isAllowedToClick = true;
            // --------------------------
            
            console.log("AuthManager: Constructor finished. Attaching listeners now.");
            this.attachStaticListeners();
            this.listenForAuthChanges();
        }

        listenForAuthChanges() {
            console.log("AuthManager: Attaching onAuthStateChange listener...");
            
            // Check for existing session on page load
            supabase_client.auth.getSession().then(async ({ data: { session } }) => {
                if (session) {
                    console.log("AuthManager: Found existing session on page load:", session);
                    this.user = session.user;
                    // Use global function from state.js
                    if (typeof window.loadStateFromCloud === 'function') {
                        await window.loadStateFromCloud();
                    } else {
                        console.warn("loadStateFromCloud not available yet");
                    }
                    this.updateUI();
                } else {
                    // Use global function from state.js
                    if (typeof window.loadDefaultGuestState === 'function') {
                        window.loadDefaultGuestState();
                    }
                    this.updateUI();
                }
            });
            
            // Listen for auth state changes
            supabase_client.auth.onAuthStateChange(async (event, session) => {
                console.log(`%cAUTH STATE CHANGE FIRED! Event: ${event}`, 'color: yellow; font-weight: bold;', session);
                
                const user = session?.user || null;

                if (this.user === null && user !== null) {
                    this.user = user; 
                    const isNewUser = !user.last_sign_in_at || (user.created_at === user.last_sign_in_at);

                    if (isNewUser) {
                        console.log("New user detected! Migrating local state to cloud...");
                        await supabase_client.from('profiles').upsert({ id: this.user.id.toString() }, { onConflict: 'id' });
                        // Use global function from state.js
                        if (typeof window.saveStateToCloud === 'function') {
                            await window.saveStateToCloud();
                        }
                    } else {
                        console.log("Returning user detected. Loading state from cloud...");
                        // Use global function from state.js
                        if (typeof window.loadStateFromCloud === 'function') {
                            await window.loadStateFromCloud();
                        }
                    }
                } else if (this.user !== null && user === null) {
                    console.log("User has logged out");
                    this.user = null;
                    // Load default guest state when user logs out
                    if (typeof window.loadDefaultGuestState === 'function') {
                        window.loadDefaultGuestState();
                    }
                }

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
                
                // Add event listener to the logout button
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
                
                // Add event listener to the login button
                const loginBtn = this.accountDropdown.querySelector('#login-btn');
                if (loginBtn) {
                    loginBtn.addEventListener('click', () => this.showLoginModal());
                }
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

        attachStaticListeners() {
            console.log("AuthManager: Attaching STATIC listeners...");
            
            this.accountButton.addEventListener('click', (e) => { 
                e.stopPropagation(); 
                e.preventDefault();

                if (!this.isAllowedToClick) {
                    console.log("%cIGNORING CLICK (Debouncing)", "color: gray");
                    return;
                }

                console.log("%cEVENT: #account-button CLICKED.", "color: lime; font-weight: bold;");
                this.accountDropdown.classList.toggle('hidden');

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
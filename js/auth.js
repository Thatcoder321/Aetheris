// --- Start of Singleton Pattern ---
// Check if an instance already exists on the window object.
// If it does, this script will do nothing further.
if (!window.authManagerInstance) {

    // --- Original auth.js code goes inside this block ---

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
            this.listenForAuthChanges(); // This is now async and will handle initial session
        }

        // In /public/js/auth.js

        listenForAuthChanges() {
            console.log("AuthManager: Attaching onAuthStateChange listener...");
            
            // This robustly checks for an existing session on page load
            supabase_client.auth.getSession().then(async ({ data: { session } }) => {
                if (session) {
                    console.log("AuthManager: Found existing session on page load:", session);
                    this.user = session.user;
                    await loadStateFromCloud();
                    this.updateUI();
                } else {
                    loadDefaultGuestState();
                    this.updateUI();
                }
            });
            
            // Then, it listens for any subsequent changes (like login or logout)
            supabase_client.auth.onAuthStateChange(async (event, session) => {
                console.log(`%cAUTH STATE CHANGE FIRED! Event: ${event}`, 'color: yellow; font-weight: bold;', session);
                
                const user = session?.user || null;

                // This logic correctly handles the transition from logged-out to logged-in
                if (this.user === null && user !== null) {
                    this.user = user; 
                    const isNewUser = !user.last_sign_in_at || (user.created_at === user.last_sign_in_at);

                    if (isNewUser) {
                        console.log("New user detected! Migrating local state to cloud...");
                        await supabase_client.from('profiles').upsert({ id: this.user.id.toString() }, { onConflict: 'id' });
                        await saveStateToCloud();
                    } else {
                        // For a returning user logging in, the getSession() above might have already loaded state.
                        // Or, if this is the first event, we load it now.
                        console.log("Returning user detected. Loading state from cloud...");
                        await loadStateFromCloud();
                    }
                } else if (this.user !== null && user === null) {
                    console.log("User has logged out");
                    this.user = null;
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
                
                // Add event listener to the logout button with debugging
                const logoutBtn = this.accountDropdown.querySelector('#logout-btn');
                console.log("updateUI: Looking for logout button:", logoutBtn);
                if (logoutBtn) {
                    console.log("updateUI: Found logout button, attaching listener");
                    logoutBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("updateUI: Logout button clicked!");
                        this.logout();
                    });
                } else {
                    console.error("updateUI: Logout button not found!");
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
            console.log("%c--- Finished updateUI() ---", "color: cyan");
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
                    // Hide the dropdown after logout
                    this.accountDropdown.classList.add('hidden');
                }
            } catch (error) {
                console.error('Logout error:', error);
                alert('Logout failed: ' + error.message);
            }
        }

        attachStaticListeners() {
            console.log("AuthManager: Attaching STATIC listeners...");
            
            // --- THE DEBOUNCED CLICK LISTENER ---
            this.accountButton.addEventListener('click', (e) => { 
                e.stopPropagation(); 
                e.preventDefault();

                // If we are not allowed to click yet, do nothing.
                if (!this.isAllowedToClick) {
                    console.log("%cIGNORING CLICK (Debouncing)", "color: gray");
                    return;
                }

                // We got a valid click!
                console.log("%cEVENT: #account-button CLICKED.", "color: lime; font-weight: bold;");
                
                // Only toggle the dropdown, don't show login modal
                this.accountDropdown.classList.toggle('hidden');

                // Immediately prevent further clicks.
                this.isAllowedToClick = false;
                
                // Set a timer to allow clicks again after a short period (200ms).
                setTimeout(() => {
                    this.isAllowedToClick = true;
                    console.log("%cDebounce period ended. Clicks are now allowed.", "color: green");
                }, 200); 
            });
            
            // --- Other listeners remain the same ---
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

    // Create the one and only instance and attach it to the global window object
    window.authManagerInstance = new AuthManager();

// --- End of Singleton Pattern ---
}
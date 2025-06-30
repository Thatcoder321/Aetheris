

export default function handler(req, res) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `https://aetheris-sigma.vercel.app/api/auth/github/callback`; 
    

    const scope = 'read:user'; 

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

    res.redirect(authUrl);
}
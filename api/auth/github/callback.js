// /api/auth/github/callback.js
import { serialize } from 'cookie';

export default async function handler(req, res) {
    const { code } = req.query;
    if (!code) {
        return res.status(400).redirect('/?error=No-Code');
    }

    try {
        // Exchange the code for a GitHub access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
            }),
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) throw new Error(tokenData.error_description);
        
        const accessToken = tokenData.access_token;

        // The most important step: Set the access token in a secure cookie
        const cookie = serialize('github_access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        res.setHeader('Set-Cookie', cookie);

        // Redirect the user home. They are now logged in.
        res.redirect('/');

    } catch (error) {
        console.error('GitHub Callback Error:', error);
        res.redirect('/?error=Auth-Failed');
    }
}
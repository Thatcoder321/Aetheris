// /api/auth/github/callback.js
import { serialize } from 'cookie';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
        // --- Step 1: Exchange code for GitHub access token (Your working logic) ---
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });
        const tokenData = await tokenResponse.json();
        if (tokenData.error) throw new Error(tokenData.error_description);
        const accessToken = tokenData.access_token;

        // --- Step 2: Use the new token to get the user's GitHub profile ---
        const userResponse = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${accessToken}` },
        });
        const githubUser = await userResponse.json();
        const githubId = githubUser.id; // The user's stable, unique GitHub ID

        // --- Step 3: Silently create their profile in our database ---
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        await supabase.from('profiles').upsert({ id: githubId.toString() }, { onConflict: 'id' });

        // --- Step 4: Store the access token in a secure cookie ---
        const cookie = serialize('github_access_token', accessToken, {
            httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30
        });
        res.setHeader('Set-Cookie', cookie);

        // --- Step 5: Redirect home. Success. ---
        res.redirect('/');

    } catch (error) {
        console.error('Final Auth Callback Error:', error);
        res.status(500).send('Authentication failed.');
    }
}
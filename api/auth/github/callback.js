

import { serialize } from 'cookie';
import { createClient } from '@supabase/supabase-js';
export default async function handler(req, res) {
    const { code } = req.query; 

    if (!code) {
        return res.status(400).send('Error: No code provided');
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    try {
        // --- Exchange the code for an access token ---
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
            }),
        });

        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            throw new Error(tokenData.error_description);
        }

        const accessToken = tokenData.access_token;

        // --- Store the access token in a secure, httpOnly cookie ---
        const cookie = serialize('github_access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30 
        });

        res.setHeader('Set-Cookie', cookie);


        res.redirect('/?github_auth=success');

    } catch (error) {
        console.error('GitHub auth callback error:', error);
        res.status(500).send('Authentication failed.');
    }
}
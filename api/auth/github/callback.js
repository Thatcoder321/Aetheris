

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
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const { code } = req.query;

  if (code) {
    // On the server, we create a privileged client using our secret Service Key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY // This key has admin rights
    );

    try {
      // Exchange the user's code for a session
      await supabaseAdmin.auth.exchangeCodeForSession(String(code));
    } catch (error) {
      console.error("Server-side auth error:", error);
      // If it fails, just send the user home.
      return res.redirect('/');
    }
  }

  // On success, redirect the user back to the Aetheris homepage.
  // The browser will now have the correct session cookie.
  res.redirect('/');
};
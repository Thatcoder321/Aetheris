

import { serialize } from 'cookie';

export default function handler(req, res) {

    const cookie = serialize('github_access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        path: '/',
        expires: new Date(0), // Set expiry date to the past
    });

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ message: 'Logged out successfully' });
}
import { serialize } from 'cookie';
export default function handler(req, res) {
    const cookie = serialize('github_access_token', '', { path: '/', expires: new Date(0) });
    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ message: 'Logged out' });
}
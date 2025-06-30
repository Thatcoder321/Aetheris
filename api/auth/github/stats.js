

export default async function handler(req, res) {
    const accessToken = req.cookies.github_access_token;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data from GitHub.');
        }

        const userData = await userResponse.json();
        

        
        res.status(200).json({
            avatar_url: userData.avatar_url,
            name: userData.name,
            login: userData.login,
            public_repos: userData.public_repos,
            followers: userData.followers,
        });

    } catch (error) {
        console.error('GitHub stats error:', error);
        res.status(500).json({ error: 'Failed to fetch GitHub stats.' });
    }
}
import { createServerClient } from '@supabase/auth-helpers-nextjs'; 

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const supabase = createServerClient({ req, res });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { aetheris_config } = req.body;

    const { error } = await supabase
        .from('profiles')
        .update({ aetheris_config: aetheris_config, updated_at: new Date() })
        .eq('id', user.id);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ message: 'State saved.' });
}
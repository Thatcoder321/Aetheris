// /api/state.js
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
    const supabase = createServerClient({ req, res });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return res.status(401).json({ error: 'You must be logged in to manage your state.' });
    }

    // --- The "Router" Logic ---
    if (req.method === 'POST') {
        // --- HANDLE SAVING STATE ---
        const { aetheris_config } = req.body;
        if (!aetheris_config) return res.status(400).json({ error: 'No config provided to save.' });

        const { error } = await supabase
            .from('profiles')
            .update({ aetheris_config: aetheris_config, updated_at: new Date() })
            .eq('id', user.id);

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'Dashboard state saved.' });

    } else if (req.method === 'GET') {
        // --- HANDLE LOADING STATE ---
        const { data, error } = await supabase
            .from('profiles')
            .select('aetheris_config')
            .eq('id', user.id)
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data.aetheris_config || {});
    }

    // If the method is not GET or POST, deny it.
    return res.status(405).json({ error: 'Method Not Allowed' });
}
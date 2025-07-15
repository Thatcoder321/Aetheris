import {createServerClient} from '@supabase/auth-helpers-nextjs';

export default async function handler(req,res) {
    const supabase = createServerClient({req, res});
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { data, error } = await supabase
        .from('profiles')
        .select('aetheris_config')
        .eq('id', user.id)
        .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data.aetheris_config || {});
        
}
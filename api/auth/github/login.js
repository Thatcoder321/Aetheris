
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  );

 
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
    
      redirectTo: 'https://aetheris-sigma.vercel.app', 
    },
  });

  if (error) {
    console.error('Error creating auth URL:', error);
    return res.status(500).json({ error: error.message });
  }


  res.redirect(302, data.url);
}
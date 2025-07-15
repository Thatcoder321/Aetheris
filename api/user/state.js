import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    console.log('API called with method:', req.method);
    console.log('Environment check:', {
      hasUrl: !!process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    console.log('User auth result:', { user: user?.id, error: error?.message });
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    if (req.method === 'GET') {
      console.log('GET request for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('aetheris_config')
        .eq('id', user.id)
        .single()
      
      console.log('Database GET result:', { data: !!data, error: error?.message });
      
      if (error) {
        console.error('Database error:', error);
        if (error.code === 'PGRST116') {
          // No rows found
          return res.status(404).json({ error: 'No state found' })
        }
        return res.status(500).json({ error: 'Database error: ' + error.message })
      }
      
      return res.json(data?.aetheris_config || {})
    }
    
    if (req.method === 'POST') {
      const { aetheris_config } = req.body
      console.log('POST request for user:', user.id, 'with config keys:', Object.keys(aetheris_config || {}));
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          aetheris_config: aetheris_config
        })
      
      console.log('Database POST result:', { error: error?.message });
      
      if (error) {
        console.error('Supabase upsert error:', error)
        return res.status(500).json({ error: 'Failed to save state: ' + error.message })
      }
      
      return res.json({ success: true })
    }
    
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
    
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error: ' + error.message })
  }
}
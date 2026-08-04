import { createClient } from '@supabase/supabase-js'

// Every table for this app lives in the `ltf` schema of the shared Outlaw Apps
// project. Nothing here belongs in `public`.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: 'ltf' } }
)

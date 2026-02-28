import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first, then .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️  VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Check your .env file.');
}

// Server-side Supabase client (uses anon key, relies on RLS + user JWT)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a Supabase client scoped to a specific user's JWT token
export function createSupabaseClient(accessToken: string) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
}

import 'cross-fetch/dist/node-polyfill.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
console.log('--- 调试开始 ---');
console.log('URL:', process.env.SUPABASE_URL);
console.log('KEY 内容:', JSON.stringify(process.env.SUPABASE_ANON_KEY));
console.log('KEY 长度:', process.env.SUPABASE_ANON_KEY ? process.env.SUPABASE_ANON_KEY.length : '未定义');
console.log('--- 调试结束 ---');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Load .env.local first, then .env as fallback
dotenv.config({ path: path.resolve(rootDir, '.env.local') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️  SUPABASE_URL or SUPABASE_ANON_KEY is not set. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('URL:', process.env.SUPABASE_URL);
console.log('Key Length:', process.env.SUPABASE_ANON_KEY?.length);
export function createSupabaseClient(accessToken) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
}

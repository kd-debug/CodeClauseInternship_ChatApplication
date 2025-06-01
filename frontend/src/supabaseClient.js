import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anonymous Key is missing. Make sure you have set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY in your .env file in the frontend directory.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
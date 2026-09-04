import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://msqcwcfehflyyhgztsxg.supabase.co';
const supabaseAnonKey = 'sb_publishable_N7OMoGL7bE5Y1zUcj0Z26A_6A5a_wUp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

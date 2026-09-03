import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://msqcwcfehflyyhgztsxg.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_N7OMoGL7bE5Y1zUcj0Z26A_6A5a_wUp";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

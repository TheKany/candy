import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase server environment variables");
}

export const supabaseServer = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string
);

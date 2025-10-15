import { createClient } from "@supabase/supabase-js";

// GANTI DENGAN URL & KEY ANDA!
const supabaseUrl = "https://tdvyltwuhyfyexedubed.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkdnlsdHd1aHlmeWV4ZWR1YmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTc1NTgsImV4cCI6MjA3NjAzMzU1OH0.JmuG3mgMVwwvOARbWE5tdR2m6u-qxu7Q4s6tW_K9NR0";

export const supabase = createClient(supabaseUrl, supabaseKey);

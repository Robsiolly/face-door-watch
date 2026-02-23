import { createClient } from '@supabase/supabase-js';

// Substitua pelas suas credenciais do Supabase
// Você pode encontrá-las em: Project Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anon-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

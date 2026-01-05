import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rslwzlxhswtuneqpvqsr.supabase.co';
const supabaseAnonKey = 'sb_publishable_F959SpaGgFdeUmCpGNbpdA_2qMTz40o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

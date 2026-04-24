import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 优先加载 .env.local
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 SUPABASE_URL 或 SUPABASE_KEY 环境变量');
}

export const supabase = createClient(supabaseUrl!, supabaseKey!);

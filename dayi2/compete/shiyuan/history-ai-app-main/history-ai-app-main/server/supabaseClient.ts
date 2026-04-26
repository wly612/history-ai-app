import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 优先加载 .env.local
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKeyEntries = [
  ['SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY],
  ['SUPABASE_ANON_KEY', process.env.SUPABASE_ANON_KEY],
  ['SUPABASE_KEY', process.env.SUPABASE_KEY],
] as const;

const supabaseKeyEntry = supabaseKeyEntries.find(([, value]) => value?.trim());
const supabaseKeyName = supabaseKeyEntry?.[0];
const supabaseKey = supabaseKeyEntry?.[1]?.trim();

function maskKey(key: string) {
  if (key.length <= 12) return '***';
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '缺少 Supabase 配置。请在 .env 或 .env.local 中设置 SUPABASE_URL，并设置 SUPABASE_SERVICE_ROLE_KEY（推荐）或 SUPABASE_ANON_KEY。'
  );
}

console.log(`[Supabase] URL loaded: ${supabaseUrl}`);
console.log(`[Supabase] Key loaded from ${supabaseKeyName}: ${maskKey(supabaseKey)}`);

export function explainSupabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String((error as any)?.message || error);

  if (/invalid api key/i.test(message)) {
    return `Supabase API key 无效。当前后端读取的是 ${supabaseKeyName}，请到 Supabase Project Settings > API 复制新的 service_role key（推荐）或 anon public key，更新 .env 后重启 npm run dev。`;
  }

  return message;
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

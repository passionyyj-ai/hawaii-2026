// Hawaii 2026 v14 — Supabase Edge Function 설정
// Verify JWT가 OFF인 현재 구성에서는 anon key를 비워도 동작합니다.
// OpenAI API 키는 반드시 Supabase Secrets에만 보관하세요.
window.HAWAII_CONFIG = {
  supabaseFunctionUrl: "https://fjpczzjrzxsyqolwfebh.supabase.co/functions/v1/translate",
  supabaseAnonKey: ""
};

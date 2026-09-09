import { createClient } from "@supabase/supabase-js";

// Keep one browser-safe client for the entire app. Only the publishable/anon
// key is used here; a service_role key must never be shipped to the browser.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ckuiskbegrlrethnlhzq.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_RnrbgHC56vWK6cSA1hmfkA_VVP74VPL";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "localplatform-auth",
  },
});

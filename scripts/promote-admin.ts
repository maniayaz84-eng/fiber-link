/**
 * Local helper: promote an existing auth user to admin.
 * Never hardcode emails or passwords. Uses the server-only service role key.
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts USER_UUID
 */
import { createClient } from "@supabase/supabase-js";

const userId = process.argv[2];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!userId || userId === "YOUR_USER_UUID") {
  console.error("Pass the existing user's UUID. Example: npx tsx scripts/promote-admin.ts 11111111-1111-1111-1111-111111111111");
  process.exit(1);
}

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment first.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await supabase.from("user_roles").upsert({
  user_id: userId,
  role: "admin",
});

if (error) {
  console.error("Could not promote user:", error.message);
  process.exit(1);
}

console.log("User promoted to admin:", userId);

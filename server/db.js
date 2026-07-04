const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "../.env" });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("\n❌ Missing Supabase credentials!");
  console.error("   Copy .env.example → .env and fill in:");
  console.error("   SUPABASE_URL=https://your-project.supabase.co");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n");
  process.exit(1);
}

const supabase = createClient(url, key);

module.exports = supabase;

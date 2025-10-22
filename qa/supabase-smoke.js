/*
 * בדיקת עשן ל-Supabase API
 * בודק שכל הטבלאות הקריטיות נגישות
 */
const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('❌ חסרים משתני סביבה: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const sb = createClient(url, key);

(async () => {
  let fail = 0;

  console.log('🧪 בודק Supabase tables...\n');

  async function check(table, limit = 1) {
    try {
      const { data, error } = await sb.from(table).select('*').limit(limit);
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
        fail++;
      } else {
        console.log(`✓ ${table} (${data?.length || 0} rows)`);
      }
    } catch (e) {
      console.error(`❌ ${table}: ${e.message}`);
      fail++;
    }
  }

  // בדיקת טבלאות קריטיות
  await check('profiles');
  await check('businesses');
  await check('employees');
  await check('products');
  await check('production_batches');
  await check('raw_material_receipts');
  await check('production_materials');
  await check('quality_checks');
  await check('cleaning_logs');
  await check('production_equipment');
  await check('equipment_maintenance');

  console.log(`\n📊 סיכום: ${fail === 0 ? 'כל הטבלאות תקינות ✅' : `${fail} שגיאות נמצאו ❌`}`);
  process.exit(fail ? 1 : 0);
})();

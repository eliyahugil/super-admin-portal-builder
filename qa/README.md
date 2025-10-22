# AllForYou QA - מערכת בדיקות מקיפה

## 🎯 מטרה
לוודא שאין קישורים/כפתורים שבורים, ניתובים מתים, או פעולות שלא מגיבות במערכת AllForYou.

## 📋 רשימת בדיקות

### 1. בדיקת נתיבים (route-smoke.js)
בודק שכל הנתיבים הידועים נטענים ללא 404/500.

```bash
npm run test:routes
```

או עם URL מותאם:
```bash
AFY_BASE_URL="https://allforyou.co.il" node qa/route-smoke.js
```

### 2. סורק קישורים (link-crawler.js)
זוחל באתר, לוחץ על קישורים וכפתורים, ומזהה:
- שגיאות HTTP (404, 500)
- שגיאות JavaScript בקונסול
- Promises לא מטופלות
- קישורים ריקים או שבורים

```bash
npm run test:links
```

עם אימות:
```bash
AFY_BASE_URL="https://allforyou.co.il" \
AFY_EMAIL="your@email.com" \
AFY_PASSWORD="your-password" \
AFY_MAX_PAGES=200 \
node qa/link-crawler.js
```

### 3. בדיקת Supabase (supabase-smoke.js)
בודק שכל הטבלאות הקריטיות נגישות ותקינות.

```bash
# מקומי (משתמש ב-.env)
node qa/supabase-smoke.js

# עם משתנים מפורשים
VITE_SUPABASE_URL="..." \
VITE_SUPABASE_PUBLISHABLE_KEY="..." \
node qa/supabase-smoke.js
```

### 4. Cypress E2E
בדיקות UI אוטומטיות מלאות.

```bash
# בדיקות אינטראקטיביות
npx cypress open

# הרצה ב-CI
npx cypress run
```

## 📊 דוחות

כל ההרצות מייצרות דוחות ב-`qa-report/`:
- `link-crawler.json` - דוח מלא של הסריקה
- `http-errors.csv` - שגיאות HTTP בפורמט CSV
- `cypress/screenshots` - צילומי מסך של כישלונות
- `cypress/videos` - וידאו של כל הבדיקות

## 🔧 Runtime Guards

המערכת כוללת guards אוטומטיים שרצים בזמן ייצור:
- **לוכד קישורים שבורים** - מזהה `<a href="#">` או href ריק
- **לוכד Promises לא מטופלות** - רושם ל-console כל rejection
- **Error Boundary** - מציג מסך שגיאה במקום קריסה מלאה

## 🚀 CI/CD

GitHub Actions מריץ אוטומטית את כל הבדיקות בכל push/PR.
ראה `.github/workflows/qa.yml` לפרטים.

## 📝 הוספת בדיקות חדשות

### נתיב חדש
הוסף ל-`ROUTES` בקבצים:
- `qa/route-smoke.js`
- `cypress/e2e/smoke.cy.ts`

### טבלת Supabase חדשה
הוסף `await check('table_name')` ב-`qa/supabase-smoke.js`

## 🎯 יעדי Success

✅ 0 שגיאות HTTP (4xx/5xx)  
✅ 0 שגיאות JavaScript  
✅ כל הנתיבים נטענים  
✅ כל הטבלאות נגישות  
✅ כל הכפתורים מגיבים  

## 🔍 טיפים לדיבאג

1. **שגיאות HTTP רבות**: בדוק RLS policies ב-Supabase
2. **Console errors**: הרץ `npm run dev` ובדוק ב-DevTools
3. **Cypress failures**: הסתכל ב-screenshots ו-videos
4. **Timeout**: הגדל timeout או בדוק ביצועים

## 📚 תיעוד נוסף

- [Playwright Docs](https://playwright.dev)
- [Cypress Docs](https://docs.cypress.io)
- [Supabase Testing](https://supabase.com/docs/guides/testing)


export const integrationFieldMap: {
  [key: string]: {
    label: string
    fields: { key: string; label: string; type?: string; placeholder?: string }[]
  }
} = {
  whatsapp: {
    label: 'WhatsApp Cloud API',
    fields: [
      { key: 'token', label: 'Access Token', type: 'password', placeholder: 'הזן את ה-Access Token מ-Meta' },
      { key: 'phone_number_id', label: 'Phone Number ID', placeholder: 'מזהה מספר הטלפון' },
      { key: 'verify_token', label: 'Verify Token', placeholder: 'טוקן אימות לWebhook' },
    ],
  },
  facebook_leads: {
    label: 'Facebook Leads API',
    fields: [
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Page Access Token מ-Facebook' },
      { key: 'page_id', label: 'Page ID', placeholder: 'מזהה הדף בפייסבוק' },
      { key: 'form_id', label: 'Form ID', placeholder: 'מזהה הטופס (אופציונלי)' },
    ],
  },
  icount: {
    label: 'iCount חשבוניות',
    fields: [
      { key: 'username', label: 'שם משתמש', placeholder: 'שם המשתמש ב-iCount' },
      { key: 'password', label: 'סיסמה', type: 'password', placeholder: 'סיסמת המשתמש' },
      { key: 'entity_id', label: 'קוד מוסד', placeholder: 'קוד המוסד ב-iCount' },
    ],
  },
  maps: {
    label: 'Google Maps API',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'מפתח Google Maps API' },
      { key: 'region', label: 'אזור ברירת מחדל', placeholder: 'IL' },
    ],
  },
  invoicing: {
    label: 'מערכת חשבוניות',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'מפתח API למערכת החשבוניות' },
      { key: 'company_id', label: 'מזהה חברה', placeholder: 'מזהה החברה במערכת' },
    ],
  },
  communication: {
    label: 'מערכת תקשורת',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'מפתח API למערכת התקשורת' },
      { key: 'sender_id', label: 'מזהה שולח', placeholder: 'מזהה השולח' },
    ],
  },
};

export const getIntegrationConfig = (integrationName: string) => {
  return integrationFieldMap[integrationName] || null;
};

-- Add WhatsApp as a global integration option
INSERT INTO global_integrations (
  integration_name,
  display_name,
  description,
  is_active,
  is_global
) VALUES (
  'whatsapp',
  'WhatsApp Business',
  'התחברות ישירה ל-WhatsApp Business לשליחה וקבלת הודעות',
  true,
  true
) ON CONFLICT (integration_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  is_global = EXCLUDED.is_global;
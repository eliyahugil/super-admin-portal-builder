-- Add WhatsApp Business to supported_integrations
INSERT INTO supported_integrations (
  integration_name,
  display_name,
  description,
  category,
  icon,
  requires_global_key,
  requires_business_credentials,
  is_active,
  credential_fields
) VALUES (
  'whatsapp',
  'WhatsApp Business',
  'התחברות ישירה ל-WhatsApp Business באמצעות QR Code',
  'communication',
  '📱',
  false,
  false,
  true,
  '[]'::jsonb
) ON CONFLICT (integration_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  requires_global_key = EXCLUDED.requires_global_key,
  requires_business_credentials = EXCLUDED.requires_business_credentials,
  is_active = EXCLUDED.is_active;
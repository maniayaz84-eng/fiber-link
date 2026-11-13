-- DEMO DATA ONLY. Replace these packages with real Fiber Link offers before launch.
-- Prices below are placeholders, not real Fiber Link prices.

insert into public.packages (
  name,
  slug,
  description,
  download_speed_mbps,
  upload_speed_mbps,
  monthly_price_pkr,
  installation_fee_pkr,
  billing_period,
  data_limit_label,
  features,
  is_popular,
  is_active,
  is_demo,
  display_order
) values
(
  'Demo Home 20',
  'demo-home-20',
  'DEMO package for local testing only. Replace with a real Fiber Link offer.',
  20,
  10,
  2500,
  0,
  'monthly',
  'Unlimited',
  '["DEMO content", "Replace before launch", "Home use example"]'::jsonb,
  false,
  true,
  true,
  10
),
(
  'Demo Family 50',
  'demo-family-50',
  'DEMO package for local testing only. Replace with a real Fiber Link offer.',
  50,
  25,
  4500,
  0,
  'monthly',
  'Unlimited',
  '["DEMO content", "Replace before launch", "Family use example"]'::jsonb,
  true,
  true,
  true,
  20
),
(
  'Demo Business 100',
  'demo-business-100',
  'DEMO package for local testing only. Replace with a real Fiber Link offer.',
  100,
  50,
  8000,
  0,
  'monthly',
  'Unlimited',
  '["DEMO content", "Replace before launch", "Business use example"]'::jsonb,
  false,
  true,
  true,
  30
);

insert into public.app_settings (key, value, is_public) values
(
  'contact',
  '{
    "company_name": "Fiber Link",
    "phone": null,
    "whatsapp": null,
    "email": null,
    "address": null,
    "support_hours": null
  }'::jsonb,
  true
),
(
  'coverage',
  '{
    "summary": "Service-area details will appear here after Fiber Link configures them in Admin Settings.",
    "areas": []
  }'::jsonb,
  true
),
(
  'why_choose',
  '{
    "items": [
      {"title": "Clear request tracking", "body": "See the status of your subscription request from your dashboard."},
      {"title": "Human verification", "body": "Payment screenshots are reviewed by Fiber Link staff before a request is marked active."},
      {"title": "English and Roman Urdu", "body": "Use the language that is easier for you."}
    ]
  }'::jsonb,
  true
),
(
  'faq',
  '{
    "items": [
      {"q": "Does uploading a screenshot turn on my internet?", "a": "No. A screenshot only starts a review. An authorized admin must approve the payment in this app."},
      {"q": "What does Active mean?", "a": "Active means Fiber Link approved the subscription request in this website. It does not by itself provision your router or ISP line."},
      {"q": "How do I pay?", "a": "Follow the payment instructions shown after you submit a request. Those details are configured by Fiber Link and are not hardcoded."}
    ]
  }'::jsonb,
  true
),
(
  'payment_instructions',
  '{
    "configured": false,
    "methods": [],
    "notes": "Payment account details have not been configured yet. Fiber Link will add bank or wallet instructions in Admin Settings."
  }'::jsonb,
  false
)
on conflict (key) do nothing;

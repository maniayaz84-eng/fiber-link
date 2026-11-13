export type Language = "en" | "roman_ur";
export type UserRole = "customer" | "admin";

export type SubscriptionStatus =
  | "draft"
  | "pending_payment"
  | "payment_submitted"
  | "under_review"
  | "active"
  | "rejected"
  | "cancelled"
  | "expired";

export type PaymentStatus =
  | "not_submitted"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  preferred_language: Language;
  created_at: string;
  updated_at: string;
};

export type Package = {
  id: string;
  name: string;
  slug: string;
  description: string;
  download_speed_mbps: number;
  upload_speed_mbps: number | null;
  monthly_price_pkr: number;
  installation_fee_pkr: number | null;
  billing_period: string;
  data_limit_label: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  is_archived: boolean;
  is_demo: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  reference_code: string;
  user_id: string;
  package_id: string | null;
  package_name_snapshot: string;
  download_speed_snapshot: number;
  monthly_price_pkr_snapshot: number;
  customer_name: string;
  customer_phone: string;
  installation_address: string;
  city: string;
  notes: string | null;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
};

export type PaymentSubmission = {
  id: string;
  subscription_id: string;
  user_id: string;
  amount_pkr: number;
  payment_method: string;
  transaction_reference: string | null;
  proof_storage_path: string;
  status: PaymentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

export type AppSetting = {
  key: string;
  value: Record<string, unknown>;
  is_public: boolean;
  updated_at: string;
  updated_by: string | null;
};

export type ContactSettings = {
  company_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  support_hours: string | null;
};

export type PaymentInstructions = {
  configured: boolean;
  methods: Array<{ name: string; details: string }>;
  notes: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      packages: { Row: Package; Insert: Partial<Package>; Update: Partial<Package> };
      subscriptions: { Row: Subscription; Insert: Partial<Subscription>; Update: Partial<Subscription> };
      payment_submissions: {
        Row: PaymentSubmission;
        Insert: Partial<PaymentSubmission>;
        Update: Partial<PaymentSubmission>;
      };
      app_settings: { Row: AppSetting; Insert: Partial<AppSetting> & { key: string }; Update: Partial<AppSetting> };
      user_roles: {
        Row: { user_id: string; role: UserRole; created_at: string };
        Insert: { user_id: string; role: UserRole };
        Update: { role?: UserRole };
      };
    };
  };
};

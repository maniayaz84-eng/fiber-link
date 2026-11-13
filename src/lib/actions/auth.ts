"use server";

import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validations";

export type AuthActionState = {
  error: string | null;
};

export async function loginAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  try {
    const raw = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: "Please enter a valid email and password." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { error: error.message };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Unable to load your session. Please try again." };
    }

    const role = await getUserRole(user.id);
    redirect(role === "admin" ? "/admin" : "/dashboard");
  } catch {
    return { error: "Supabase is not configured yet. Add your .env.local values before signing in." };
  }
}

export async function signupAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  try {
    const raw = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      password: String(formData.get("password") ?? ""),
      language: String(formData.get("language") ?? "en"),
    };

    const parsed = signupSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: "Please complete all required signup fields correctly." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
          preferred_language: parsed.data.language,
          phone: parsed.data.phone,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user && !data.session) {
      redirect("/login?message=Check+your+email+to+confirm+your+account");
    }

    redirect("/dashboard");
  } catch {
    return { error: "Supabase is not configured yet. Add your .env.local values before creating an account." };
  }
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore local configuration issues and redirect to the public landing page.
  }
  redirect("/");
}

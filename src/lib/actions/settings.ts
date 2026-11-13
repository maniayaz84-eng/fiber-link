"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LANG_COOKIE, isLanguage } from "@/lib/i18n";

export async function setLanguageAction(formData: FormData) {
  const language = String(formData.get("language") ?? "");
  if (!isLanguage(language)) {
    return;
  }

  const store = await cookies();
  store.set(LANG_COOKIE, language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}

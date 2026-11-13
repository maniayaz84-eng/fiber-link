import { cookies } from "next/headers";
import type { Language } from "@/types/database";
import { dictionaries, getDictionary, type Dictionary } from "./dictionaries";

export const LANG_COOKIE = "fiber-link-lang";

export function isLanguage(value: string | undefined | null): value is Language {
  return value === "en" || value === "roman_ur";
}

export async function getLanguage(): Promise<Language> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return isLanguage(value) ? value : "en";
}

export async function getT(): Promise<{ lang: Language; t: Dictionary }> {
  const lang = await getLanguage();
  return { lang, t: getDictionary(lang) };
}

export { dictionaries, getDictionary };
export type { Dictionary };

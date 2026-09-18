"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function entrar(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");
  const redirectPara = String(formData.get("redirect") || "/painel/dashboard");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    redirect(`/login?erro=${encodeURIComponent("E-mail ou senha incorretos")}`);
  }

  redirect(redirectPara);
}

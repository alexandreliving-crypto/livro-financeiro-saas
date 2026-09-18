"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function cadastrar(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const senha = String(formData.get("senha") || "");
  const nome = String(formData.get("nome") || "").trim();
  const nomeFamilia = String(formData.get("nomeFamilia") || "").trim();

  if (!email || !senha || senha.length < 8) {
    redirect("/cadastro?erro=Preencha email e uma senha com 8+ caracteres");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome, nome_familia: nomeFamilia || `Família ${nome}` },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/cadastro?erro=${encodeURIComponent(error.message)}`);
  }

  redirect("/cadastro/verifique-seu-email");
}

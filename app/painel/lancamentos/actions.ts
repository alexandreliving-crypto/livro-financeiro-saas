"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function familiaDoUsuarioLogado() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("familia_id")
    .eq("id", user.id)
    .single();
  if (!perfil) throw new Error("Perfil não encontrado");

  return { supabase, familiaId: perfil.familia_id as string };
}

export async function adicionarEntrada(formData: FormData) {
  const { supabase, familiaId } = await familiaDoUsuarioLogado();

  await supabase.from("entradas").insert({
    familia_id: familiaId,
    categoria: String(formData.get("categoria")),
    valor: Number(formData.get("valor")),
    data: String(formData.get("data")),
    observacao: String(formData.get("observacao") || "") || null,
  });

  revalidatePath("/painel/lancamentos");
}

export async function adicionarDespesa(formData: FormData) {
  const { supabase, familiaId } = await familiaDoUsuarioLogado();

  await supabase.from("despesas").insert({
    familia_id: familiaId,
    categoria: String(formData.get("categoria")),
    descricao: String(formData.get("descricao")),
    valor: Number(formData.get("valor")),
    data: String(formData.get("data")),
    observacao: String(formData.get("observacao") || "") || null,
  });

  revalidatePath("/painel/lancamentos");
}

export async function removerEntrada(id: string) {
  const { supabase } = await familiaDoUsuarioLogado();
  await supabase.from("entradas").delete().eq("id", id);
  revalidatePath("/painel/lancamentos");
}

export async function removerDespesa(id: string) {
  const { supabase } = await familiaDoUsuarioLogado();
  await supabase.from("despesas").delete().eq("id", id);
  revalidatePath("/painel/lancamentos");
}

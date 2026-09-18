import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, familias(nome)")
    .eq("id", user.id)
    .single();

  const nomeFamilia = (perfil?.familias as unknown as { nome: string } | null)?.nome;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <span className="font-bold">Livro Financeiro{nomeFamilia ? ` — ${nomeFamilia}` : ""}</span>
        <nav className="flex items-center gap-2 text-sm">
          <a href="/painel/lancamentos" className="text-ink-soft hover:text-ink px-3 py-1.5">
            Lançamentos
          </a>
          <a href="/painel/dashboard" className="text-ink-soft hover:text-ink px-3 py-1.5">
            Resumo
          </a>
          <a href="/painel/assinatura" className="text-ink-soft hover:text-ink px-3 py-1.5">
            Assinatura
          </a>
          <form action="/api/logout" method="POST">
            <button type="submit" className="btn-ghost !py-1.5 !px-3">
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

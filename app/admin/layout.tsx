import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!perfil?.is_admin) redirect("/painel/dashboard");

  return (
    <div className="min-h-screen">
      <header className="border-b border-line px-6 py-4 flex items-center justify-between">
        <span className="font-bold">Painel administrativo</span>
        <nav className="flex items-center gap-2 text-sm">
          <a href="/admin" className="text-ink-soft hover:text-ink px-3 py-1.5">
            Visão geral
          </a>
          <a href="/admin/pagamentos" className="text-ink-soft hover:text-ink px-3 py-1.5">
            Pagamentos
          </a>
          <a href="/painel/dashboard" className="text-ink-soft hover:text-ink px-3 py-1.5">
            Meu painel
          </a>
          <form action="/api/logout" method="POST">
            <button type="submit" className="btn-ghost !py-1.5 !px-3">
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

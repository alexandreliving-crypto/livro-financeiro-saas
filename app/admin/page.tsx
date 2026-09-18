import { createServiceRoleClient } from "@/lib/supabase/server";

const ROTULOS: Record<string, { texto: string; cor: string }> = {
  ativa: { texto: "Ativa", cor: "text-income" },
  trial: { texto: "Aguardando pagamento", cor: "text-gold" },
  atrasada: { texto: "Atrasada", cor: "text-expense" },
  cancelada: { texto: "Cancelada", cor: "text-ink-soft" },
};

function formatarBRL(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Assinatura = {
  status: string;
  created_at: string;
  planos: { nome: string; preco_centavos: number; intervalo: string } | null;
};
type Familia = {
  id: string;
  nome: string;
  created_at: string;
  assinaturas: Assinatura[];
};

export default async function AdminPage() {
  // Usa a chave de serviço de propósito: o admin precisa ver TODAS as
  // famílias, e a RLS normal restringiria só à própria família dele.
  const service = createServiceRoleClient();

  const { data: familias } = await service
    .from("familias")
    .select("id, nome, created_at, assinaturas(status, created_at, planos(nome, preco_centavos, intervalo))")
    .order("created_at", { ascending: false });

  const linhas = ((familias ?? []) as Familia[]).map((f) => {
    const maisRecente = [...(f.assinaturas ?? [])].sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    )[0];
    return { ...f, assinatura: maisRecente };
  });

  const ativas = linhas.filter((l) => l.assinatura?.status === "ativa");
  const mrrCentavos = ativas.reduce((soma, l) => {
    const plano = l.assinatura!.planos;
    if (!plano) return soma;
    const mensalEquivalente =
      plano.intervalo === "mensal" ? plano.preco_centavos : Math.round(plano.preco_centavos / 12);
    return soma + mensalEquivalente;
  }, 0);

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <p className="text-xs text-ink-soft mb-2">Famílias cadastradas</p>
          <p className="text-xl font-bold">{linhas.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-ink-soft mb-2">Assinaturas ativas</p>
          <p className="text-xl font-bold text-income">{ativas.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-ink-soft mb-2">Receita recorrente mensal (MRR)</p>
          <p className="text-xl font-bold text-gold">{formatarBRL(mrrCentavos)}</p>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="text-left text-xs text-ink-soft border-b border-line">
              <th className="px-4 py-3">Família</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cliente desde</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{l.nome}</td>
                <td className="px-4 py-3">{l.assinatura?.planos?.nome ?? "—"}</td>
                <td
                  className={`px-4 py-3 font-medium ${
                    l.assinatura ? ROTULOS[l.assinatura.status]?.cor : "text-ink-soft"
                  }`}
                >
                  {l.assinatura ? ROTULOS[l.assinatura.status]?.texto : "Sem assinatura"}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {new Date(l.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {linhas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-soft">
                  Nenhuma família cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

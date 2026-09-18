import { createClient } from "@/lib/supabase/server";

const ROTULOS: Record<string, { texto: string; cor: string }> = {
  ativa: { texto: "Ativa", cor: "text-income" },
  trial: { texto: "Aguardando confirmação de pagamento", cor: "text-gold" },
  atrasada: { texto: "Pagamento atrasado", cor: "text-expense" },
  cancelada: { texto: "Cancelada", cor: "text-ink-soft" },
};

export default async function AssinaturaPage() {
  const supabase = await createClient();
  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("status, created_at, periodo_atual_fim, planos(nome, preco_centavos, intervalo)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const plano = assinatura?.planos as unknown as { nome: string; preco_centavos: number; intervalo: string } | null;
  const rotulo = assinatura ? ROTULOS[assinatura.status] : null;

  return (
    <div className="max-w-md">
      <h1 className="text-lg font-bold mb-6">Sua assinatura</h1>
      {assinatura ? (
        <div className="card">
          <p className="text-sm text-ink-soft mb-1">Plano</p>
          <p className="font-semibold mb-4">{plano?.nome}</p>
          <p className="text-sm text-ink-soft mb-1">Status</p>
          <p className={`font-semibold mb-4 ${rotulo?.cor}`}>{rotulo?.texto}</p>
          {assinatura.status === "trial" && (
            <p className="text-xs text-ink-soft">
              Pode levar alguns instantes até a confirmação chegar do Mercado Pago. Atualize a
              página em breve.
            </p>
          )}
        </div>
      ) : (
        <div className="card">
          <p className="text-sm text-ink-soft mb-4">Você ainda não tem uma assinatura ativa.</p>
          <a href="/" className="btn-primary inline-block">
            Ver planos
          </a>
        </div>
      )}
    </div>
  );
}

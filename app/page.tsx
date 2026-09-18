import { createClient } from "@/lib/supabase/server";

type Plano = {
  id: string;
  nome: string;
  preco_centavos: number;
  intervalo: string;
  descricao: string | null;
  recursos: string[];
  destaque: boolean;
};

function formatarPreco(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: planos } = await supabase
    .from("planos")
    .select("id, nome, preco_centavos, intervalo, descricao, recursos, destaque")
    .eq("ativo", true)
    .order("preco_centavos", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <header className="text-center mb-14">
        <h1 className="text-3xl font-bold mb-3">Livro Financeiro da Família</h1>
        <p className="text-ink-soft text-lg">
          Controle de entradas e despesas, do jeito que a sua família precisa.
        </p>
        <div className="mt-6">
          {user ? (
            <a href="/painel/dashboard" className="btn-primary">
              Ir para o painel
            </a>
          ) : (
            <a href="/login" className="text-sm text-ink-soft hover:text-ink underline">
              Já sou cliente — entrar
            </a>
          )}
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        {(planos as Plano[] | null)?.map((plano) => (
          <div
            key={plano.id}
            className={`card flex flex-col ${
              plano.destaque ? "border-gold ring-1 ring-gold/40" : ""
            }`}
          >
            {plano.destaque && (
              <span className="text-xs font-semibold text-gold mb-2 uppercase tracking-wide">
                Mais recomendado
              </span>
            )}
            <h2 className="text-xl font-bold mb-1">{plano.nome}</h2>
            <p className="text-2xl font-bold mb-1">
              {formatarPreco(plano.preco_centavos)}
              <span className="text-sm text-ink-soft font-normal">
                {" "}
                /{plano.intervalo === "mensal" ? "mês" : "ano"}
              </span>
            </p>
            <p className="text-sm text-ink-soft mb-5">{plano.descricao}</p>
            <ul className="text-sm space-y-2 mb-6 flex-1">
              {(plano.recursos ?? []).map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-income mt-0.5">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <form action="/api/checkout" method="POST">
              <input type="hidden" name="planoId" value={plano.id} />
              <button type="submit" className="btn-primary w-full">
                Assinar {plano.nome}
              </button>
            </form>
          </div>
        ))}
      </section>
    </main>
  );
}

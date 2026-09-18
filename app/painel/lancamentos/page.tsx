import { createClient } from "@/lib/supabase/server";
import { adicionarEntrada, adicionarDespesa, removerEntrada, removerDespesa } from "./actions";

const CATEGORIAS_ENTRADA = ["Salário", "Investimento", "Apartamentos"];
const CATEGORIAS_DESPESA = ["Moradia", "Alimentação", "Transporte", "Saúde", "Educação", "Lazer", "Outros"];

function formatarBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default async function LancamentosPage() {
  const supabase = await createClient();

  const [{ data: entradas }, { data: despesas }] = await Promise.all([
    supabase.from("entradas").select("*").order("data", { ascending: false }).limit(50),
    supabase.from("despesas").select("*").order("data", { ascending: false }).limit(50),
  ]);

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-lg font-bold mb-1">Entradas</h1>
        <p className="text-sm text-ink-soft mb-4">Salário, investimentos e aluguéis recebidos.</p>

        <form action={adicionarEntrada} className="card grid sm:grid-cols-2 gap-3 mb-6">
          <select name="categoria" required className="input-field">
            {CATEGORIAS_ENTRADA.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input name="valor" type="number" step="0.01" min="0" placeholder="Valor (R$)" required className="input-field" />
          <input name="data" type="date" defaultValue={hoje} required className="input-field" />
          <input name="observacao" type="text" placeholder="Observação (opcional)" className="input-field" />
          <button type="submit" className="btn-primary sm:col-span-2">
            Salvar entrada
          </button>
        </form>

        <div className="space-y-2">
          {(entradas ?? []).map((e) => (
            <div key={e.id} className="flex items-center justify-between text-sm border-b border-line py-2">
              <div>
                <span className="text-ink-soft">{formatarData(e.data)}</span> ·{" "}
                <span>{e.categoria}</span>
                {e.observacao && <span className="text-ink-soft"> — {e.observacao}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-income font-semibold">{formatarBRL(e.valor)}</span>
                <form action={removerEntrada.bind(null, e.id)}>
                  <button className="text-ink-soft hover:text-expense text-xs underline">remover</button>
                </form>
              </div>
            </div>
          ))}
          {(entradas ?? []).length === 0 && (
            <p className="text-sm text-ink-soft">Nenhuma entrada ainda.</p>
          )}
        </div>
      </section>

      <section>
        <h1 className="text-lg font-bold mb-1">Despesas</h1>
        <p className="text-sm text-ink-soft mb-4">O que saiu do caixa da família.</p>

        <form action={adicionarDespesa} className="card grid sm:grid-cols-2 gap-3 mb-6">
          <input name="descricao" type="text" placeholder="Descrição" required className="input-field sm:col-span-2" />
          <select name="categoria" required className="input-field">
            {CATEGORIAS_DESPESA.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input name="valor" type="number" step="0.01" min="0" placeholder="Valor (R$)" required className="input-field" />
          <input name="data" type="date" defaultValue={hoje} required className="input-field" />
          <input name="observacao" type="text" placeholder="Observação (opcional)" className="input-field" />
          <button type="submit" className="btn-primary sm:col-span-2">
            Salvar despesa
          </button>
        </form>

        <div className="space-y-2">
          {(despesas ?? []).map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm border-b border-line py-2">
              <div>
                <span className="text-ink-soft">{formatarData(d.data)}</span> ·{" "}
                <span>{d.categoria}</span> · <span>{d.descricao}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-expense font-semibold">{formatarBRL(d.valor)}</span>
                <form action={removerDespesa.bind(null, d.id)}>
                  <button className="text-ink-soft hover:text-expense text-xs underline">remover</button>
                </form>
              </div>
            </div>
          ))}
          {(despesas ?? []).length === 0 && (
            <p className="text-sm text-ink-soft">Nenhuma despesa ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}

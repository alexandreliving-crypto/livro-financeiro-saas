import { createClient } from "@/lib/supabase/server";
import GraficoRosca from "@/components/GraficoRosca";
import { SeletorMes, SeletorAno } from "@/components/SeletorPeriodo";

const CORES_ENTRADA: Record<string, string> = {
  Salário: "#3ED9B0",
  Investimento: "#F5B942",
  Apartamentos: "#5B8DEF",
};
const CORES_DESPESA: Record<string, string> = {
  Moradia: "#E5675B",
  Alimentação: "#F2994A",
  Transporte: "#9B8AFB",
  Saúde: "#F2669C",
  Educação: "#5B8DEF",
  Lazer: "#3ED9B0",
  Outros: "#8B90A0",
};

function formatarBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; mes?: string; ano?: string }>;
}) {
  const { tab, mes, ano } = await searchParams;
  const abaAtiva = tab === "ano" ? "ano" : "mes";

  const supabase = await createClient();
  const [{ data: entradas }, { data: despesas }] = await Promise.all([
    supabase.from("entradas").select("categoria, valor, data"),
    supabase.from("despesas").select("categoria, valor, data"),
  ]);

  const hoje = new Date().toISOString().slice(0, 10);
  const mesesDisponiveis = Array.from(
    new Set([...(entradas ?? []), ...(despesas ?? [])].map((i) => i.data.slice(0, 7)).concat(hoje.slice(0, 7)))
  ).sort().reverse();
  const anosDisponiveis = Array.from(
    new Set([...(entradas ?? []), ...(despesas ?? [])].map((i) => i.data.slice(0, 4)).concat(hoje.slice(0, 4)))
  ).sort().reverse();

  const mesEscolhido = mes && mesesDisponiveis.includes(mes) ? mes : mesesDisponiveis[0];
  const anoEscolhido = ano && anosDisponiveis.includes(ano) ? ano : anosDisponiveis[0];

  const entradasMes = (entradas ?? []).filter((e) => e.data.slice(0, 7) === mesEscolhido);
  const despesasMes = (despesas ?? []).filter((d) => d.data.slice(0, 7) === mesEscolhido);
  const totalEntradasMes = entradasMes.reduce((s, e) => s + Number(e.valor), 0);
  const totalDespesasMes = despesasMes.reduce((s, d) => s + Number(d.valor), 0);

  const entradasAno = (entradas ?? []).filter((e) => e.data.slice(0, 4) === anoEscolhido);
  const despesasAno = (despesas ?? []).filter((d) => d.data.slice(0, 4) === anoEscolhido);

  const dadosPizzaEntradas = Object.keys(CORES_ENTRADA).map((cat) => ({
    label: cat,
    value: entradasAno.filter((e) => e.categoria === cat).reduce((s, e) => s + Number(e.valor), 0),
    color: CORES_ENTRADA[cat],
  }));
  const dadosPizzaDespesas = Object.keys(CORES_DESPESA).map((cat) => ({
    label: cat,
    value: despesasAno.filter((d) => d.categoria === cat).reduce((s, d) => s + Number(d.valor), 0),
    color: CORES_DESPESA[cat],
  }));

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <a
          href="/painel/dashboard?tab=mes"
          className={`px-4 py-2 rounded-full text-sm ${abaAtiva === "mes" ? "bg-gold text-[#1A1406] font-semibold" : "text-ink-soft hover:text-ink"}`}
        >
          Resumo do mês
        </a>
        <a
          href="/painel/dashboard?tab=ano"
          className={`px-4 py-2 rounded-full text-sm ${abaAtiva === "ano" ? "bg-gold text-[#1A1406] font-semibold" : "text-ink-soft hover:text-ink"}`}
        >
          Resumo do ano
        </a>
      </div>

      {abaAtiva === "mes" ? (
        <>
          <div className="mb-5"><SeletorMes opcoes={mesesDisponiveis} /></div>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="card">
              <p className="text-xs text-ink-soft mb-2">Entradas do mês</p>
              <p className="text-xl font-bold text-income">{formatarBRL(totalEntradasMes)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-ink-soft mb-2">Despesas do mês</p>
              <p className="text-xl font-bold text-expense">{formatarBRL(totalDespesasMes)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-ink-soft mb-2">Saldo do mês</p>
              <p className="text-xl font-bold">{formatarBRL(totalEntradasMes - totalDespesasMes)}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-5"><SeletorAno opcoes={anosDisponiveis} tabAtiva="ano" /></div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-sm font-semibold mb-4">Recebimentos</h3>
              <GraficoRosca dados={dadosPizzaEntradas} />
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold mb-4">Pagamentos</h3>
              <GraficoRosca dados={dadosPizzaDespesas} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

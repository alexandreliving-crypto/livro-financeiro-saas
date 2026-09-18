"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SeletorMes({ opcoes }: { opcoes: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const atual = searchParams.get("mes") || opcoes[0];

  return (
    <select
      className="input-field w-auto"
      value={atual}
      onChange={(e) => router.push(`/painel/dashboard?mes=${e.target.value}`)}
    >
      {opcoes.map((o) => {
        const [ano, mes] = o.split("-");
        const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return (
          <option key={o} value={o}>
            {nomes[parseInt(mes, 10) - 1]} de {ano}
          </option>
        );
      })}
    </select>
  );
}

export function SeletorAno({ opcoes, tabAtiva }: { opcoes: string[]; tabAtiva: "mes" | "ano" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const atual = searchParams.get("ano") || opcoes[0];

  if (tabAtiva !== "ano") return null;

  return (
    <select
      className="input-field w-auto"
      value={atual}
      onChange={(e) => router.push(`/painel/dashboard?tab=ano&ano=${e.target.value}`)}
    >
      {opcoes.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

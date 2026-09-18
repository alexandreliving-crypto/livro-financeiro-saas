"use client";

import { useState } from "react";

type Fatia = { label: string; value: number; color: string };

function formatarBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function polarParaCartesiano(cx: number, cy: number, r: number, angulo: number) {
  const rad = ((angulo - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function GraficoRosca({ dados, tamanho = 132 }: { dados: Fatia[]; tamanho?: number }) {
  const [hover, setHover] = useState<{ label: string; value: number; pct: string } | null>(null);
  const total = dados.reduce((s, d) => s + d.value, 0);
  const naoZero = dados.filter((d) => d.value > 0);

  if (total <= 0) {
    return <p className="text-sm text-ink-soft">Sem dados neste período.</p>;
  }

  const r = tamanho / 2 - 2;
  const cx = tamanho / 2;
  const cy = tamanho / 2;

  let acumulado = 0;
  const fatias = naoZero.map((d) => {
    const angulo = (d.value / total) * 360;
    const inicio = acumulado;
    const fim = acumulado + angulo;
    const largeArc = angulo > 180 ? 1 : 0;
    const p1 = polarParaCartesiano(cx, cy, r, inicio);
    const p2 = polarParaCartesiano(cx, cy, r, fim);
    acumulado = fim;
    const pct = ((d.value / total) * 100).toFixed(1);
    return { ...d, path: `M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`, pct };
  });

  return (
    <div className="flex items-center gap-5 flex-wrap justify-center">
      <div style={{ width: tamanho }} className="shrink-0">
        <svg viewBox={`0 0 ${tamanho} ${tamanho}`} className="w-full h-auto">
          {fatias.map((f) => (
            <path
              key={f.label}
              d={f.path}
              fill={f.color}
              stroke="#1D2029"
              strokeWidth={1}
              className="cursor-pointer transition-opacity hover:opacity-85"
              onMouseEnter={() => setHover({ label: f.label, value: f.value, pct: f.pct })}
              onMouseLeave={() => setHover(null)}
            />
          ))}
          <circle cx={cx} cy={cy} r={r * 0.62} fill="#1D2029" />
        </svg>
      </div>
      <div className="flex flex-col gap-2.5 min-w-[150px]">
        {fatias.map((f) => {
          const pct = ((f.value / total) * 100).toFixed(1);
          return (
            <div
              key={f.label}
              className="flex items-center justify-between gap-3 text-sm cursor-pointer"
              onMouseEnter={() => setHover({ label: f.label, value: f.value, pct })}
              onMouseLeave={() => setHover(null)}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: f.color }} />
                {f.label}
              </span>
              <span className="text-ink-soft text-xs font-medium">{pct}%</span>
            </div>
          );
        })}
      </div>
      {hover && (
        <p className="w-full text-center text-xs text-ink-soft">
          <strong className="text-gold">{hover.label}</strong>: {hover.pct}% ·{" "}
          {formatarBRL(hover.value)}
        </p>
      )}
    </div>
  );
}

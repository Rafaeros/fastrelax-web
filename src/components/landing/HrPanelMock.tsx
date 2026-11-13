"use client";

import { animate, stagger, utils } from "animejs";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui";

/*
 * Painel de RH em HTML, com as métricas que o dashboard real mostra
 * (Sessões no período, Taxa de comparecimento, Colaboradores ativos, uso por
 * departamento, sessões por dia). Os números são de exemplo — é uma ilustração
 * da tela, não um dado publicado.
 */

const KPIS = [
  { label: "Sessões no período", value: 312, suffix: "" },
  { label: "Taxa de comparecimento", value: 91, suffix: "%" },
  { label: "Colaboradores ativos", value: 148, suffix: "" },
];

// Sessões por dia útil do mês (exemplo): sobe na segunda, cai na sexta.
const DAILY = [12, 15, 14, 16, 9, 14, 17, 16, 18, 10, 15, 18, 17, 19, 11, 16, 19, 18, 20, 12];

const DEPARTMENTS = [
  { name: "Atendimento", share: 0.86 },
  { name: "Engenharia", share: 0.72 },
  { name: "Financeiro", share: 0.58 },
  { name: "Comercial", share: 0.41 },
];

const STATUS = [
  { label: "Concluídas", value: 268, color: "bg-success-500" },
  { label: "Agendadas", value: 31, color: "bg-accent" },
  { label: "Canceladas", value: 9, color: "bg-neutral-400" },
  { label: "Expiradas", value: 4, color: "bg-error-500" },
];

export function HrPanelMock() {
  const root = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;

  useEffect(() => {
    const el = root.current;
    if (!el || reduce) return;

    const bars = el.querySelectorAll<HTMLElement>("[data-bar]");
    const rows = el.querySelectorAll<HTMLElement>("[data-row]");
    const counters = el.querySelectorAll<HTMLElement>("[data-count]");

    // Estado inicial "vazio" só quando há animação; sem JS ou com movimento
    // reduzido o painel aparece cheio, direto do HTML.
    utils.set(bars, { scaleY: 0 });
    utils.set(rows, { scaleX: 0 });
    counters.forEach((c) => (c.textContent = "0"));

    let played = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played) return;
        played = true;
        observer.disconnect();

        animate(bars, {
          scaleY: [0, 1],
          duration: 900,
          delay: stagger(35, { start: 150 }),
          ease: "outExpo",
        });
        animate(rows, {
          scaleX: [0, 1],
          duration: 1100,
          delay: stagger(90, { start: 500 }),
          ease: "outQuart",
        });
        counters.forEach((c) => {
          const target = Number(c.dataset.count);
          const box = { n: 0 };
          animate(box, {
            n: target,
            duration: 1400,
            ease: "outQuart",
            modifier: utils.round(0),
            onUpdate: () => (c.textContent = box.n.toLocaleString("pt-BR")),
          });
        });
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduce]);

  const max = Math.max(...DAILY);
  const statusTotal = STATUS.reduce((sum, s) => sum + s.value, 0);

  return (
    <div
      ref={root}
      aria-label="Exemplo do painel de RH com indicadores de uso das cadeiras"
      role="img"
      className="overflow-hidden rounded-card border border-line bg-bg-900 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]"
    >
      {/* Barra da janela */}
      <div className="flex items-center gap-3 border-b border-line bg-bg-800 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-bg-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-bg-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-bg-600" />
        </div>
        <span className="text-xs text-ink-tertiary">Painel / Visão geral</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-control border border-line px-2 py-1 text-xs text-ink-secondary">
          <Icon name="calendar" className="h-3.5 w-3.5" />
          Novembro
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-3">
          {KPIS.map((k) => (
            <div key={k.label} className="rounded-control border border-line bg-surface-card p-3">
              <div className="text-[0.7rem] leading-tight text-ink-muted sm:text-xs">{k.label}</div>
              <div className="mt-1 font-display text-2xl text-ink-primary sm:text-3xl">
                <span data-count={k.value}>{k.value.toLocaleString("pt-BR")}</span>
                {k.suffix}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-control border border-line bg-surface-card p-3 sm:p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-ink-secondary">Sessões por dia</span>
            <span className="text-[0.7rem] text-ink-tertiary">dias úteis</span>
          </div>
          <div className="mt-3 flex h-28 items-end gap-[3px] sm:h-32 sm:gap-1">
            {DAILY.map((v, i) => (
              <div
                key={i}
                data-bar
                className="flex-1 origin-bottom rounded-t-[3px] bg-gradient-to-t from-copper-700 to-copper-300"
                style={{ height: `${(v / max) * 100}%` }}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr]">
          <div className="rounded-control border border-line bg-surface-card p-3 sm:p-4">
            <span className="text-xs text-ink-secondary">Uso por departamento</span>
            <ul className="mt-3 flex flex-col gap-2.5">
              {DEPARTMENTS.map((d) => (
                <li key={d.name} className="flex items-center gap-3 text-xs">
                  <span className="w-20 shrink-0 text-ink-muted">{d.name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-700">
                    <span
                      data-row
                      className="block h-full origin-left rounded-full bg-accent"
                      style={{ width: `${d.share * 100}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-ink-secondary">{Math.round(d.share * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-control border border-line bg-surface-card p-3 sm:p-4">
            <span className="text-xs text-ink-secondary">Status das sessões</span>
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full">
              {STATUS.map((s) => (
                <span key={s.label} data-row className={`${s.color} origin-left`} style={{ width: `${(s.value / statusTotal) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              {STATUS.map((s) => (
                <li key={s.label} className="flex items-center gap-1.5 text-ink-muted">
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  {s.label}
                  <span className="ml-auto text-ink-secondary">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Card, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  scaleItemFor,
  type EvaluationSummary,
} from "@/features/evaluations/types/evaluation.types";

export type EvaluationsSummaryProps = {
  summary: EvaluationSummary | null;
};

/**
 * O cabeçalho da tela do RH: média, volume, adesão e a distribuição das notas.
 *
 * <p>
 * A distribuição é uma barra por nota, com as cinco sempre presentes. Uma
 * barra faltando não seria lida como "ninguém deu essa nota", e sim como se a
 * nota não existisse na escala.
 */
export function EvaluationsSummary({ summary }: EvaluationsSummaryProps) {
  if (!summary) return null;

  const { total, average, sessionsDone, responseRate, distribution } = summary;
  // A escala das barras é a nota mais votada, não o total: com 40 respostas em
  // "Excelente" e 2 em "Ruim", barras proporcionais ao total ficariam todas
  // rentes ao chão.
  const peak = distribution.reduce((max, item) => Math.max(max, item.total), 0);

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <Card
        padding="sm"
        className="flex flex-col justify-between gap-4 border-accent/25 bg-linear-to-br from-accent-strong/15 via-surface-card to-surface-card sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-1">
            <span className="eyebrow">Satisfação do time</span>
            <span className="font-display text-3xl tabular-nums text-ink-primary sm:text-4xl">
              {average === null ? "—" : average.toFixed(1).replace(".", ",")}
            </span>
            <span className="text-xs text-ink-secondary">
              {total === 0
                ? "Nenhuma avaliação no período"
                : `${total} ${total === 1 ? "avaliação" : "avaliações"}`}
            </span>
          </div>

          <span
            className="ml-auto text-3xl sm:text-4xl"
            aria-hidden
            title={average === null ? undefined : scaleItemFor(Math.round(average))?.label}
          >
            {average === null ? "🫥" : (scaleItemFor(Math.round(average))?.emoji ?? "🫥")}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-ink-tertiary">Massagens concluídas</dt>
            <dd className="font-display text-xl tabular-nums text-ink-primary">{sessionsDone}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs text-ink-tertiary">Responderam</dt>
            <dd className="font-display text-xl tabular-nums text-ink-primary">
              {responseRate === null ? "—" : `${Math.round(responseRate)}%`}
            </dd>
          </div>
        </dl>
      </Card>

      <Card padding="sm" className="flex flex-col gap-3 sm:p-6">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
          <Icon name="chart" className="h-4 w-4 text-accent-soft" />
          Distribuição das notas
        </span>

        <dl className="flex flex-col gap-2">
          {/* Do melhor para o pior: é a ordem em que o RH lê um resultado. */}
          {[...distribution].reverse().map((item) => {
            const scale = scaleItemFor(item.score);
            const width = peak === 0 ? 0 : Math.round((item.total / peak) * 100);

            return (
              <div key={item.score} className="flex items-center gap-2.5 sm:gap-3">
                <dt className="flex w-24 shrink-0 items-center gap-1.5 text-xs text-ink-secondary sm:w-28 sm:gap-2">
                  <span aria-hidden className="text-base">
                    {scale?.emoji}
                  </span>
                  <span className="truncate">{item.label}</span>
                </dt>

                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-pill bg-surface-hover">
                  <div
                    className={cn(
                      "h-full rounded-pill bg-accent-strong transition-[width]",
                      item.total === 0 && "bg-transparent",
                    )}
                    style={{ width: `${width}%` }}
                  />
                </div>

                <dd className="w-8 shrink-0 text-right text-xs tabular-nums text-ink-secondary sm:w-10">
                  {item.total}
                </dd>
              </div>
            );
          })}
        </dl>
      </Card>
    </div>
  );
}

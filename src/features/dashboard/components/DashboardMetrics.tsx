"use client";

import { Badge, Card, Icon, Stat } from "@/components/ui";
import type { IconName } from "@/components/ui";
import type { DashboardSummary } from "@/features/dashboard/types/dashboard.types";

export type DashboardMetricsProps = {
  summary: DashboardSummary;
};

/** Números de cabeçalho: leitura em um relance, sem gráfico. */
export function DashboardMetrics({ summary }: DashboardMetricsProps) {
  const metrics: { value: string; label: string; icon: IconName }[] = [
    {
      value: String(summary.totalSessions),
      label: "Sessões no período",
      icon: "chair",
    },
    {
      value:
        summary.attendanceRate === null
          ? "—"
          : `${summary.attendanceRate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
      label: "Taxa de comparecimento",
      icon: "heart",
    },
    {
      value: String(summary.activeCollaborators),
      label: "Colaboradores ativos",
      icon: "users",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {metrics.map((metric, idx) => (
        <Card
          key={metric.label}
          padding="sm"
          className={
            idx === 0
              ? "border-accent/25 bg-linear-to-br from-accent-strong/15 via-surface-card to-surface-card sm:p-6"
              : "sm:p-6"
          }
        >
          <Stat
            value={metric.value}
            label={metric.label}
            icon={<Icon name={metric.icon} />}
          />
        </Card>
      ))}

      {/* Sem horário permitido o colaborador nunca consegue agendar: o número
          só é neutro quando é zero. */}
      <Card padding="sm" className="sm:p-6">
        <div className="flex flex-col gap-2">
          <Stat
            value={String(summary.collaboratorsWithoutSchedule)}
            label="Sem horário"
            icon={<Icon name="clock" />}
          />
          {summary.collaboratorsWithoutSchedule > 0 && (
            <Badge tone="warning" className="self-start">
              Sem janela
            </Badge>
          )}
        </div>
      </Card>
    </div>
  );
}

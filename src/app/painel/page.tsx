import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { requireCompanyUser } from "@/features/authentication/lib/guards";
import { DashboardView } from "@/features/dashboard/components/DashboardView";
import { getDashboardSummary } from "@/features/dashboard/services/dashboard.service";
import { emptyDashboardSummary } from "@/features/dashboard/types/dashboard.types";

export const metadata: Metadata = {
  title: `Painel — ${brand.name}`,
};

export default async function PainelPage() {
  // Os indicadores são de uma empresa: a equipe da plataforma cai para a lista
  // de clientes, que é o primeiro destino do papel dela.
  const user = await requireCompanyUser();

  // Sem datas o backend assume os últimos 30 dias, mesmo padrão do filtro.
  const result = await getDashboardSummary();

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">{user.companyName ?? "Visão geral"}</span>
        <h1 className="font-display text-2xl text-ink-primary sm:text-3xl">
          Olá, {user.name}
        </h1>
      </div>

      <DashboardView
        initialSummary={result.ok ? result.data : emptyDashboardSummary()}
        initialError={result.ok ? undefined : result.message}
      />
    </div>
  );
}

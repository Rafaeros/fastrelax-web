import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Alert } from "@/components/ui";
import { emptyPageSlice, toPageSlice } from "@/lib/api/pagination.types";
import { requirePlatformUser } from "@/features/authentication/lib/guards";
import { fetchPlansPage } from "@/features/billing/actions/billing.actions";
import { PlansTable } from "@/features/billing/components/PlansTable";
import { listPlans } from "@/features/billing/services/billing.service";
import type { Plan } from "@/features/billing/types/billing.types";

export const metadata: Metadata = {
  title: `Planos — ${brand.name}`,
};

export default async function PlanosPage() {
  await requirePlatformUser();

  const result = await listPlans({ page: 0 });
  const initialSlice = result.ok ? toPageSlice(result.data) : emptyPageSlice<Plan>();

  return (
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      {!result.ok && (
        <Alert tone="error" title="Não foi possível carregar os planos">
          {result.message}
        </Alert>
      )}

      <PlansTable initialSlice={initialSlice} loadPage={fetchPlansPage} />
    </div>
  );
}

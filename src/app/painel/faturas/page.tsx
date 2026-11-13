import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Alert } from "@/components/ui";
import { emptyPageSlice, toPageSlice } from "@/lib/api/pagination.types";
import { requireCompanyUser } from "@/features/authentication/lib/guards";
import { fetchMyInvoicesPage } from "@/features/billing/actions/billing.actions";
import { CompanyInvoicesView } from "@/features/billing/components/CompanyInvoicesView";
import {
  getMySubscription,
  listActivePlans,
  listMyInvoices,
} from "@/features/billing/services/billing.service";
import type { Invoice } from "@/features/billing/types/billing.types";

export const metadata: Metadata = {
  title: `Faturas e assinatura — ${brand.name}`,
};

export default async function FaturasPage() {
  await requireCompanyUser({ billingExempt: true });

  const [subscriptionRes, invoicesRes, plansRes] = await Promise.all([
    getMySubscription(),
    listMyInvoices({ page: 0 }),
    listActivePlans(),
  ]);

  const initialSlice = invoicesRes.ok ? toPageSlice(invoicesRes.data) : emptyPageSlice<Invoice>();
  const subscription = subscriptionRes.ok ? subscriptionRes.data : null;
  const plans = plansRes.ok ? plansRes.data : [];

  return (
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      {!invoicesRes.ok && (
        <Alert tone="error" title="Não foi possível carregar as faturas">
          {invoicesRes.message}
        </Alert>
      )}

      <CompanyInvoicesView
        subscription={subscription}
        plans={plans}
        initialSlice={initialSlice}
        loadPage={fetchMyInvoicesPage}
      />
    </div>
  );
}

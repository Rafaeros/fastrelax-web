import { apiFetch } from "@/lib/api/http";
import type { ApiResult } from "@/lib/api/api.types";
import type { PageParams, SpringPage } from "@/lib/api/pagination.types";
import { buildQuery } from "@/lib/api/query";
import { readAccessToken } from "@/features/authentication/services/session.service";
import type {
  CreditCardSubscriptionInput,
  GenerateInvoiceInput,
  Invoice,
  ListInvoicesParams,
  PayInvoiceWithCardInput,
  Plan,
  SaveMySubscriptionInput,
  SavePlanInput,
  SaveSubscriptionInput,
  SimulateInvoiceAction,
  Subscription,
} from "@/features/billing/types/billing.types";

const BASE = "/billing";

export const PLANS_PAGE_SIZE = 20;
export const INVOICES_PAGE_SIZE = 20;

export async function listPlans(params: PageParams = {}): Promise<ApiResult<SpringPage<Plan>>> {
  const { page = 0, size = PLANS_PAGE_SIZE } = params;
  const query = buildQuery({ page, size });
  return apiFetch<SpringPage<Plan>>(`${BASE}/plans${query}`, {
    token: await readAccessToken(),
  });
}

export async function listActivePlans(): Promise<ApiResult<Plan[]>> {
  return apiFetch<Plan[]>(`${BASE}/plans/active`, {
    token: await readAccessToken(),
  });
}

export async function createPlan(input: SavePlanInput): Promise<ApiResult<Plan>> {
  return apiFetch<Plan>(`${BASE}/plans`, {
    method: "POST",
    body: input,
    token: await readAccessToken(),
  });
}

export async function updatePlan(id: number, input: SavePlanInput): Promise<ApiResult<Plan>> {
  return apiFetch<Plan>(`${BASE}/plans/${id}`, {
    method: "PUT",
    body: input,
    token: await readAccessToken(),
  });
}

export async function togglePlanActive(id: number): Promise<ApiResult<Plan>> {
  return apiFetch<Plan>(`${BASE}/plans/${id}/toggle-active`, {
    method: "PATCH",
    token: await readAccessToken(),
  });
}

export async function deletePlan(id: number): Promise<ApiResult<null>> {
  return apiFetch<null>(`${BASE}/plans/${id}`, {
    method: "DELETE",
    token: await readAccessToken(),
  });
}

export async function getMySubscription(): Promise<ApiResult<Subscription | null>> {
  return apiFetch<Subscription | null>(`${BASE}/subscriptions/me`, {
    token: await readAccessToken(),
  });
}

export async function getCompanySubscription(
  companyId: number,
): Promise<ApiResult<Subscription | null>> {
  return apiFetch<Subscription | null>(`${BASE}/subscriptions/company/${companyId}`, {
    token: await readAccessToken(),
  });
}

export async function saveSubscription(
  input: SaveSubscriptionInput,
): Promise<ApiResult<Subscription>> {
  return apiFetch<Subscription>(`${BASE}/subscriptions`, {
    method: "POST",
    body: input,
    token: await readAccessToken(),
  });
}

export async function saveMySubscription(
  input: SaveMySubscriptionInput,
): Promise<ApiResult<Subscription>> {
  return apiFetch<Subscription>(`${BASE}/subscriptions/me`, {
    method: "POST",
    body: input,
    token: await readAccessToken(),
  });
}

/**
 * Envia o cartão ao backend, que o tokeniza no provedor de pagamento.
 * `remoteIp` é o IP do navegador de quem paga (exigido na análise antifraude).
 */
export async function subscribeWithCreditCard(
  input: CreditCardSubscriptionInput & { remoteIp?: string },
): Promise<ApiResult<Subscription>> {
  return apiFetch<Subscription>(`${BASE}/subscriptions/me/credit-card`, {
    method: "POST",
    body: input,
    token: await readAccessToken(),
  });
}

/** Paga no cartão uma fatura em aberto, sem sair da aplicação. */
export async function payMyInvoiceWithCard(
  invoiceId: number,
  input: PayInvoiceWithCardInput & { remoteIp?: string },
): Promise<ApiResult<Invoice>> {
  return apiFetch<Invoice>(`${BASE}/invoices/me/${invoiceId}/pay-with-card`, {
    method: "POST",
    body: input,
    token: await readAccessToken(),
  });
}

/** Paga uma fatura em aberto usando o cartão já cadastrado na assinatura. */
export async function payMyInvoiceWithSavedCard(
  invoiceId: number,
  remoteIp?: string,
): Promise<ApiResult<Invoice>> {
  const query = buildQuery({ remoteIp });
  return apiFetch<Invoice>(`${BASE}/invoices/me/${invoiceId}/pay-with-saved-card${query}`, {
    method: "POST",
    token: await readAccessToken(),
  });
}

/** Cancela fatura não paga (somente equipe da plataforma). */
export async function cancelInvoice(invoiceId: number, reason?: string): Promise<ApiResult<Invoice>> {
  return apiFetch<Invoice>(`${BASE}/invoices/${invoiceId}/cancel`, {
    method: "POST",
    body: { reason },
    token: await readAccessToken(),
  });
}

/** Fatura em aberto da própria empresa (vencimento e valor vêm do servidor). */
export async function openMyInvoice(): Promise<ApiResult<Invoice>> {
  return apiFetch<Invoice>(`${BASE}/invoices/me/generate`, {
    method: "POST",
    body: {},
    token: await readAccessToken(),
  });
}

export async function cancelSubscription(companyId: number): Promise<ApiResult<Subscription>> {
  return apiFetch<Subscription>(`${BASE}/subscriptions/company/${companyId}/cancel`, {
    method: "POST",
    token: await readAccessToken(),
  });
}

export async function listMyInvoices(
  params: ListInvoicesParams = {},
): Promise<ApiResult<SpringPage<Invoice>>> {
  const { page = 0, size = INVOICES_PAGE_SIZE, status } = params;
  const query = buildQuery({ page, size, status });
  return apiFetch<SpringPage<Invoice>>(`${BASE}/invoices/me${query}`, {
    token: await readAccessToken(),
  });
}

export async function listPlatformInvoices(
  params: ListInvoicesParams = {},
): Promise<ApiResult<SpringPage<Invoice>>> {
  const { page = 0, size = INVOICES_PAGE_SIZE, companyId, status } = params;
  const query = buildQuery({ page, size, companyId, status });
  return apiFetch<SpringPage<Invoice>>(`${BASE}/invoices${query}`, {
    token: await readAccessToken(),
  });
}

export async function generateInvoice(
  companyId: number,
  input: GenerateInvoiceInput = {},
): Promise<ApiResult<Invoice>> {
  return apiFetch<Invoice>(`${BASE}/invoices/company/${companyId}/generate`, {
    method: "POST",
    body: input,
    token: await readAccessToken(),
  });
}

export async function simulateInvoiceEvent(
  invoiceId: number,
  action: SimulateInvoiceAction,
): Promise<ApiResult<Invoice>> {
  return apiFetch<Invoice>(`${BASE}/invoices/${invoiceId}/simulate`, {
    method: "POST",
    body: { action },
    token: await readAccessToken(),
  });
}

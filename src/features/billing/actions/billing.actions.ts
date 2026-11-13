"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { emptyPageSlice, toPageSlice, type PageSlice } from "@/lib/api/pagination.types";
import {
  cancelSubscription,
  createPlan,
  deletePlan,
  generateInvoice,
  openMyInvoice,
  payMyInvoiceWithCard,
  payMyInvoiceWithSavedCard,
  cancelInvoice,
  getCompanySubscription,
  listActivePlans,
  listMyInvoices,
  listPlans,
  listPlatformInvoices,
  saveMySubscription,
  subscribeWithCreditCard,
  saveSubscription,
  simulateInvoiceEvent,
  togglePlanActive,
  updatePlan,
} from "@/features/billing/services/billing.service";
import type {
  BillingType,
  CreditCardSubscriptionInput,
  GenerateInvoiceInput,
  PayInvoiceWithCardInput,
  Invoice,
  InvoiceStatus,
  Plan,
  PlanFieldErrors,
  PlanFormState,
  SaveMySubscriptionInput,
  SavePlanInput,
  SaveSubscriptionInput,
  SimulateInvoiceAction,
  Subscription,
} from "@/features/billing/types/billing.types";
import type { MutationResult } from "@/features/collaborators/types/collaborator.types";

const PLANS_ROUTE = "/painel/planos";
const COMPANIES_ROUTE = "/painel/empresas";
const INVOICES_ROUTE = "/painel/faturas";

export async function fetchPlansPage(page: number): Promise<PageSlice<Plan>> {
  const result = await listPlans({ page });
  return result.ok ? toPageSlice(result.data) : emptyPageSlice<Plan>();
}

export async function fetchMyInvoicesPage(
  page: number,
  status?: InvoiceStatus,
): Promise<PageSlice<Invoice>> {
  const result = await listMyInvoices({ page, status });
  return result.ok ? toPageSlice(result.data) : emptyPageSlice<Invoice>();
}

export async function fetchCompanyBillingSummaryAction(companyId: number): Promise<{
  subscription: Subscription | null;
  invoices: Invoice[];
  plans: Plan[];
}> {
  const [subRes, invRes, plansRes] = await Promise.all([
    getCompanySubscription(companyId),
    listPlatformInvoices({ companyId, page: 0, size: 20 }),
    listActivePlans(),
  ]);

  return {
    subscription: subRes.ok ? subRes.data : null,
    invoices: invRes.ok ? invRes.data.content : [],
    plans: plansRes.ok ? plansRes.data : [],
  };
}

function parseReaisToCents(raw: string): number {
  const cleaned = raw.trim().replace(/[R$\s.]/g, "").replace(",", ".");
  const value = Number(cleaned);
  if (Number.isNaN(value) || value < 0) return -1;
  return Math.round(value * 100);
}

function parsePlanFormData(formData: FormData): {
  valid: boolean;
  data?: SavePlanInput;
  fieldErrors?: PlanFieldErrors;
} {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const minCollaborators = Number(formData.get("minCollaborators") ?? "1");
  const maxRaw = String(formData.get("maxCollaborators") ?? "").trim();
  const maxCollaborators = maxRaw === "" ? null : Number(maxRaw);
  const monthlyPriceCents = parseReaisToCents(String(formData.get("monthlyPriceReais") ?? "0"));
  const includedChairs = Number(formData.get("includedChairs") ?? "1");
  const extraChairPriceCents = parseReaisToCents(
    String(formData.get("extraChairPriceReais") ?? "0"),
  );
  const setupFeePerChairCents = parseReaisToCents(
    String(formData.get("setupFeePerChairReais") ?? "0"),
  );
  const graceDays = Number(formData.get("graceDays") ?? "5");

  const fieldErrors: PlanFieldErrors = {};
  if (name.length < 2) {
    fieldErrors.name = "Informe o nome da faixa (mínimo 2 caracteres).";
  }
  if (Number.isNaN(minCollaborators) || minCollaborators < 0) {
    fieldErrors.minCollaborators = "Informe um mínimo válido.";
  }
  if (
    maxCollaborators !== null &&
    (Number.isNaN(maxCollaborators) || maxCollaborators < minCollaborators)
  ) {
    fieldErrors.maxCollaborators = "O máximo deve ser maior ou igual ao mínimo.";
  }
  if (monthlyPriceCents < 0) {
    fieldErrors.monthlyPriceCents = "Informe um valor mensal válido.";
  }
  if (Number.isNaN(includedChairs) || includedChairs < 1) {
    fieldErrors.includedChairs = "Informe ao menos 1 cadeira inclusa.";
  }
  if (extraChairPriceCents < 0) {
    fieldErrors.extraChairPriceCents = "Valor por cadeira extra inválido.";
  }
  if (setupFeePerChairCents < 0) {
    fieldErrors.setupFeePerChairCents = "Valor de setup inválido.";
  }
  if (Number.isNaN(graceDays) || graceDays < 0 || graceDays > 60) {
    fieldErrors.graceDays = "A carência deve ficar entre 0 e 60 dias.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }

  return {
    valid: true,
    data: {
      name,
      description: description || undefined,
      minCollaborators,
      maxCollaborators,
      monthlyPriceCents,
      includedChairs,
      extraChairPriceCents,
      setupFeePerChairCents,
      graceDays,
    },
  };
}

export async function createPlanAction(
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const parsed = parsePlanFormData(formData);
  if (!parsed.valid || !parsed.data) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  const result = await createPlan(parsed.data);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath(PLANS_ROUTE);
  return { status: "success", message: result.message };
}

export async function updatePlanAction(
  _prev: PlanFormState,
  formData: FormData,
): Promise<PlanFormState> {
  const id = Number(formData.get("id"));
  if (!id || Number.isNaN(id)) {
    return { status: "error", message: "Plano não identificado." };
  }

  const parsed = parsePlanFormData(formData);
  if (!parsed.valid || !parsed.data) {
    return {
      status: "error",
      message: "Confira os campos destacados.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  const result = await updatePlan(id, parsed.data);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath(PLANS_ROUTE);
  return { status: "success", message: result.message };
}

export async function togglePlanActiveAction(id: number): Promise<MutationResult> {
  const result = await togglePlanActive(id);
  if (result.ok) revalidatePath(PLANS_ROUTE);
  return { ok: result.ok, message: result.message };
}

export async function deletePlanAction(id: number): Promise<MutationResult> {
  const result = await deletePlan(id);
  if (result.ok) revalidatePath(PLANS_ROUTE);
  return { ok: result.ok, message: result.message };
}

export async function saveSubscriptionAction(
  input: SaveSubscriptionInput,
): Promise<MutationResult & { subscription?: Subscription }> {
  const result = await saveSubscription(input);
  if (result.ok) {
    revalidatePath(COMPANIES_ROUTE);
    revalidatePath(INVOICES_ROUTE);
  }
  return {
    ok: result.ok,
    message: result.message,
    subscription: result.ok ? result.data : undefined,
  };
}

export async function saveMySubscriptionAction(
  input: SaveMySubscriptionInput,
): Promise<MutationResult & { subscription?: Subscription }> {
  const result = await saveMySubscription(input);
  if (result.ok) {
    revalidatePath(INVOICES_ROUTE);
    revalidatePath("/painel", "layout");
  }
  return {
    ok: result.ok,
    message: result.ok ? "Plano salvo. A fatura aparece no histórico." : result.message,
    subscription: result.ok ? result.data : undefined,
  };
}

/**
 * Cartão de crédito da assinatura.
 *
 * <p>
 * O cartão só atravessa este servidor a caminho do backend, que o troca por um
 * token no provedor de pagamento: nada aqui é registrado em log nem guardado.
 * O IP do navegador vai junto porque o provedor exige o IP de quem paga.
 */
export async function subscribeWithCreditCardAction(
  input: CreditCardSubscriptionInput,
): Promise<MutationResult & { subscription?: Subscription }> {
  const result = await subscribeWithCreditCard({ ...input, remoteIp: await payerIp() });
  if (result.ok) {
    revalidatePath(INVOICES_ROUTE);
    revalidatePath("/painel", "layout");
  }
  return {
    ok: result.ok,
    message: result.ok ? "Cartão cadastrado. A cobrança é automática todo mês." : result.message,
    subscription: result.ok ? result.data : undefined,
  };
}

async function payerIp(): Promise<string | undefined> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
}

/**
 * Paga uma fatura no cartão, dentro da aplicação. Mesmas garantias da
 * assinatura: o cartão só atravessa este servidor, sem log nem cópia.
 */
export async function payMyInvoiceWithCardAction(
  invoiceId: number,
  input: PayInvoiceWithCardInput,
): Promise<MutationResult & { invoice?: Invoice }> {
  const result = await payMyInvoiceWithCard(invoiceId, { ...input, remoteIp: await payerIp() });
  if (!result.ok) return { ok: false, message: result.message };

  revalidatePath(INVOICES_ROUTE);
  revalidatePath("/painel", "layout");
  const paid = result.data.status === "PAID";
  return {
    ok: true,
    invoice: result.data,
    message: paid
      ? "Pagamento aprovado."
      : "Pagamento enviado e em análise. A fatura é atualizada assim que for confirmado.",
  };
}

/** Paga uma fatura usando o cartão já cadastrado na assinatura da empresa. */
export async function payMyInvoiceWithSavedCardAction(
  invoiceId: number,
): Promise<MutationResult & { invoice?: Invoice }> {
  const result = await payMyInvoiceWithSavedCard(invoiceId, await payerIp());
  if (!result.ok) return { ok: false, message: result.message };

  revalidatePath(INVOICES_ROUTE);
  revalidatePath("/painel", "layout");
  const paid = result.data.status === "PAID";
  return {
    ok: true,
    invoice: result.data,
    message: paid
      ? "Pagamento aprovado com o cartão cadastrado."
      : "Pagamento enviado e em análise. A fatura é atualizada assim que for confirmado.",
  };
}

/** Cancela fatura não paga (somente equipe da plataforma). */
export async function cancelInvoiceAction(invoiceId: number, reason?: string): Promise<MutationResult> {
  const result = await cancelInvoice(invoiceId, reason);
  if (result.ok) {
    revalidatePath(COMPANIES_ROUTE);
    revalidatePath(INVOICES_ROUTE);
  }
  return { ok: result.ok, message: result.ok ? "Fatura cancelada." : result.message };
}

/** "Abrir fatura": a fatura em aberto da empresa. */
export async function openMyInvoiceAction(): Promise<MutationResult & { invoice?: Invoice }> {
  const result = await openMyInvoice();
  if (result.ok) {
    revalidatePath(INVOICES_ROUTE);
  }
  return {
    ok: result.ok,
    message: result.message,
    invoice: result.ok ? result.data : undefined,
  };
}

export async function cancelSubscriptionAction(companyId: number): Promise<MutationResult> {
  const result = await cancelSubscription(companyId);
  if (result.ok) {
    revalidatePath(COMPANIES_ROUTE);
    revalidatePath(INVOICES_ROUTE);
  }
  return { ok: result.ok, message: result.message };
}

export async function generateInvoiceAction(
  companyId: number,
  input: GenerateInvoiceInput = {},
): Promise<MutationResult & { invoice?: Invoice }> {
  const result = await generateInvoice(companyId, input);
  if (result.ok) {
    revalidatePath(COMPANIES_ROUTE);
    revalidatePath(INVOICES_ROUTE);
  }
  return {
    ok: result.ok,
    message: result.message,
    invoice: result.ok ? result.data : undefined,
  };
}

export async function simulateInvoiceEventAction(
  invoiceId: number,
  action: SimulateInvoiceAction,
): Promise<MutationResult & { invoice?: Invoice }> {
  const result = await simulateInvoiceEvent(invoiceId, action);
  if (result.ok) {
    revalidatePath(COMPANIES_ROUTE);
    revalidatePath(INVOICES_ROUTE);
    revalidatePath("/painel");
  }
  return {
    ok: result.ok,
    message: result.message,
    invoice: result.ok ? result.data : undefined,
  };
}

export type { BillingType };

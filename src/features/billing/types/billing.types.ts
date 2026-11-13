import type { BillingStatus } from "@/features/authentication/types/auth.types";
import type { PageParams } from "@/lib/api/pagination.types";

export type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" | "REFUNDED";

/** Espelha `PlanResponseDTO`. */
export type Plan = {
  id: number;
  name: string;
  description: string | null;
  minCollaborators: number;
  maxCollaborators: number | null;
  monthlyPriceCents: number;
  includedChairs: number;
  extraChairPriceCents: number;
  setupFeePerChairCents: number;
  graceDays: number;
  active: boolean;
  createdAt: string;
};

export type SavePlanInput = {
  name: string;
  description?: string;
  minCollaborators: number;
  maxCollaborators: number | null;
  monthlyPriceCents: number;
  includedChairs: number;
  extraChairPriceCents: number;
  setupFeePerChairCents: number;
  graceDays: number;
};

export type PlanFieldErrors = Partial<
  Record<
    | "name"
    | "minCollaborators"
    | "maxCollaborators"
    | "monthlyPriceCents"
    | "includedChairs"
    | "extraChairPriceCents"
    | "setupFeePerChairCents"
    | "graceDays",
    string
  >
>;

export type PlanFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: PlanFieldErrors;
};

export const PLAN_INITIAL_STATE: PlanFormState = { status: "idle" };

/** Espelha `SubscriptionResponseDTO`. */
export type Subscription = {
  id: number;
  companyId: number;
  companyName: string;
  companyBillingStatus: BillingStatus;
  companyBillingStatusLabel: string | null;
  companyGraceUntil: string | null;
  planId: number;
  planName: string;
  planMinCollaborators: number;
  planMaxCollaborators: number | null;
  planMonthlyPriceCents: number;
  planIncludedChairs: number;
  planExtraChairPriceCents: number;
  planSetupFeePerChairCents: number;
  planGraceDays: number;
  billingType: BillingType;
  billingTypeLabel: string;
  status: BillingStatus;
  statusLabel: string;
  gatewayProvider: string;
  gatewaySubscriptionId: string | null;
  /** Bandeira e últimos 4 dígitos do cartão; o resto fica só no provedor. */
  cardBrand: string | null;
  cardLast4: string | null;
  nextDueDate: string;
  autoAdjustTier: boolean;
  activeCollaboratorsCount: number;
  activeChairsCount: number;
  estimatedCycleAmountCents: number;
  createdAt: string;
};

/** Assinatura pela própria empresa (Pix ou boleto): o resto o servidor decide. */
export type SaveMySubscriptionInput = {
  planId: number;
  /** Cartão aqui só troca o plano de quem já tem cartão cadastrado. */
  billingType: BillingType;
};

/**
 * Assinatura no cartão. Existe só durante o envio: nada disso é guardado no
 * navegador nem no banco (o provedor devolve um token e o backend grava só
 * bandeira e final).
 */
export type CreditCardSubscriptionInput = {
  planId: number;
  card: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  holder: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
  };
};

/** Pagamento de uma fatura no cartão; `useForSubscription` vale para as próximas. */
export type PayInvoiceWithCardInput = Pick<CreditCardSubscriptionInput, "card" | "holder"> & {
  useForSubscription: boolean;
};

export type SaveSubscriptionInput = {
  companyId: number;
  planId: number | null;
  billingType: BillingType;
  nextDueDate: string;
  autoAdjustTier: boolean;
  generateInitialInvoice: boolean;
  includeSetupFee: boolean;
};

/** Espelha `InvoiceResponseDTO`. */
export type Invoice = {
  id: number;
  companyId: number;
  companyName: string;
  subscriptionId: number | null;
  planId: number | null;
  planName: string | null;
  referenceMonth: string | null;
  description: string;
  activeCollaboratorsCount: number;
  activeChairsCount: number;
  amountCents: number;
  billingType: BillingType;
  billingTypeLabel: string;
  status: InvoiceStatus;
  statusLabel: string;
  dueDate: string;
  paidAt: string | null;
  gatewayProvider: string;
  gatewayChargeId: string | null;
  invoiceUrl: string | null;
  pixCopyPaste: string | null;
  pixQrCodeBase64: string | null;
  createdAt: string;
};

export type ListInvoicesParams = PageParams & {
  companyId?: number;
  status?: InvoiceStatus;
};

export type GenerateInvoiceInput = {
  referenceMonth?: string;
  dueDate?: string;
  includeSetupFee?: boolean;
  description?: string;
};

export type SimulateInvoiceAction = "MARK_OVERDUE" | "EXPIRE_GRACE_PERIOD" | "CONFIRM_PAYMENT";

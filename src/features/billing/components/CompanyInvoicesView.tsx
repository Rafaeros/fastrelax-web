"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  DetailList,
  InfiniteDataTable,
  Modal,
  RowAction,
  RowActions,
  Select,
  TableIdentity,
  useToast,
} from "@/components/ui";
import type { DataTableColumn, DetailItem } from "@/components/ui";
import type { PageSlice } from "@/lib/api/pagination.types";
import { formatLongDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  openMyInvoiceAction,
  saveMySubscriptionAction,
} from "@/features/billing/actions/billing.actions";
import {
  CreditCardSubscriptionModal,
  InvoiceCardPaymentModal,
} from "@/features/billing/components/CreditCardSubscriptionModal";
import { InvoicePaymentModal } from "@/features/billing/components/InvoicePaymentModal";
import { cardBrandLabel } from "@/features/billing/lib/card";
import { formatCentsToBrl, formatTierRange } from "@/features/billing/lib/format";
import type {
  BillingType,
  Invoice,
  InvoiceStatus,
  Plan,
  Subscription,
} from "@/features/billing/types/billing.types";

export type CompanyInvoicesViewProps = {
  subscription: Subscription | null;
  plans?: Plan[];
  initialSlice: PageSlice<Invoice>;
  loadPage: (page: number) => Promise<PageSlice<Invoice>>;
};

/**
 * Plano e pagamento da própria empresa.
 *
 * <p>
 * Sem plano, a tela é um passo a passo: escolher o plano (cada um com o limite
 * de colaboradores ativos) e pagar — no cartão, com cobrança automática todo
 * mês, ou por Pix/boleto. Com plano, mostra o que está contratado e deixa
 * trocar plano e forma de pagamento. Vencimento e valor são sempre do servidor.
 */
export function CompanyInvoicesView({
  subscription: initialSubscription,
  plans = [],
  initialSlice,
  loadPage,
}: CompanyInvoicesViewProps) {
  const toast = useToast();
  const router = useRouter();
  // O que acabou de ser salvo aqui vale até a página recarregar os dados do
  // servidor (router.refresh); aí volta a valer a prop.
  const [override, setOverride] = useState<Subscription | null>(null);
  const subscription = override ?? initialSubscription;
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [reloadSignal, setReloadSignal] = useState(0);

  const [choosingPlan, setChoosingPlan] = useState(!initialSubscription);
  const [planId, setPlanId] = useState<number | null>(initialSubscription?.planId ?? null);
  const [cardOpen, setCardOpen] = useState(false);
  const [boletoOpen, setBoletoOpen] = useState(false);
  const [boletoType, setBoletoType] = useState<Exclude<BillingType, "CREDIT_CARD">>("PIX");
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(false);

  const activeCount = subscription?.activeCollaboratorsCount ?? null;
  const selectedPlan = plans.find((p) => p.id === planId) ?? null;
  const hasCard = Boolean(subscription?.cardLast4);
  const savedCard =
    subscription?.cardLast4
      ? { brand: subscription.cardBrand, last4: subscription.cardLast4 }
      : null;
  const awaitingPayment = !subscription || subscription.companyBillingStatus === "PENDING";

  const applySaved = (saved: Subscription) => {
    setOverride(saved);
    setPlanId(saved.planId);
    setChoosingPlan(false);
    setReloadSignal((c) => c + 1);
    router.refresh();
  };

  const save = async (billingType: BillingType) => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const res = await saveMySubscriptionAction({ planId: selectedPlan.id, billingType });
      if (res.ok && res.subscription) {
        applySaved(res.subscription);
        setBoletoOpen(false);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const openInvoice = async () => {
    setOpening(true);
    try {
      const res = await openMyInvoiceAction();
      if (res.ok && res.invoice) {
        setSelectedInvoice(res.invoice);
        setReloadSignal((c) => c + 1);
      } else {
        toast.error(res.message);
      }
    } finally {
      setOpening(false);
    }
  };

  const summaryItems = useMemo<DetailItem[]>(() => {
    if (!subscription) return [];
    return [
      { label: "Plano", value: subscription.planName },
      {
        label: "Colaboradores ativos",
        value:
          subscription.planMaxCollaborators === null
            ? `${subscription.activeCollaboratorsCount} (sem limite)`
            : `${subscription.activeCollaboratorsCount} de ${subscription.planMaxCollaborators}`,
      },
      { label: "Mensalidade", value: formatCentsToBrl(subscription.estimatedCycleAmountCents) },
      {
        label: "Forma de pagamento",
        value:
          subscription.billingType === "CREDIT_CARD" && subscription.cardLast4
            ? `${cardBrandLabel(subscription.cardBrand)} final ${subscription.cardLast4} · automático`
            : subscription.billingTypeLabel,
      },
      { label: "Próximo vencimento", value: formatDateBr(subscription.nextDueDate) },
      {
        label: "Situação",
        value: (
          <Badge tone={billingTone(subscription.companyBillingStatus)}>
            {subscription.companyBillingStatusLabel ?? subscription.companyBillingStatus}
          </Badge>
        ),
      },
      ...(subscription.companyGraceUntil
        ? [{ label: "Fim da carência", value: formatLongDateTime(subscription.companyGraceUntil) }]
        : []),
    ];
  }, [subscription]);

  const columns = useMemo<DataTableColumn<Invoice>[]>(
    () => [
      {
        id: "description",
        header: "Fatura",
        cell: (row) => (
          <TableIdentity
            name={row.description}
            secondary={`Fatura #${row.id} · ${row.referenceMonth ?? "—"}`}
          />
        ),
      },
      {
        id: "dueDate",
        header: "Vencimento",
        cell: (row) => (
          <span className="tabular-nums text-ink-secondary">{formatDateBr(row.dueDate)}</span>
        ),
      },
      {
        id: "amount",
        header: "Valor",
        cell: (row) => (
          <span className="font-semibold tabular-nums text-ink-primary">
            {formatCentsToBrl(row.amountCents)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Situação",
        cell: (row) => <Badge tone={statusTone(row.status)}>{row.statusLabel}</Badge>,
      },
      {
        id: "actions",
        header: "Ações",
        align: "right",
        width: "w-32",
        cell: (row) => (
          <RowActions>
            <RowAction label="Abrir fatura" icon="sheet" onClick={() => setSelectedInvoice(row)} />
            {(row.status === "PENDING" || row.status === "OVERDUE") && (
              <RowAction label="Pagar com cartão" icon="key" onClick={() => setPayingInvoice(row)} />
            )}
          </RowActions>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      <Card padding="md" className="flex shrink-0 flex-col gap-5 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-xl text-ink-primary sm:text-2xl">Plano e pagamento</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">
              Cada plano cobre até um número de colaboradores ativos. Para cadastrar mais gente,
              troque para um plano maior.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href="/api/colaboradores/planilha?tipo=exportar" download>
              <Button size="sm" variant="ghost" type="button">
                Exportar dados (.xlsx)
              </Button>
            </a>
            {subscription && (
              <Button size="sm" variant="secondary" type="button" loading={opening} onClick={openInvoice}>
                Abrir fatura
              </Button>
            )}
          </div>
        </div>

        {awaitingPayment && (
          <Alert tone="info" title="O app dos colaboradores está bloqueado">
            {subscription
              ? "Assim que a primeira mensalidade for paga, o acesso é liberado sozinho."
              : "Escolha um plano e pague a primeira mensalidade para liberar o acesso."}
          </Alert>
        )}

        {subscription && <DetailList items={summaryItems} />}

        {subscription && !choosingPlan && (
          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            <Button size="sm" variant="secondary" type="button" onClick={() => setChoosingPlan(true)}>
              Trocar de plano
            </Button>
            <Button
              size="sm"
              variant={hasCard ? "secondary" : "primary"}
              type="button"
              onClick={() => {
                setPlanId(subscription.planId);
                setCardOpen(true);
              }}
            >
              {hasCard ? "Trocar cartão" : "Cadastrar cartão de crédito"}
            </Button>
            {subscription.billingType === "CREDIT_CARD" && (
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => {
                  setPlanId(subscription.planId);
                  setBoletoOpen(true);
                }}
              >
                Usar Pix ou boleto
              </Button>
            )}
          </div>
        )}

        {choosingPlan && (
          <div className="flex flex-col gap-4 border-t border-line pt-4">
            <h2 className="text-sm font-semibold text-ink-primary">
              {subscription ? "Escolha o novo plano" : "1. Escolha o plano"}
            </h2>

            {plans.length === 0 ? (
              <p className="text-sm text-ink-secondary">
                Nenhum plano disponível no momento. Fale com o nosso time comercial.
              </p>
            ) : (
              <div role="radiogroup" aria-label="Planos" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {plans.map((p) => {
                  const tooSmall =
                    activeCount !== null && p.maxCollaborators !== null && activeCount > p.maxCollaborators;
                  const selected = p.id === planId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={tooSmall}
                      onClick={() => setPlanId(p.id)}
                      className={cn(
                        "flex flex-col gap-3 rounded-card border p-4 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50",
                        selected
                          ? "border-accent bg-accent/10"
                          : "border-line bg-bg-900/60 hover:border-accent/50",
                      )}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-ink-primary">{p.name}</span>
                        {subscription?.planId === p.id && <Badge tone="accent">Atual</Badge>}
                      </span>
                      <span className="text-xs text-ink-secondary">
                        {p.maxCollaborators === null
                          ? `A partir de ${p.minCollaborators} colaboradores`
                          : `Até ${p.maxCollaborators} colaboradores ativos`}
                      </span>
                      <span className="font-display text-xl tabular-nums text-ink-primary">
                        {formatCentsToBrl(p.monthlyPriceCents)}
                        <span className="font-sans text-xs text-ink-tertiary">/mês</span>
                      </span>
                      <span className="text-xs text-ink-tertiary">
                        {p.includedChairs} cadeira(s) inclusa(s) · {formatCentsToBrl(p.extraChairPriceCents)} por
                        cadeira extra
                      </span>
                      {tooSmall && (
                        <span className="text-xs text-ink-secondary">
                          Sua empresa tem {activeCount} colaboradores ativos.
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {subscription ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  type="button"
                  loading={saving}
                  disabled={!selectedPlan || selectedPlan.id === subscription.planId}
                  onClick={() => save(subscription.billingType)}
                >
                  Trocar para este plano
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setChoosingPlan(false);
                    setPlanId(subscription.planId);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-ink-primary">2. Escolha como pagar</h2>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" disabled={!selectedPlan} onClick={() => setCardOpen(true)}>
                    Cartão de crédito (automático)
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!selectedPlan}
                    onClick={() => setBoletoOpen(true)}
                  >
                    Pix ou boleto
                  </Button>
                </div>
                {selectedPlan && (
                  <p className="text-xs text-ink-tertiary">
                    {selectedPlan.name}: {formatTierRange(selectedPlan.minCollaborators, selectedPlan.maxCollaborators)}
                    , {formatCentsToBrl(selectedPlan.monthlyPriceCents)} por mês.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      <InfiniteDataTable
        className="lg:min-h-0 lg:flex-1"
        title="Faturas"
        columns={columns}
        initialSlice={initialSlice}
        loadPage={loadPage}
        reloadKey={reloadSignal}
        getRowId={(row) => row.id}
        describe={(loaded, total) => `${loaded} de ${total} faturas`}
        emptyMessage="Nenhuma fatura ainda. Ela aparece aqui assim que o plano for escolhido."
      />

      <CreditCardSubscriptionModal
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        plan={selectedPlan}
        replacing={hasCard}
        onSaved={applySaved}
      />

      <Modal
        open={boletoOpen}
        onClose={() => !saving && setBoletoOpen(false)}
        dismissible={!saving}
        size="sm"
        title="Pagar com Pix ou boleto"
        description={
          selectedPlan
            ? `${selectedPlan.name} · ${formatCentsToBrl(selectedPlan.monthlyPriceCents)}/mês. A fatura chega todo mês, para pagar até o vencimento.`
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" type="button" onClick={() => setBoletoOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" loading={saving} onClick={() => save(boletoType)}>
              Confirmar
            </Button>
          </>
        }
      >
        <Select
          label="Forma de pagamento"
          value={boletoType}
          onChange={(e) => setBoletoType(e.target.value as Exclude<BillingType, "CREDIT_CARD">)}
        >
          <option value="PIX">Pix (QR Code e Copia-e-Cola)</option>
          <option value="BOLETO">Boleto bancário</option>
        </Select>
      </Modal>

      <InvoicePaymentModal
        invoice={selectedInvoice}
        savedCard={savedCard}
        onClose={() => setSelectedInvoice(null)}
        onPayWithCard={(invoice) => {
          setSelectedInvoice(null);
          setPayingInvoice(invoice);
        }}
        onPaid={() => {
          setReloadSignal((c) => c + 1);
          setOverride(null);
          router.refresh();
        }}
      />

      <InvoiceCardPaymentModal
        key={payingInvoice?.id ?? "none"}
        invoice={payingInvoice}
        onClose={() => setPayingInvoice(null)}
        subscriptionHasCard={hasCard}
        savedCard={savedCard}
        onPaid={() => {
          setReloadSignal((c) => c + 1);
          // O pagamento pode ter liberado a empresa e trocado o cartão da
          // assinatura: busca de novo o que o servidor sabe.
          setOverride(null);
          router.refresh();
        }}
      />
    </div>
  );
}

function billingTone(status: Subscription["companyBillingStatus"]): "success" | "warning" | "error" | "neutral" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PAST_DUE":
    case "PENDING":
      return "warning";
    case "SUSPENDED":
    case "CANCELLED":
      return "error";
    default:
      return "neutral";
  }
}

function statusTone(status: InvoiceStatus): "success" | "warning" | "error" | "neutral" {
  switch (status) {
    case "PAID":
      return "success";
    case "PENDING":
      return "warning";
    case "OVERDUE":
      return "error";
    default:
      return "neutral";
  }
}

function formatDateBr(isoDate: string): string {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

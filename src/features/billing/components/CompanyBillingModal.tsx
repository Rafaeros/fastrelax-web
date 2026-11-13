"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, ConfirmDialog, Input, Modal, Select, useToast } from "@/components/ui";
import {
  cancelSubscriptionAction,
  fetchCompanyBillingSummaryAction,
  generateInvoiceAction,
  saveSubscriptionAction,
  simulateInvoiceEventAction,
  cancelInvoiceAction,
} from "@/features/billing/actions/billing.actions";
import { InvoicePaymentModal } from "@/features/billing/components/InvoicePaymentModal";
import { formatCentsToBrl, formatTierRange } from "@/features/billing/lib/format";
import type {
  BillingType,
  Invoice,
  Plan,
  SimulateInvoiceAction,
  Subscription,
} from "@/features/billing/types/billing.types";
import type { Company } from "@/features/companies/types/company.types";

export type CompanyBillingModalProps = {
  company: Company | null;
  onClose: () => void;
  onChanged?: () => void;
  onUpdated?: () => void;
};

export function CompanyBillingModal({
  company,
  onClose,
  onChanged,
  onUpdated,
}: CompanyBillingModalProps) {
  const notifyChange = () => {
    onChanged?.();
    onUpdated?.();
  };
  const [loadedCompanyId, setLoadedCompanyId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [emitting, setEmitting] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [cancelling, setCancelling] = useState<Invoice | null>(null);
  const [cancelPending, setCancelPending] = useState(false);

  const [planId, setPlanId] = useState<string>("");
  const [billingType, setBillingType] = useState<BillingType>("PIX");
  const [nextDueDate, setNextDueDate] = useState<string>(() => defaultDueDate());
  const [autoAdjustTier, setAutoAdjustTier] = useState<boolean>(true);
  const [generateInitialInvoice, setGenerateInitialInvoice] = useState<boolean>(false);
  const [includeSetupFee, setIncludeSetupFee] = useState<boolean>(false);

  const toast = useToast();

  const loadData = useCallback(async (companyId: number) => {
    const data = await fetchCompanyBillingSummaryAction(companyId);
    setSubscription(data.subscription);
    setInvoices(data.invoices);
    setPlans(data.plans);
    if (data.subscription) {
      setPlanId(String(data.subscription.planId));
      setBillingType(data.subscription.billingType);
      setNextDueDate(data.subscription.nextDueDate);
      setAutoAdjustTier(data.subscription.autoAdjustTier);
    } else if (data.plans[0]) {
      setPlanId(String(data.plans[0].id));
    }
    setLoadedCompanyId(companyId);
  }, []);

  useEffect(() => {
    if (!company) return;
    let cancelled = false;
    void (async () => {
      const data = await fetchCompanyBillingSummaryAction(company.id);
      if (cancelled) return;
      setSubscription(data.subscription);
      setInvoices(data.invoices);
      setPlans(data.plans);
      if (data.subscription) {
        setPlanId(String(data.subscription.planId));
        setBillingType(data.subscription.billingType);
        setNextDueDate(data.subscription.nextDueDate);
        setAutoAdjustTier(data.subscription.autoAdjustTier);
      } else if (data.plans[0]) {
        setPlanId(String(data.plans[0].id));
      }
      setLoadedCompanyId(company.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [company]);

  const loading = company !== null && loadedCompanyId !== company.id;

  if (!company) return null;

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveSubscriptionAction({
        companyId: company.id,
        planId: planId ? Number(planId) : null,
        billingType,
        nextDueDate,
        autoAdjustTier,
        generateInitialInvoice,
        includeSetupFee,
      });
      if (res.ok) {
        toast.success(res.message);
        await loadData(company.id);
        notifyChange();
      } else {
        toast.error(res.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEmitInvoice = async (withSetup: boolean) => {
    setEmitting(true);
    try {
      const res = await generateInvoiceAction(company.id, { includeSetupFee: withSetup });
      if (res.ok) {
        toast.success(res.message);
        await loadData(company.id);
        notifyChange();
      } else {
        toast.error(res.message);
      }
    } finally {
      setEmitting(false);
    }
  };

  const handleSimulate = async (invoiceId: number, action: SimulateInvoiceAction) => {
    const res = await simulateInvoiceEventAction(invoiceId, action);
    if (res.ok) {
      toast.success(res.message);
      await loadData(company.id);
      notifyChange();
    } else {
      toast.error(res.message);
    }
  };

  const handleCancelInvoice = async () => {
    if (!cancelling) return;
    setCancelPending(true);
    try {
      const res = await cancelInvoiceAction(cancelling.id, "Cancelada pela equipe da plataforma");
      if (res.ok) {
        toast.success(res.message);
        setCancelling(null);
        await loadData(company.id);
        notifyChange();
      } else {
        toast.error(res.message);
      }
    } finally {
      setCancelPending(false);
    }
  };

  const handleCancelSubscription = async () => {
    const res = await cancelSubscriptionAction(company.id);
    if (res.ok) {
      toast.success(res.message);
      await loadData(company.id);
      notifyChange();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <Modal
        open={Boolean(company)}
        onClose={onClose}
        size="lg"
        title={`Assinatura e Faturas — ${company.name}`}
        description="Gerencie o plano por faixa de colaboradores ativos, emita faturas e homologue o ciclo de carência."
      >
        {loading ? (
          <p className="py-6 text-center text-sm text-ink-tertiary">
            Carregando dados financeiros...
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {subscription && (
              <Card
                padding="md"
                className="flex flex-col gap-2 border-accent/25 bg-linear-to-br from-accent-strong/15 via-surface-card to-surface-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink-primary">
                    {subscription.planName}
                  </span>
                  <Badge
                    tone={
                      subscription.companyBillingStatus === "ACTIVE"
                        ? "success"
                        : subscription.companyBillingStatus === "PAST_DUE"
                          ? "warning"
                          : "error"
                    }
                  >
                    {subscription.companyBillingStatusLabel ?? subscription.companyBillingStatus}
                  </Badge>
                </div>
                <p className="text-xs text-ink-secondary">
                  Quadro atual: <strong>{subscription.activeCollaboratorsCount}</strong>{" "}
                  colaborador(es) ativo(s) · <strong>{subscription.activeChairsCount}</strong>{" "}
                  cadeira(s) ativa(s) · Valor estimado do ciclo:{" "}
                  <strong>{formatCentsToBrl(subscription.estimatedCycleAmountCents)}</strong>
                </p>
              </Card>
            )}

            <form onSubmit={handleSaveSubscription} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-ink-primary">Configurar assinatura</h3>

              <Select
                label="Faixa de plano"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
              >
                <option value="">Automático pela contagem de colaboradores ativos</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatTierRange(p.minCollaborators, p.maxCollaborators)}) —{" "}
                    {formatCentsToBrl(p.monthlyPriceCents)}/mês
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Select
                  label="Forma de cobrança"
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value as BillingType)}
                >
                  <option value="PIX">Pix</option>
                  <option value="BOLETO">Boleto bancário</option>
                  <option value="CREDIT_CARD">Cartão de crédito</option>
                </Select>

                <Input
                  type="date"
                  label="Próximo vencimento"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-ink-secondary">
                <input
                  type="checkbox"
                  checked={autoAdjustTier}
                  onChange={(e) => setAutoAdjustTier(e.target.checked)}
                />
                Reenquadrar faixa automaticamente no fechamento do ciclo conforme colaboradores
                ativos
              </label>

              {!subscription && (
                <div className="flex flex-col gap-2 rounded-lg border border-line p-3">
                  <label className="flex items-center gap-2 text-xs text-ink-secondary">
                    <input
                      type="checkbox"
                      checked={generateInitialInvoice}
                      onChange={(e) => setGenerateInitialInvoice(e.target.checked)}
                    />
                    Já emitir a 1ª fatura agora ao salvar
                  </label>
                  {generateInitialInvoice && (
                    <label className="flex items-center gap-2 text-xs text-ink-secondary">
                      <input
                        type="checkbox"
                        checked={includeSetupFee}
                        onChange={(e) => setIncludeSetupFee(e.target.checked)}
                      />
                      Incluir taxa única de setup por cadeira ativa na 1ª fatura
                    </label>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {subscription && subscription.status !== "CANCELLED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleCancelSubscription}
                  >
                    Encerrar contrato
                  </Button>
                ) : (
                  <span />
                )}
                <Button type="submit" size="sm" variant="primary" loading={saving}>
                  Salvar assinatura
                </Button>
              </div>
            </form>

            {subscription && (
              <div className="flex flex-col gap-3 border-t border-line pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink-primary">
                    Faturas da empresa ({invoices.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      loading={emitting}
                      onClick={() => handleEmitInvoice(false)}
                    >
                      Emitir fatura mensal
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      loading={emitting}
                      onClick={() => handleEmitInvoice(true)}
                    >
                      Emitir c/ setup de cadeira
                    </Button>
                  </div>
                </div>

                {invoices.length === 0 ? (
                  <p className="py-4 text-center text-xs text-ink-tertiary">
                    Nenhuma fatura emitida para esta empresa ainda.
                  </p>
                ) : (
                  <ul className="flex max-h-64 flex-col divide-y divide-line overflow-y-auto rounded-lg border border-line">
                    {invoices.map((inv) => (
                      <li
                        key={inv.id}
                        className="flex flex-col gap-2 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink-primary">
                              #{inv.id} · {formatCentsToBrl(inv.amountCents)}
                            </span>
                            <Badge
                              tone={
                                inv.status === "PAID"
                                  ? "success"
                                  : inv.status === "OVERDUE"
                                    ? "error"
                                    : "warning"
                              }
                            >
                              {inv.statusLabel}
                            </Badge>
                          </div>
                          <span className="text-ink-tertiary">
                            Venc.: {inv.dueDate} · {inv.activeCollaboratorsCount} colab. ·{" "}
                            {inv.activeChairsCount} cadeira(s)
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            Detalhes
                          </Button>
                          {inv.status === "PENDING" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSimulate(inv.id, "MARK_OVERDUE")}
                            >
                              Simular vencimento (5d)
                            </Button>
                          )}
                          {inv.status === "OVERDUE" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSimulate(inv.id, "EXPIRE_GRACE_PERIOD")}
                            >
                              Fim da carência (Suspender)
                            </Button>
                          )}
                          {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setCancelling(inv)}
                            >
                              Cancelar fatura
                            </Button>
                          )}
                          {inv.status !== "PAID" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="primary"
                              onClick={() => handleSimulate(inv.id, "CONFIRM_PAYMENT")}
                            >
                              Confirmar pagamento
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelling)}
        tone="danger"
        title={cancelling ? `Cancelar a fatura #${cancelling.id}?` : "Cancelar fatura"}
        description={
          cancelling
            ? `${cancelling.description} · ${formatCentsToBrl(cancelling.amountCents)}. A cobrança também é cancelada no provedor e deixa de poder ser paga. Se não sobrar fatura vencida, a empresa sai da suspensão.`
            : undefined
        }
        confirmLabel="Cancelar fatura"
        cancelLabel="Voltar"
        pending={cancelPending}
        onConfirm={handleCancelInvoice}
        onCancel={() => setCancelling(null)}
      />

      <InvoicePaymentModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </>
  );
}

function defaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 10);
  return date.toISOString().slice(0, 10);
}

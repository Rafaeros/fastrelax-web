"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, CreditCardPreview, Icon, Input, MaskedInput, Modal, Select, useToast } from "@/components/ui";
import type { CreditCardField } from "@/components/ui";
import { maskCnpjInput, maskCpfInput } from "@/lib/format";
import {
  payMyInvoiceWithCardAction,
  payMyInvoiceWithSavedCardAction,
  subscribeWithCreditCardAction,
} from "@/features/billing/actions/billing.actions";
import {
  CARD_BRAND_LABEL,
  cardBrandLabel,
  cvvLength,
  detectCardBrand,
  formatCardNumber,
  isExpiryValid,
  passesLuhn,
} from "@/features/billing/lib/card";
import { formatCentsToBrl } from "@/features/billing/lib/format";
import type {
  CreditCardSubscriptionInput,
  Invoice,
  Plan,
  Subscription,
} from "@/features/billing/types/billing.types";

/** O que o formulário entrega: cartão e titular, prontos para o backend. */
export type CardFormPayload = Pick<CreditCardSubscriptionInput, "card" | "holder">;

export type CreditCardModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  submitLabel: string;
  /** Texto sob o cartão: o que acontece ao confirmar. */
  note: string;
  /** Opção extra no fim do formulário (ex.: usar nas próximas mensalidades). */
  option?: { label: string; defaultChecked: boolean };
  /** Envia; devolve se deu certo e a mensagem (erro aparece no próprio modal). */
  onSubmit: (payload: CardFormPayload, optionChecked: boolean) => Promise<{ ok: boolean; message: string }>;
};

/**
 * Modal de cartão de crédito, para assinar e para pagar uma fatura.
 *
 * <p>
 * O formulário só existe enquanto o modal está aberto: fechar desmonta tudo, e
 * número, validade e CVV somem da memória da página. Nada vai para
 * localStorage, URL ou log; o envio segue para uma server action, que repassa
 * ao backend, que troca o cartão por um token no provedor de pagamento. A
 * pessoa nunca sai da aplicação.
 */
export function CreditCardModal({
  open,
  onClose,
  title,
  description,
  submitLabel,
  note,
  option,
  onSubmit,
}: CreditCardModalProps) {
  const [pending, setPending] = useState(false);

  return (
    <Modal
      open={open}
      onClose={() => !pending && onClose()}
      dismissible={!pending}
      size="lg"
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" form="credit-card-form" loading={pending}>
            {submitLabel}
          </Button>
        </>
      }
    >
      {open && (
        <CreditCardForm
          note={note}
          option={option}
          onPendingChange={setPending}
          onSubmit={onSubmit}
          onDone={onClose}
        />
      )}
    </Modal>
  );
}

export type CreditCardSubscriptionModalProps = {
  open: boolean;
  onClose: () => void;
  plan: Plan | null;
  /** Já tem cartão: o texto fala em trocar, e a cobrança não é imediata. */
  replacing: boolean;
  onSaved: (subscription: Subscription) => void;
};

/** Cartão da assinatura: assinar no cartão ou trocar o cartão cadastrado. */
export function CreditCardSubscriptionModal({
  open,
  onClose,
  plan,
  replacing,
  onSaved,
}: CreditCardSubscriptionModalProps) {
  const toast = useToast();
  if (!plan) return null;
  return (
    <CreditCardModal
      open={open}
      onClose={onClose}
      title={replacing ? "Trocar cartão de crédito" : "Pagar com cartão de crédito"}
      description={`${plan.name} · ${formatCentsToBrl(plan.monthlyPriceCents)}/mês, cobrado automaticamente todo mês.`}
      submitLabel={replacing ? "Salvar cartão" : "Assinar e pagar"}
      note={
        replacing
          ? "O novo cartão vale a partir da próxima cobrança."
          : "A primeira mensalidade é cobrada agora e libera o app dos colaboradores."
      }
      onSubmit={async (payload) => {
        const result = await subscribeWithCreditCardAction({ planId: plan.id, ...payload });
        if (result.ok && result.subscription) {
          toast.success(result.message);
          onSaved(result.subscription);
        }
        return result;
      }}
    />
  );
}

export type InvoiceCardPaymentModalProps = {
  invoice: Invoice | null;
  onClose: () => void;
  /** Já há cartão na assinatura: permite pagar em 1 clique ou informar outro cartão. */
  subscriptionHasCard: boolean;
  savedCard?: { brand: string | null; last4: string } | null;
  onPaid: (invoice: Invoice) => void;
};

/** Paga uma fatura em aberto no cartão, sem sair da aplicação. */
export function InvoiceCardPaymentModal({
  invoice,
  onClose,
  subscriptionHasCard,
  savedCard,
  onPaid,
}: InvoiceCardPaymentModalProps) {
  const toast = useToast();
  const [useNewCard, setUseNewCard] = useState(false);
  const [payingSaved, setPayingSaved] = useState(false);
  const [savedError, setSavedError] = useState<string>();

  if (!invoice) return null;

  const canUseSavedCard = Boolean(savedCard?.last4) && !useNewCard;

  if (canUseSavedCard && savedCard) {
    const label = `${cardBrandLabel(savedCard.brand)} final ${savedCard.last4}`;
    const handlePaySaved = async () => {
      setPayingSaved(true);
      setSavedError(undefined);
      try {
        const result = await payMyInvoiceWithSavedCardAction(invoice.id);
        if (result.ok && result.invoice) {
          if (result.invoice.status === "PAID") toast.success(result.message);
          else toast.toast(result.message, { tone: "info" });
          onPaid(result.invoice);
          onClose();
        } else {
          setSavedError(result.message);
        }
      } finally {
        setPayingSaved(false);
      }
    };

    return (
      <Modal
        open
        onClose={() => {
          if (!payingSaved) {
            setUseNewCard(false);
            setSavedError(undefined);
            onClose();
          }
        }}
        dismissible={!payingSaved}
        size="md"
        title={`Pagar fatura #${invoice.id}`}
        description={`${invoice.description} · ${formatCentsToBrl(invoice.amountCents)}`}
        footer={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setUseNewCard(false);
                setSavedError(undefined);
                onClose();
              }}
              disabled={payingSaved}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setSavedError(undefined);
                setUseNewCard(true);
              }}
              disabled={payingSaved}
            >
              Usar outro cartão
            </Button>
            <Button type="button" loading={payingSaved} onClick={handlePaySaved}>
              {`Pagar ${formatCentsToBrl(invoice.amountCents)} com final ${savedCard.last4}`}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {savedError && <Alert tone="error">{savedError}</Alert>}
          <div className="flex items-center justify-between gap-3 rounded-card border border-accent/40 bg-accent/10 p-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-tertiary">
                Cartão cadastrado na assinatura
              </span>
              <span className="font-semibold text-ink-primary">{label}</span>
            </div>
            <Icon name="lock" className="h-5 w-5 text-accent" />
          </div>
          <p className="text-xs leading-relaxed text-ink-secondary">
            O pagamento será cobrado imediatamente no cartão já cadastrado na sua assinatura. Se preferir,
            clique em <strong>Usar outro cartão</strong>.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <CreditCardModal
      open
      onClose={() => {
        setUseNewCard(false);
        onClose();
      }}
      title={`Pagar fatura #${invoice.id}`}
      description={`${invoice.description} · ${formatCentsToBrl(invoice.amountCents)}`}
      submitLabel={`Pagar ${formatCentsToBrl(invoice.amountCents)}`}
      note="O valor é cobrado agora. Assim que o pagamento é aprovado, a fatura aparece como paga."
      option={{
        label: "Usar este cartão nas próximas mensalidades (cobrança automática)",
        defaultChecked: !subscriptionHasCard,
      }}
      onSubmit={async (payload, useForSubscription) => {
        const result = await payMyInvoiceWithCardAction(invoice.id, { ...payload, useForSubscription });
        if (result.ok && result.invoice) {
          if (result.invoice.status === "PAID") toast.success(result.message);
          else toast.toast(result.message, { tone: "info" });
          onPaid(result.invoice);
        }
        return result;
      }}
    />
  );
}

type Errors = Partial<
  Record<
    "number" | "holderName" | "expiry" | "ccv" | "name" | "email" | "cpfCnpj" | "postalCode" | "addressNumber" | "phone",
    string
  >
>;

function CreditCardForm({
  note,
  option,
  onPendingChange,
  onSubmit,
  onDone,
}: {
  note: string;
  option?: { label: string; defaultChecked: boolean };
  onPendingChange: (pending: boolean) => void;
  onSubmit: CreditCardModalProps["onSubmit"];
  onDone: () => void;
}) {
  const [optionChecked, setOptionChecked] = useState(option?.defaultChecked ?? false);
  const [focused, setFocused] = useState<CreditCardField | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();

  const [number, setNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [ccv, setCcv] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [phone, setPhone] = useState("");

  const brand = detectCardBrand(number);
  const maxCvv = cvvLength(brand);
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => String(thisYear + i));

  const focusProps = (field: CreditCardField) => ({
    onFocus: () => setFocused(field),
    onBlur: () => setFocused(null),
  });

  const validate = (): Errors => {
    const e: Errors = {};
    if (!passesLuhn(number)) e.number = "Número do cartão inválido. Confira os dígitos.";
    if (holderName.trim().length < 2) e.holderName = "Informe o nome como está impresso no cartão.";
    if (!isExpiryValid(month, year)) e.expiry = "Validade vencida ou incompleta.";
    if (ccv.length !== maxCvv) e.ccv = `O código tem ${maxCvv} dígitos.`;
    if (name.trim().length < 2) e.name = "Informe o nome do titular.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "E-mail inválido.";
    if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) e.cpfCnpj = "Informe um CPF ou CNPJ completo.";
    if (postalCode.length !== 8) e.postalCode = "CEP incompleto.";
    if (!addressNumber.trim()) e.addressNumber = "Informe o número.";
    if (phone.length < 10) e.phone = "Telefone incompleto.";
    return e;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setFormError(undefined);
    if (Object.keys(found).length > 0) return;

    onPendingChange(true);
    try {
      const result = await onSubmit(
        {
          card: { holderName: holderName.trim(), number, expiryMonth: month, expiryYear: year, ccv },
          holder: {
            name: name.trim(),
            email: email.trim(),
            cpfCnpj,
            postalCode,
            addressNumber: addressNumber.trim(),
            phone,
          },
        },
        optionChecked,
      );
      if (result.ok) {
        onDone();
      } else {
        // Cartão recusado, dado do titular inválido etc.: a mensagem vem do
        // backend em português e sem detalhe técnico.
        setFormError(result.message);
      }
    } finally {
      onPendingChange(false);
    }
  };

  return (
    <form
      id="credit-card-form"
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start"
    >
      <div className="flex flex-col gap-4 md:sticky md:top-0">
        <CreditCardPreview
          number={number}
          holder={holderName}
          month={month}
          year={year}
          cvvLength={ccv.length}
          brandLabel={CARD_BRAND_LABEL[brand]}
          focused={focused}
          className="mx-auto w-full max-w-[22rem]"
        />
        <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-tertiary">
          <Icon name="lock" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          O cartão é validado pelo provedor de pagamento e não fica salvo no nosso sistema:
          guardamos só a bandeira e os 4 últimos dígitos. {note}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {formError && <Alert tone="error">{formError}</Alert>}

        <Input
          label="Número do cartão"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={formatCardNumber(number)}
          onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 19))}
          error={errors.number}
          leadingIcon={<Icon name="key" />}
          {...focusProps("number")}
        />
        <Input
          label="Nome impresso no cartão"
          autoComplete="cc-name"
          placeholder="MARIA S OLIVEIRA"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value.toUpperCase().slice(0, 100))}
          error={errors.holderName}
          {...focusProps("holder")}
        />
        <div className="grid grid-cols-[1fr_1fr_0.9fr] gap-3">
          <Select
            label="Mês"
            autoComplete="cc-exp-month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            error={errors.expiry}
            {...focusProps("expiry")}
          >
            <option value="" disabled>
              MM
            </option>
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select
            label="Ano"
            autoComplete="cc-exp-year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            {...focusProps("expiry")}
          >
            <option value="" disabled>
              AAAA
            </option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Input
            label="CVV"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder={"•".repeat(maxCvv)}
            value={ccv}
            onChange={(e) => setCcv(e.target.value.replace(/\D/g, "").slice(0, maxCvv))}
            error={errors.ccv}
            {...focusProps("cvv")}
          />
        </div>

        <fieldset className="flex flex-col gap-4 border-t border-line pt-4">
          <legend className="pb-1 text-sm font-semibold text-ink-primary">Titular do cartão</legend>
          <Input
            label="Nome completo"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 120))}
            error={errors.name}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="CPF ou CNPJ"
              inputMode="numeric"
              value={cpfCnpj.length > 11 ? maskCnpjInput(cpfCnpj) : maskCpfInput(cpfCnpj)}
              onChange={(e) => setCpfCnpj(e.target.value.replace(/\D/g, "").slice(0, 14))}
              error={errors.cpfCnpj}
            />
            <MaskedInput
              mask="phone"
              label="Telefone"
              autoComplete="tel"
              value={phone}
              onValueChange={(digits) => setPhone(digits.slice(0, 11))}
              error={errors.phone}
            />
          </div>
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.slice(0, 120))}
            error={errors.email}
          />
          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <MaskedInput
              mask="cep"
              label="CEP da fatura do cartão"
              autoComplete="postal-code"
              value={postalCode}
              onValueChange={(digits) => setPostalCode(digits.slice(0, 8))}
              error={errors.postalCode}
            />
            <Input
              label="Número"
              autoComplete="address-line2"
              value={addressNumber}
              onChange={(e) => setAddressNumber(e.target.value.slice(0, 10))}
              error={errors.addressNumber}
            />
          </div>
        </fieldset>

        {option && (
          <label className="flex items-start gap-2.5 rounded-control border border-line bg-bg-900/60 p-3 text-sm text-ink-secondary">
            <input
              type="checkbox"
              className="mt-0.5 accent-[var(--color-copper-500)]"
              checked={optionChecked}
              onChange={(e) => setOptionChecked(e.target.checked)}
            />
            {option.label}
          </label>
        )}
      </div>
    </form>
  );
}

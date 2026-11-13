"use client";

import { useState } from "react";
import { Alert, Badge, Button, CopyField, DetailList, Modal, useToast } from "@/components/ui";
import type { DetailItem } from "@/components/ui";
import { formatLongDateTime } from "@/lib/format";
import { payMyInvoiceWithSavedCardAction } from "@/features/billing/actions/billing.actions";
import { cardBrandLabel } from "@/features/billing/lib/card";
import { formatCentsToBrl } from "@/features/billing/lib/format";
import type { Invoice, InvoiceStatus } from "@/features/billing/types/billing.types";

export type InvoicePaymentModalProps = {
  invoice: Invoice | null;
  onClose: () => void;
  savedCard?: { brand: string | null; last4: string } | null;
  /** Presente na visão da empresa: abre o formulário para pagar com outro cartão. */
  onPayWithCard?: (invoice: Invoice) => void;
  /** Disparado quando o pagamento com o cartão salvo é concluído direto neste modal. */
  onPaid?: (invoice: Invoice) => void;
};

export function InvoicePaymentModal({
  invoice,
  onClose,
  savedCard,
  onPayWithCard,
  onPaid,
}: InvoicePaymentModalProps) {
  const toast = useToast();
  const [payingSaved, setPayingSaved] = useState(false);
  const [error, setError] = useState<string>();

  if (!invoice) return null;
  const open = invoice.status === "PENDING" || invoice.status === "OVERDUE";
  const hasSavedCard = Boolean(savedCard?.last4);

  const handlePayWithSavedCard = async () => {
    setPayingSaved(true);
    setError(undefined);
    try {
      const result = await payMyInvoiceWithSavedCardAction(invoice.id);
      if (result.ok && result.invoice) {
        if (result.invoice.status === "PAID") toast.success(result.message);
        else toast.toast(result.message, { tone: "info" });
        onPaid?.(result.invoice);
        onClose();
      } else {
        setError(result.message);
      }
    } finally {
      setPayingSaved(false);
    }
  };

  const items: DetailItem[] = [
    { label: "Descrição", value: invoice.description, full: true },
    { label: "Competência", value: invoice.referenceMonth ?? "—" },
    { label: "Vencimento", value: formatDateBr(invoice.dueDate) },
    { label: "Valor", value: formatCentsToBrl(invoice.amountCents) },
    {
      label: "Forma de pagamento",
      value:
        invoice.billingType === "CREDIT_CARD" && savedCard?.last4
          ? `${cardBrandLabel(savedCard.brand)} final ${savedCard.last4}`
          : invoice.billingTypeLabel,
    },
    {
      label: "Colaboradores ativos medidos",
      value: `${invoice.activeCollaboratorsCount} colaborador(es)`,
    },
    {
      label: "Cadeiras ativas medidas",
      value: `${invoice.activeChairsCount} cadeira(s)`,
    },
    {
      label: "Situação",
      value: <Badge tone={statusTone(invoice.status)}>{invoice.statusLabel}</Badge>,
    },
    ...(invoice.paidAt
      ? [{ label: "Pago em", value: formatLongDateTime(invoice.paidAt) }]
      : []),
  ];

  const qrSrc = invoice.pixQrCodeBase64
    ? invoice.pixQrCodeBase64.trim().startsWith("PHN2Zy")
      ? `data:image/svg+xml;base64,${invoice.pixQrCodeBase64}`
      : `data:image/png;base64,${invoice.pixQrCodeBase64}`
    : null;

  return (
    <Modal
      open={Boolean(invoice)}
      onClose={() => {
        if (!payingSaved) {
          setError(undefined);
          onClose();
        }
      }}
      dismissible={!payingSaved}
      title={`Fatura #${invoice.id}`}
      description={invoice.companyName}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          {/* Boleto precisa do PDF do banco; Pix e cartão se pagam aqui mesmo. */}
          {open && invoice.billingType === "BOLETO" && invoice.invoiceUrl ? (
            <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" type="button">
                Abrir boleto
              </Button>
            </a>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              type="button"
              disabled={payingSaved}
              onClick={() => {
                setError(undefined);
                onClose();
              }}
            >
              Fechar
            </Button>
            {open && onPayWithCard && hasSavedCard && savedCard && (
              <>
                <Button
                  variant="secondary"
                  type="button"
                  disabled={payingSaved}
                  onClick={() => {
                    setError(undefined);
                    onPayWithCard(invoice);
                  }}
                >
                  Usar outro cartão
                </Button>
                <Button type="button" loading={payingSaved} onClick={handlePayWithSavedCard}>
                  {`Pagar com ${cardBrandLabel(savedCard.brand)} •••• ${savedCard.last4}`}
                </Button>
              </>
            )}
            {open && onPayWithCard && !hasSavedCard && (
              <Button type="button" onClick={() => onPayWithCard(invoice)}>
                Pagar com cartão
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {error && <Alert tone="error">{error}</Alert>}
        <DetailList items={items} />

        {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && invoice.pixCopyPaste && (
          <div className="flex flex-col gap-4 rounded-card border border-line bg-bg-900/70 p-4">
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-ink-primary">Pagamento via Pix</h3>
              <p className="text-xs text-ink-tertiary">
                Escaneie o QR Code no aplicativo do banco ou copie o código Pix Copia-e-Cola. A
                liberação acontece sozinha assim que o pagamento é confirmado.
              </p>
            </div>

            {qrSrc && (
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSrc}
                  alt="QR Code Pix da fatura"
                  className="h-44 w-44 rounded-lg border border-line bg-white p-2"
                />
              </div>
            )}

            <CopyField label="Pix Copia-e-Cola" value={invoice.pixCopyPaste} />
          </div>
        )}
      </div>
    </Modal>
  );
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

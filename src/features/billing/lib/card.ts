/**
 * Utilidades de cartão para o formulário de assinatura.
 *
 * <p>
 * Só validam formato no navegador, para o erro aparecer antes do envio. Quem
 * decide se o cartão vale é o provedor de pagamento, na tokenização.
 */

export type CardBrand = "VISA" | "MASTERCARD" | "ELO" | "AMEX" | "HIPERCARD" | "UNKNOWN";

export const CARD_BRAND_LABEL: Record<CardBrand, string> = {
  VISA: "Visa",
  MASTERCARD: "Mastercard",
  ELO: "Elo",
  AMEX: "Amex",
  HIPERCARD: "Hipercard",
  UNKNOWN: "Cartão",
};

const ELO_PREFIXES =
  /^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/;

/** Mesma regra do backend (AsaasAdapter.detectBrand). Elo antes de Visa: alguns BINs Elo começam com 4. */
export function detectCardBrand(digits: string): CardBrand {
  if (ELO_PREFIXES.test(digits)) return "ELO";
  if (/^4/.test(digits)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "MASTERCARD";
  if (/^3[47]/.test(digits)) return "AMEX";
  if (/^(606282|3841)/.test(digits)) return "HIPERCARD";
  return "UNKNOWN";
}

/** Rótulo para exibição a partir do que o backend guardou (ex.: "MASTERCARD"). */
export function cardBrandLabel(brand: string | null | undefined): string {
  if (!brand) return CARD_BRAND_LABEL.UNKNOWN;
  return CARD_BRAND_LABEL[brand.toUpperCase() as CardBrand] ?? brand;
}

export function passesLuhn(digits: string): boolean {
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Amex agrupa 4-6-5; os demais, de 4 em 4. */
export function formatCardNumber(digits: string): string {
  if (detectCardBrand(digits) === "AMEX") {
    return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean).join(" ");
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function cvvLength(brand: CardBrand): number {
  return brand === "AMEX" ? 4 : 3;
}

/** Validade ainda não vencida (o cartão vale até o último dia do mês). */
export function isExpiryValid(month: string, year: string, now = new Date()): boolean {
  const m = Number(month);
  const y = Number(year);
  if (!m || !y || m < 1 || m > 12) return false;
  return y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1);
}

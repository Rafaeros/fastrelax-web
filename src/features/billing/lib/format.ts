export function formatCentsToBrl(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || Number.isNaN(cents)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function centsToReaisInput(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || Number.isNaN(cents)) return "0,00";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function formatTierRange(min: number, max: number | null | undefined): string {
  if (max === null || max === undefined) {
    return `Acima de ${min - 1} colaboradores`;
  }
  if (min <= 1) {
    return `Até ${max} colaboradores`;
  }
  return `${min} a ${max} colaboradores`;
}

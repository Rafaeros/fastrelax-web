"use client";

import { cn } from "@/lib/cn";

export type CreditCardField = "number" | "holder" | "expiry" | "cvv";

export type CreditCardPreviewProps = {
  /** Só dígitos. */
  number: string;
  holder: string;
  /** "01".."12" ou vazio. */
  month: string;
  /** "2026" ou vazio. */
  year: string;
  /** Quantos dígitos de CVV já foram digitados (o valor nunca chega aqui). */
  cvvLength: number;
  /** Nome da bandeira para o canto do cartão. */
  brandLabel: string;
  /** Campo em edição: destaca a área correspondente; "cvv" vira o cartão. */
  focused?: CreditCardField | null;
  className?: string;
};

const SLOTS = 16;

/**
 * Cartão de crédito ilustrado que acompanha o formulário.
 *
 * <p>
 * Os dígitos entram deslizando no lugar do "#", os do meio aparecem
 * mascarados (como num comprovante), e o foco no CVV vira o cartão. É só
 * decoração: fica {@code aria-hidden}, e quem usa leitor de tela preenche os
 * campos normalmente. Com movimento reduzido, nada desliza nem gira — o verso
 * só troca de lugar com a frente.
 */
export function CreditCardPreview({
  number,
  holder,
  month,
  year,
  cvvLength,
  brandLabel,
  focused,
  className,
}: CreditCardPreviewProps) {
  const flipped = focused === "cvv";
  const digits = number.slice(0, SLOTS).split("");

  const region = (field: CreditCardField) =>
    cn(
      "rounded-md px-1.5 py-1 -mx-1.5 -my-1 transition-shadow duration-300",
      focused === field && "shadow-[0_0_0_1px_var(--color-copper-300),0_0_14px_-2px_var(--color-copper-400)]",
    );

  return (
    <div aria-hidden="true" className={cn("[perspective:1200px]", className)}>
      <div
        className={cn(
          "relative aspect-[1.586] w-full transition-transform duration-700 [transform-style:preserve-3d]",
          "motion-reduce:transition-none",
          flipped && "[transform:rotateY(180deg)]",
        )}
      >
        {/* Frente */}
        <div className={cn(FACE, "flex flex-col justify-between p-[6%]")}>
          <Glow />
          <div className="relative flex items-start justify-between">
            <Chip />
            <span className="font-display text-lg tracking-wide text-ink-primary">{brandLabel}</span>
          </div>

          <div className={cn("relative flex font-mono text-[clamp(1rem,5.2cqw,1.45rem)] text-ink-primary", region("number"))}>
            {Array.from({ length: SLOTS }, (_, i) => {
              const filled = i < digits.length;
              const masked = i >= 4 && i <= 11;
              return (
                <span
                  key={i}
                  className={cn("inline-flex h-[1.4em] overflow-hidden", i % 4 === 3 && i < SLOTS - 1 && "mr-[0.55em]")}
                >
                  <span
                    className={cn(
                      "flex flex-col leading-[1.4em] transition-transform duration-200 motion-reduce:transition-none",
                      filled && "-translate-y-[1.4em]",
                    )}
                  >
                    <span className="text-ink-tertiary">#</span>
                    <span>{filled ? (masked ? "•" : digits[i]) : "#"}</span>
                  </span>
                </span>
              );
            })}
          </div>

          <div className="relative flex items-end justify-between gap-4 text-ink-primary">
            <div className={cn("min-w-0", region("holder"))}>
              <div className="text-[0.625rem] font-semibold tracking-[0.14em] text-ink-tertiary">TITULAR</div>
              <div className="truncate text-sm font-medium uppercase">{holder || "Nome no cartão"}</div>
            </div>
            <div className={cn("shrink-0 text-right", region("expiry"))}>
              <div className="text-[0.625rem] font-semibold tracking-[0.14em] text-ink-tertiary">VALIDADE</div>
              <div className="font-mono text-sm tabular-nums">
                {month || "MM"}/{year ? year.slice(-2) : "AA"}
              </div>
            </div>
          </div>
        </div>

        {/* Verso */}
        <div className={cn(FACE, "[transform:rotateY(180deg)] pt-[8%]")}>
          <Glow />
          <div className="relative h-[18%] w-full bg-bg-950" />
          <div className="relative mt-[7%] flex flex-col items-end gap-1.5 px-[6%]">
            <span className="text-[0.625rem] font-semibold tracking-[0.14em] text-ink-tertiary">CVV</span>
            <div className="flex h-10 w-full items-center justify-end rounded-control bg-neutral-50 px-3 font-mono text-lg tracking-widest text-bg-950">
              {"•".repeat(cvvLength)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FACE =
  "absolute inset-0 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-bg-800 via-bg-900 to-bg-950 " +
  "shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)] [backface-visibility:hidden] [container-type:inline-size]";

/** Dois anéis desfocados em cobre e ouro, as cores da marca. */
function Glow() {
  return (
    <>
      <span className="pointer-events-none absolute -left-[18%] -top-[30%] h-[120%] w-[70%] rounded-full border-[14px] border-copper-500/45 blur-[14px]" />
      <span className="pointer-events-none absolute -bottom-[60%] -right-[10%] h-[110%] w-[70%] rounded-full border-[14px] border-[#E0B360]/30 blur-[14px]" />
    </>
  );
}

function Chip() {
  return (
    <span className="grid h-8 w-11 grid-cols-3 gap-px overflow-hidden rounded-md bg-gradient-to-br from-copper-200 to-copper-500 p-1 opacity-90">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="rounded-[2px] bg-copper-300/60" />
      ))}
    </span>
  );
}

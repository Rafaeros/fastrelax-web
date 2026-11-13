"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

type TocItem = { id: string; title: string };

/**
 * Índice do documento com a seção atual acesa.
 *
 * <p>
 * A seção "atual" é a última cujo título já passou da faixa superior da tela —
 * o observer só avisa quando um título cruza essa faixa, sem ouvir cada scroll.
 */
export function LegalToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        if (visible.length) setActive(visible[0]);
      },
      // Faixa entre 15% e 45% da altura: a seção acende quando o título chega
      // à região onde o olho está lendo, não quando aparece no rodapé.
      { rootMargin: "-15% 0px -55% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  // Uma lista por layout; cada uma com o próprio layoutId, senão os dois
  // marcadores (um escondido por CSS) disputam a mesma animação.
  const list = (markerId: string) => (
    <ol className="flex flex-col gap-0.5">
      {items.map((item, i) => {
        const on = item.id === active;
        return (
          <li key={item.id} className="relative">
            {on && (
              <motion.span
                layoutId={markerId}
                className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <a
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              aria-current={on ? "location" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-control py-2 pr-2 pl-4 text-sm leading-snug transition-colors",
                "focus-visible:outline-none focus-visible:shadow-focus",
                on ? "text-ink-primary" : "text-ink-muted hover:text-ink-primary",
              )}
            >
              <span className="w-5 shrink-0 text-ink-tertiary">{i + 1}.</span>
              {item.title}
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <nav aria-label="Índice do documento" className="lg:sticky lg:top-28 lg:self-start">
      {/* Celular: índice recolhido atrás de um botão. */}
      <div className="rounded-card border border-line bg-surface-nav lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex min-h-12 w-full items-center justify-between px-4 text-sm font-semibold text-ink-primary"
        >
          Índice
          <Icon name="chevronRight" className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
        </button>
        {open && <div className="border-t border-line px-1 py-2">{list("toc-marker-mobile")}</div>}
      </div>

      <div className="hidden lg:block">{list("toc-marker")}</div>
    </nav>
  );
}

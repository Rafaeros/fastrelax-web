"use client";

import type { HTMLAttributes, MouseEvent } from "react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Cartão com um foco de luz cobre que segue o ponteiro (padrão SpotlightCard
 * do React Bits).
 *
 * <p>
 * A posição vai para variáveis CSS no próprio elemento, sem estado React: mover
 * o mouse não re-renderiza nada, só muda duas custom properties lidas pelo
 * gradiente do {@code ::before}.
 */
export function SpotlightCard({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn("spotlight-card relative overflow-hidden", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

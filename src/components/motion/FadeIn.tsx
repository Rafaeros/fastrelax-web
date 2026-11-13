import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Entrada única no carregamento (não no scroll), usada só na sequência do
 * hero. Em CSS pelo mesmo motivo do {@link TextReveal}: o conteúdo da primeira
 * tela não pode depender da hidratação para aparecer.
 */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <div className={cn("enter-up", className)} style={{ "--d": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}

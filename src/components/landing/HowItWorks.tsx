"use client";

import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Container, Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { APP_FLOW } from "./app-flow/AppFlow";

// Só no cliente: ver o comentário em AppFlowPlayer sobre a hidratação.
const AppFlowPlayer = dynamic(() => import("./app-flow/AppFlowPlayer"), {
  ssr: false,
  loading: () => (
    <div className="bg-bg-950" style={{ aspectRatio: `${APP_FLOW.width} / ${APP_FLOW.height}` }} />
  ),
});

const STEPS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "calendar",
    title: "Reserva o horário",
    description: "Escolhe o dia, um horário livre dentro da janela liberada pela empresa e a cadeira.",
  },
  {
    icon: "bell",
    title: "Recebe o lembrete",
    description: "Uma notificação avisa dez minutos antes, com a cadeira e o andar.",
  },
  {
    icon: "chair",
    title: "Inicia pelo celular",
    description: "No horário marcado, toca em Iniciar agora e a cadeira liga. Fora do horário, não liga.",
  },
  {
    icon: "clock",
    title: "Relaxa até o fim",
    description: "O app conta o tempo que falta e a cadeira desliga sozinha ao fim do programa.",
  },
];

/**
 * Como funciona: os quatro passos do colaborador ao lado do app em movimento.
 *
 * <p>
 * O celular toca a composição Remotion em laço; a cena atual acende o passo
 * correspondente, e clicar num passo leva o vídeo até ele. Com movimento
 * reduzido o vídeo fica parado e só os cliques trocam a cena.
 */
export function HowItWorks() {
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [seek, setSeek] = useState<{ frame: number; n: number } | null>(null);

  // Toca só enquanto a seção está na tela.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    setStep(index);
    // Um pouco depois do corte para a cena já estar montada; com movimento
    // reduzido, o quadro em que a cena já terminou de acontecer.
    setSeek((prev) => ({ frame: index * APP_FLOW.scene + (reduce ? 80 : 4), n: (prev?.n ?? 0) + 1 }));
  };

  return (
    <section ref={section} id="como-funciona" className="relative overflow-hidden bg-surface-nav py-20 lg:py-28">
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-[1.9rem] leading-tight text-ink-primary sm:text-[2.6rem]">
                Do celular à cadeira em quatro passos
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-ink-secondary">
                O colaborador não pede autorização a ninguém nem disputa fila: reserva, recebe o aviso e
                liga a cadeira pelo app.
              </p>
            </div>

            <ol className="flex flex-col gap-2">
              {STEPS.map((s, i) => {
                const active = i === step;
                return (
                  <li key={s.title}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "group relative flex w-full items-start gap-4 rounded-card border p-4 text-left",
                        "transition-colors duration-300 focus-visible:outline-none focus-visible:shadow-focus",
                        active
                          ? "border-accent/40 bg-surface-card"
                          : "border-transparent hover:bg-surface-card/60",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-control border transition-colors duration-300",
                          active ? "border-accent bg-accent text-ink-inverse" : "border-line bg-bg-900 text-accent-soft",
                        )}
                      >
                        <Icon name={s.icon} className="h-5 w-5" />
                      </span>
                      <span className="flex flex-col gap-1">
                        <span className="text-base font-semibold text-ink-primary">
                          <span className="mr-2 text-ink-tertiary">{i + 1}.</span>
                          {s.title}
                        </span>
                        <span className="text-sm leading-relaxed text-ink-secondary">{s.description}</span>
                      </span>
                      {/* Barra de progresso da cena atual. */}
                      {active && !reduce && (
                        <span
                          key={step}
                          className="absolute inset-x-4 bottom-0 h-px origin-left bg-accent"
                          style={{ animation: `step-progress ${APP_FLOW.scene / APP_FLOW.fps}s linear forwards` }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Moldura de celular; a composição tem a proporção da tela. */}
          <div className="mx-auto w-full max-w-[330px]">
            <div className="rounded-[2.6rem] border border-line bg-bg-800 p-2.5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(194,121,60,0.12)]">
              <div className="relative overflow-hidden rounded-[2.1rem]">
                <AppFlowPlayer
                  playing={visible && !reduce}
                  initialFrame={reduce ? 80 : 0}
                  seek={seek}
                  onSceneChange={setStep}
                />
                {/* Ilha da câmera. */}
                <div className="pointer-events-none absolute left-1/2 top-2.5 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

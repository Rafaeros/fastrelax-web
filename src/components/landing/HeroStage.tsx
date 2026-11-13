"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useState } from "react";
import { assets } from "@/config/brand";
import { cn } from "@/lib/cn";
import { PROGRAMS } from "./chair3d/programs";

/** Foto recortada da cadeira: pôster enquanto o 3D carrega e fallback sem WebGL. */
function ChairPoster() {
  return (
    <Image
      src={assets.heroChair}
      alt=""
      fill
      priority
      sizes="(max-width: 1024px) 90vw, 50vw"
      className="object-contain p-6"
    />
  );
}

// three + drei somam algumas centenas de KB: ficam fora do bundle inicial e
// só chegam depois que a página já pintou com o pôster.
const ChairScene = dynamic(
  () => import("./chair3d/ChairScene").then((m) => m.ChairScene),
  { ssr: false, loading: () => <ChairPoster /> },
);

/**
 * Cadeira 3D com o seletor de programa.
 *
 * <p>
 * Escolher um programa reclina a cadeira até a pose dele e move os pulsos de
 * massagem para a região que ele trabalha — a cadeira mostra o que o programa
 * faz em vez de um texto descrever.
 */
export function HeroStage() {
  const reduce = useReducedMotion() ?? false;
  const [programId, setProgramId] = useState(PROGRAMS[2].id);
  const program = PROGRAMS.find((p) => p.id === programId) ?? PROGRAMS[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Entrada em CSS: o pôster da cadeira aparece antes da hidratação. */}
      <div className="enter-up relative aspect-[5/4] w-full" style={{ "--d": "0.25s" } as CSSProperties}>
        {/* Halo cobre atrás da cadeira: separa o couro preto do fundo escuro. */}
        <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(194,121,60,0.28),transparent)] blur-2xl" />
        <ChairScene program={program} still={reduce} fallback={<ChairPoster />} />
      </div>

      <div
        role="group"
        aria-label="Programa de massagem"
        className="grid grid-cols-3 gap-1 rounded-card border border-line bg-surface-nav/80 p-1 backdrop-blur"
      >
        {PROGRAMS.map((p) => {
          const active = p.id === program.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => setProgramId(p.id)}
              className={cn(
                "relative flex min-h-14 flex-col items-center justify-center rounded-[0.6rem] px-2 py-2 text-center",
                "transition-colors duration-200 focus-visible:outline-none focus-visible:shadow-focus",
                active ? "text-ink-inverse" : "text-ink-secondary hover:text-ink-primary",
              )}
            >
              {active && (
                <motion.span
                  layoutId="program-pill"
                  className="absolute inset-0 rounded-[0.6rem] bg-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative text-sm font-semibold leading-tight">{p.name}</span>
              <span className={cn("relative text-xs", active ? "text-ink-inverse/80" : "text-ink-tertiary")}>
                {p.minutes} min
              </span>
            </button>
          );
        })}
      </div>

      {/* aria-live: quem não vê a cadeira ouve o que mudou ao trocar o programa. */}
      <div aria-live="polite" className="min-h-12 px-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={program.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm leading-relaxed text-ink-secondary"
          >
            <span className="font-semibold text-ink-primary">{program.focus}.</span>{" "}
            {program.description}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

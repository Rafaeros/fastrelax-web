import Image from "next/image";
import { Container } from "@/components/ui";
import { assets } from "@/config/brand";
import { cn } from "@/lib/cn";
import type { ProgramId } from "./chair3d/programs";
import { PROGRAMS } from "./chair3d/programs";

const PHOTO: Record<ProgramId, string> = {
  relax: assets.programs.relax,
  shiatsu: assets.programs.shiatsu,
  zeroGravity: assets.programs.zeroGravity,
};

const ALT: Record<ProgramId, string> = {
  relax: "Homem sentado na cadeira de massagem, de olhos fechados, num escritório",
  shiatsu: "Encosto de couro da cadeira, com os canais por onde passam os roletes",
  zeroGravity: "Homem totalmente reclinado na cadeira, com as pernas elevadas",
};

/**
 * Programas: as três sessões em foto.
 *
 * <p>
 * Grade assimétrica — o Zero Gravity, a sessão mais longa, ocupa a coluna
 * inteira; os dois programas curtos dividem a outra. Os dados vêm de
 * {@code PROGRAMS}, a mesma fonte do seletor que reclina a cadeira 3D no topo.
 */
export function Programs() {
  const ordered = [PROGRAMS[2], PROGRAMS[0], PROGRAMS[1]];

  return (
    <section id="programas" className="bg-surface-base py-20 lg:py-28">
      <Container size="wide">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl font-display text-[1.9rem] leading-tight text-ink-primary sm:text-[2.6rem]">
            Três programas, de dez a trinta minutos
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-ink-secondary">
            O colaborador escolhe no app ao reservar, e a cadeira já liga no programa certo.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:h-[min(78vh,720px)] lg:grid-cols-2 lg:grid-rows-2">
          {ordered.map((program, i) => {
            const lead = i === 0;
            return (
              <article
                key={program.id}
                className={cn(
                  "photo-zoom group relative overflow-hidden rounded-card border border-line bg-bg-900",
                  // Retrato no celular: o texto fica abaixo do rosto na foto, não por cima.
                  "aspect-[4/5] sm:aspect-[16/11] lg:aspect-auto",
                  lead && "lg:row-span-2",
                )}
              >
                <Image
                  src={PHOTO[program.id]}
                  alt={ALT[program.id]}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={cn("object-cover", program.id === "relax" ? "object-[50%_30%]" : "object-center")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-950 via-bg-950/55 via-35% to-transparent to-70%" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
                  <div className="flex flex-col gap-1.5">
                    <h3 className={cn("font-display text-ink-primary", lead ? "text-3xl sm:text-4xl" : "text-2xl")}>
                      {program.name}
                    </h3>
                    <p className="max-w-sm text-sm leading-relaxed text-ink-secondary">{program.description}</p>
                    <dl className="mt-2 flex flex-wrap gap-2 text-xs">
                      <div className="rounded-pill border border-line/80 bg-bg-950/60 px-3 py-1 backdrop-blur">
                        <dt className="sr-only">Foco</dt>
                        <dd className="text-ink-primary">{program.focus}</dd>
                      </div>
                      <div className="rounded-pill border border-line/80 bg-bg-950/60 px-3 py-1 backdrop-blur">
                        <dt className="sr-only">Intensidade</dt>
                        <dd className="text-ink-primary">Intensidade {program.intensity.toLowerCase()}</dd>
                      </div>
                    </dl>
                  </div>
                  <span className="shrink-0 font-display text-4xl leading-none text-accent-soft sm:text-5xl">
                    {program.minutes}
                    <span className="ml-1 font-sans text-sm text-ink-secondary">min</span>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

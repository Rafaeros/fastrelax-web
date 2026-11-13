import type { Route } from "next";
import { ButtonLink, Container, Icon, Media } from "@/components/ui";
import { FadeIn } from "@/components/motion/FadeIn";
import { TextReveal } from "@/components/motion/TextReveal";
import { assets } from "@/config/brand";
import { HeroStage } from "./HeroStage";

export function Hero() {
  return (
    // O respiro do topo só existe a partir de lg, onde a navbar fixa cobre o
    // início da seção. No celular ela não é renderizada, e o Hero entra logo
    // depois do cartão de acesso.
    <section
      id="inicio"
      className="relative flex min-h-[100svh] items-center overflow-hidden py-14 lg:pt-28 lg:pb-16"
    >
      {/* Fundo: escritório desfocado, quase apagado — contexto, não assunto. */}
      <div className="absolute inset-0 -z-10">
        <Media src={assets.heroBackground} alt="" aspect="h-full" className="h-full opacity-60" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-950 via-bg-950/90 to-bg-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-950 via-transparent to-bg-950/80" />
      </div>

      <Container size="wide">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
          <div className="flex flex-col gap-6 sm:gap-8">
            <TextReveal
              text="Massagem dentro da empresa, no horário que o colaborador escolhe."
              className="font-display text-[2.4rem] leading-[1.06] text-ink-primary sm:text-[3.2rem] xl:text-[3.6rem]"
            />

            <FadeIn delay={0.55}>
              <p className="max-w-[34rem] text-base leading-relaxed text-ink-secondary sm:text-lg">
                Instalamos cadeiras de massagem profissionais no seu escritório. O colaborador reserva
                pelo app, inicia a sessão pelo celular e o RH acompanha o uso pelo painel.
              </p>
            </FadeIn>

            {/*
              Empilhados e de largura total no celular: lado a lado, cada botão
              ficava com metade de 335px e o rótulo quebrava em duas linhas.
            */}
            <FadeIn delay={0.7} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <ButtonLink
                href={"/contato" as Route}
                size="lg"
                fullWidth
                className="sm:w-auto"
                trailingIcon={<Icon name="arrowRight" className="h-4 w-4" />}
              >
                Solicitar proposta
              </ButtonLink>
              <ButtonLink
                href={"/colaborador/entrar" as Route}
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
                leadingIcon={<Icon name="calendar" className="h-4 w-4" />}
              >
                Agendar minha massagem
              </ButtonLink>
            </FadeIn>
          </div>

          <HeroStage />
        </div>
      </Container>
    </section>
  );
}

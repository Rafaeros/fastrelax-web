import type { Route } from "next";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { contact } from "@/config/brand";

/**
 * Fecho da landing: leva à página de contato.
 *
 * <p>
 * O formulário mora em /contato, que tem espaço para explicar o que acontece
 * depois do envio e linka a política de privacidade logo abaixo dos campos.
 */
export function ContactCta() {
  return (
    <section className="relative overflow-hidden bg-surface-base py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 ambient-glow" />
      <Container size="default">
        <div className="relative flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-3xl font-display text-[2.2rem] leading-[1.08] text-ink-primary sm:text-[3.4rem]">
            Leve a pausa para o seu time
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg">
            Diga quantas pessoas trabalham no escritório e montamos a proposta: quantas cadeiras, onde
            ficam e como a agenda se divide. Respondemos em até {contact.responseTime}.
          </p>
          <ButtonLink
            href={"/contato" as Route}
            size="lg"
            className="mt-2"
            trailingIcon={<Icon name="arrowRight" className="h-4 w-4" />}
          >
            Solicitar proposta
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

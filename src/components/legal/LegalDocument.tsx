import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui";
import { LegalToc } from "./LegalToc";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

type LegalDocumentProps = {
  title: string;
  summary: ReactNode;
  updatedAt: string;
  sections: LegalSection[];
};

/**
 * Esqueleto das páginas de Termos e Privacidade.
 *
 * <p>
 * Índice fixo à esquerda a partir de lg (acende a seção que está sendo lida);
 * no celular ele vira uma lista recolhível no topo, para não empurrar o texto
 * para baixo de uma coluna de links.
 */
export function LegalDocument({ title, summary, updatedAt, sections }: LegalDocumentProps) {
  return (
    <>
      <Navbar alwaysVisible />
      <main className="flex-1 pt-28 pb-24 lg:pt-36">
        <Container size="wide">
          <header className="flex max-w-3xl flex-col gap-5 border-b border-line pb-10">
            <h1 className="font-display text-[2.4rem] leading-[1.06] text-ink-primary sm:text-[3.2rem]">{title}</h1>
            <div className="text-base leading-relaxed text-ink-secondary sm:text-lg">{summary}</div>
            <p className="text-sm text-ink-tertiary">Última atualização: {updatedAt}</p>
          </header>

          <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
            <LegalToc items={sections.map(({ id, title }) => ({ id, title }))} />

            <article className="legal-prose flex max-w-[44rem] flex-col gap-14">
              {sections.map((section, i) => (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-t`} className="scroll-mt-28">
                  <h2 id={`${section.id}-t`} className="font-display text-2xl text-ink-primary sm:text-[1.7rem]">
                    <span className="mr-3 text-accent-soft">{i + 1}.</span>
                    {section.title}
                  </h2>
                  <div className="mt-5 flex flex-col gap-4">{section.body}</div>
                </section>
              ))}
            </article>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

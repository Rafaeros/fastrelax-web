import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/contact/ContactForm";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/ui";
import { assets, brand, contact } from "@/config/brand";

export const metadata: Metadata = {
  title: `Contato — ${brand.name}`,
  description: "Peça uma proposta de cadeiras de massagem para a sua empresa, com app de agendamento e painel de RH.",
};

// Uma sequência de verdade: o que acontece depois do envio, em ordem.
const NEXT_STEPS = [
  {
    title: "Uma conversa rápida",
    text: "Entendemos o tamanho do time, os andares e os horários de maior movimento.",
  },
  {
    title: "Proposta",
    text: "Quantas cadeiras, onde ficam, como a agenda se divide e o valor mensal.",
  },
  {
    title: "Instalação",
    text: "Conectamos as cadeiras ao Wi-Fi, cadastramos o time por planilha e o RH recebe o acesso ao painel.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar alwaysVisible />
      <main className="relative flex-1 overflow-hidden pt-28 pb-24 lg:pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] ambient-glow" />
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-5">
                <h1 className="font-display text-[2.4rem] leading-[1.06] text-ink-primary sm:text-[3.2rem]">
                  Peça uma proposta para o seu escritório
                </h1>
                <p className="max-w-lg text-base leading-relaxed text-ink-secondary sm:text-lg">
                  Respondemos em até {contact.responseTime}, com uma pessoa do comercial, não com um robô.
                </p>
              </div>

              <ol className="flex flex-col gap-6">
                {NEXT_STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/40 font-display text-accent-soft">
                      {i + 1}
                    </span>
                    <span className="flex flex-col gap-1 pt-1">
                      <span className="font-semibold text-ink-primary">{step.title}</span>
                      <span className="text-sm leading-relaxed text-ink-secondary">{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="relative hidden aspect-[16/10] overflow-hidden rounded-card border border-line lg:block">
                <Image
                  src={assets.programs.relax}
                  alt="Homem sentado na cadeira de massagem, de olhos fechados, num escritório"
                  fill
                  sizes="45vw"
                  className="object-cover object-[50%_35%]"
                />
              </div>

              <dl className="grid gap-5 text-sm sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <dt className="text-ink-muted">Comercial</dt>
                  <dd>
                    <a href={`mailto:${contact.salesEmail}`} className="text-accent-soft underline-offset-4 hover:underline">
                      {contact.salesEmail}
                    </a>
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-ink-muted">Privacidade e LGPD</dt>
                  <dd>
                    <a href={`mailto:${contact.privacyEmail}`} className="text-accent-soft underline-offset-4 hover:underline">
                      {contact.privacyEmail}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:pt-2">
              <div className="card p-6 sm:p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}

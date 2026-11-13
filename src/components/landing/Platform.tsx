import { Container, Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";
import { HrPanelMock } from "./HrPanelMock";

const POINTS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "chart",
    title: "Adesão por área",
    text: "Sessões por dia, comparecimento e uso por departamento no período que você escolher.",
  },
  {
    icon: "users",
    title: "Colaboradores e horários",
    text: "Cadastre o time por planilha, defina a janela de cada um e quantas sessões cabem por semana.",
  },
  {
    icon: "wrench",
    title: "Cadeiras sob controle",
    text: "Veja quais cadeiras estão online, em sessão ou paradas, sem descer até o andar.",
  },
];

/**
 * Painel de RH: o lado de quem cuida do programa.
 *
 * <p>
 * O app do colaborador já aparece em movimento em "Como funciona"; aqui o
 * assunto é o painel, mostrado como tela viva em vez de imagem.
 */
export function Platform() {
  return (
    <section id="plataforma" className="bg-surface-nav py-20 lg:py-28">
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-[1.9rem] leading-tight text-ink-primary sm:text-[2.6rem]">
                O painel de RH mostra se o benefício está sendo usado
              </h2>
              <p className="text-base leading-relaxed text-ink-secondary">
                Dados para justificar o programa na próxima reunião de orçamento, e para ampliar onde a
                fila já existe.
              </p>
            </div>

            <ul className="flex flex-col gap-5">
              {POINTS.map((p) => (
                <li key={p.title} className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-line bg-surface-card text-accent-soft">
                    <Icon name={p.icon} className="h-5 w-5" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-ink-primary">{p.title}</span>
                    <span className="text-sm leading-relaxed text-ink-secondary">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <HrPanelMock />
        </div>
      </Container>
    </section>
  );
}

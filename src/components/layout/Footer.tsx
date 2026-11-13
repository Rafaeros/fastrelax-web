import type { Route } from "next";
import Link from "next/link";
import { Container, Logo } from "@/components/ui";
import { brand, contact } from "@/config/brand";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produto",
    links: [
      { label: "Programas", href: "/#programas" },
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Painel de RH", href: "/#plataforma" },
    ],
  },
  {
    title: "Acesso",
    links: [
      { label: "Área do colaborador", href: "/colaborador/entrar" },
      { label: "Área da empresa", href: "/entrar" },
      { label: "Fale com a gente", href: "/contato" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "/termos-de-uso" },
      { label: "Privacidade e LGPD", href: "/privacidade" },
    ],
  },
];

const linkClass =
  "text-sm text-ink-secondary underline decoration-transparent underline-offset-4 transition-colors hover:text-ink-primary hover:decoration-accent-soft";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-nav">
      <Container size="wide" className="py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo height={28} />
            <p className="max-w-xs text-sm leading-relaxed text-ink-secondary">
              {brand.tagline}. Pausas curtas, agendadas pelo próprio colaborador e acompanhadas pelo
              RH.
            </p>
            <a href={`mailto:${contact.salesEmail}`} className={linkClass}>
              {contact.salesEmail}
            </a>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-ink-primary">{column.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href as Route} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="hairline my-10" />

        <p className="text-xs text-ink-tertiary">
          © {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  );
}

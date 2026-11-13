"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonStyles, Container, Icon, Logo } from "@/components/ui";
import { cn } from "@/lib/cn";

// Caminho absoluto ("/#...") para os links funcionarem também a partir de
// /contato e das páginas legais, não só dentro da própria landing.
const NAV_LINKS = [
  { label: "Programas", href: "/#programas" },
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Painel de RH", href: "/#plataforma" },
  { label: "Contato", href: "/contato" },
];

type NavbarProps = {
  /**
   * Mostra a barra também abaixo de lg. Na landing ela some no celular porque
   * o MobileAccessCard ocupa a primeira tela; nas páginas internas não existe
   * esse cartão, e sem a barra não haveria caminho de volta.
   */
  alwaysVisible?: boolean;
};

export function Navbar({ alwaysVisible = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        // Some no celular: ali a primeira tela é o MobileAccessCard, e uma
        // barra fixa só custaria altura para esconder o menu num hambúrguer.
        alwaysVisible ? "block" : "hidden lg:block",
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || menuOpen
          ? "border-b border-line/70 bg-surface-base/85 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container size="wide">
        <nav className="flex h-18 items-center justify-between gap-4 py-4 lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Página inicial">
            <Logo priority />
          </Link>

          {/* gap menor a partir de lg: os 5 links dividem o espaço que sobra
              entre a logo e as ações, e 8 unidades estouravam em 1024px. */}
          <ul className="hidden items-center gap-5 lg:flex xl:gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-ink-secondary transition-colors hover:text-ink-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/*
            shrink-0: sem isto o bloco de ações encolhia e os rótulos dos botões
            quebravam em duas linhas quando os links de navegação apareciam.
            Os textos são curtos pelo mesmo motivo — "Área do colaborador" e
            "Área da empresa" juntos não cabem ao lado da logo e dos 5 links.
          */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Colaborador em destaque: é quem entra todo dia, enquanto o
                acesso do RH é ocasional.

                A visibilidade fica num contêiner próprio: o `cn` só concatena
                classes, então "hidden" passado ao buttonStyles perdia para o
                "inline-flex" do botão e os dois apareciam no celular,
                empurrando o botão de menu para fora da tela. */}
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/colaborador/entrar"
                className={buttonStyles({ variant: "primary", size: "sm", className: "whitespace-nowrap" })}
              >
                <Icon name="users" className="h-4 w-4" />
                Colaborador
              </Link>

              <Link
                href="/entrar"
                className={buttonStyles({ variant: "secondary", size: "sm", className: "whitespace-nowrap" })}
              >
                <Icon name="lock" className="h-4 w-4" />
                Empresa
              </Link>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </Button>
          </div>
        </nav>
      </Container>

      {menuOpen && (
        <div id="menu-mobile" className="border-t border-line bg-surface-nav lg:hidden">
          <Container size="wide">
            <ul className="flex flex-col py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-sm uppercase tracking-[0.14em] text-ink-secondary transition-colors hover:text-ink-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="flex flex-col gap-2 pt-3 sm:hidden">
                <Link
                  href="/colaborador/entrar"
                  onClick={() => setMenuOpen(false)}
                  className={buttonStyles({ variant: "primary", size: "sm", fullWidth: true })}
                >
                  <Icon name="users" className="h-4 w-4" />
                  Área do colaborador
                </Link>
                <Link
                  href="/entrar"
                  onClick={() => setMenuOpen(false)}
                  className={buttonStyles({ variant: "secondary", size: "sm", fullWidth: true })}
                >
                  <Icon name="lock" className="h-4 w-4" />
                  Área da empresa
                </Link>
              </li>
            </ul>
          </Container>
        </div>
      )}
    </header>
  );
}

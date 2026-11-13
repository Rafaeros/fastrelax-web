/**
 * Registro central de marca e assets.
 * Trocar tema/cliente = editar ESTE arquivo + a paleta em `src/app/globals.css`.
 * Nenhum componente referencia caminho de imagem diretamente.
 */
export const brand = {
  name: "fastrelax",
  tagline: "Bem-estar corporativo com cadeiras de massagem",
  logo: {
    /** Logo horizontal (símbolo + wordmark claro) para fundo escuro: navbar, rodapé, login. */
    src: "/brand/fastrelax-logo.svg",
    /** Avatar (símbolo no quadrado escuro), para sidebar recolhida e mobile. */
    markSrc: "/brand/fastrelax-mark.svg",
    alt: "fastrelax",
    // Proporção do viewBox do SVG (637,31 × 134,87 ≈ 4,725). Fonte e
    // variantes em design/logo/fastrelax/final (gerar-kit.py).
    width: 151,
    height: 32,
  },
} as const;

/**
 * Todas as imagens do site. Nome do arquivo = contrato com o time de design.
 *
 * Servidas em WebP já redimensionado: `images.unoptimized` (next.config) faz o
 * arquivo chegar ao navegador exatamente como está em /public, então o peso
 * tem que ser resolvido aqui. Os originais em PNG/JPG ficam ao lado como fonte.
 */
export const assets = {
  heroChair: "/images/hero-chair.webp",
  heroBackground: "/images/hero-background.webp",
  appMockup: "/images/app-colaborador.webp",
  dashboardMockup: "/images/painel-rh.webp",
  ctaBackground: "/images/cta-background.webp",
  programs: {
    relax: "/images/programa-relax.webp",
    shiatsu: "/images/programa-shiatsu.webp",
    zeroGravity: "/images/programa-zero-gravity.webp",
  },
} as const;

/**
 * Canais de contato e identificação legal usados na landing, em /contato e nas
 * páginas de Termos e Privacidade.
 *
 * CONFIRMAR antes de publicar: os endereços abaixo são o formato esperado, não
 * caixas já criadas. A razão social e o CNPJ entram quando a empresa definir
 * qual CNPJ assina o contrato de software.
 */
export const contact = {
  /** Comercial: propostas e implantação. */
  salesEmail: "contato@fastrelax.com.br",
  /** Encarregado de dados (art. 41 da LGPD): pedidos de titulares. */
  privacyEmail: "privacidade@fastrelax.com.br",
  /** Prazo de resposta prometido no formulário. */
  responseTime: "um dia útil",
} as const;

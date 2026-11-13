import type { CSSProperties, ElementType } from "react";

type TextRevealProps = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Atraso antes da primeira palavra, em segundos. */
  delay?: number;
};

/**
 * Título que entra palavra por palavra (padrão TextEffect do motion-primitives).
 *
 * <p>
 * Feito em CSS ({@code .reveal-word} no globals.css), não em JS: o título é o
 * maior elemento da primeira tela, e com animação via JS ele ficaria invisível
 * até a hidratação — atrasando o LCP e sumindo de vez se o script falhar.
 * Assim a animação começa junto com a primeira pintura.
 *
 * <p>
 * O texto completo fica num {@code sr-only} e as palavras animadas são
 * {@code aria-hidden}: leitor de tela lê a frase uma vez.
 */
export function TextReveal({ text, as: Tag = "h1", className, delay = 0 }: TextRevealProps) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="reveal-word"
            style={{ "--d": `${delay + i * 0.06}s` } as CSSProperties}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}

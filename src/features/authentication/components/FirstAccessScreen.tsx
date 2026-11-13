import { Card, Icon, Logo } from "@/components/ui";
import type { PasswordFormState } from "@/features/authentication/types/auth.types";
import {
  LOGIN_CARD,
  LOGIN_DESCRIPTION,
  LOGIN_EYEBROW,
  LOGIN_HEADING,
  LOGIN_MAIN_COMPACT,
  LOGIN_MAIN_COMPACT_SAFE_AREA,
  LOGIN_SHELL,
  LOGIN_STACK_COMPACT,
  LOGIN_TITLE,
} from "@/features/authentication/lib/login-layout";
import { LoginBrandPanel } from "./LoginBrandPanel";
import { PasswordSetupForm } from "./PasswordSetupForm";

export type FirstAccessScreenProps = {
  /** Primeiro nome, para a saudação. */
  firstName: string;
  /** O que a senha libera ("o painel", "o app"). */
  unlocks: string;
  /** Quem entregou a senha temporária, quando faz diferença dizer. */
  issuedBy?: string;
  action: (state: PasswordFormState, formData: FormData) => Promise<PasswordFormState>;
  /** App do colaborador (Capacitor): o topo respeita a safe area. */
  safeArea?: boolean;
};

/**
 * Tela de primeiro acesso (definir senha), comum ao painel e ao colaborador.
 *
 * <p>
 * Usa a composição das telas de login (`login-layout`, variantes COMPACT): no
 * desktop cabe em 100dvh com o painel de marca ao lado; no celular cabe sem
 * rolar a partir de 360×640. Para isso o aviso "por que agora",
 * que antes era um Alert próprio, virou uma frase da descrição — ele custava
 * uma faixa inteira de altura para dizer uma linha.
 */
export function FirstAccessScreen({ firstName, unlocks, issuedBy, action, safeArea }: FirstAccessScreenProps) {
  return (
    <div className={LOGIN_SHELL}>
      <LoginBrandPanel
        eyebrow="Primeiro acesso"
        title={
          <>
            Uma senha só sua,
            <br />
            <span className="text-gradient-accent">e pronto.</span>
          </>
        }
        description={`A senha temporária serve só para este primeiro passo. Assim que você escolher a sua, ${unlocks} fica liberado.`}
        highlights={[
          { icon: "key", text: "Entre 8 e 100 caracteres" },
          { icon: "lock", text: "Ninguém da equipe vê a sua senha" },
        ]}
      />

      <main className={safeArea ? LOGIN_MAIN_COMPACT_SAFE_AREA : LOGIN_MAIN_COMPACT}>
        <div className={LOGIN_STACK_COMPACT}>
          <Logo priority />

          <div className={LOGIN_HEADING}>
            <span className={LOGIN_EYEBROW}>Primeiro acesso</span>
            <h1 className={LOGIN_TITLE}>Defina sua senha</h1>
            <p className={LOGIN_DESCRIPTION}>
              Olá, {firstName}. A senha {issuedBy ? `que ${issuedBy} entregou ` : "atual "}é
              temporária e, enquanto valer, o acesso fica limitado a esta tela. Escolha a sua para
              liberar {unlocks}.
            </p>
          </div>

          <Card padding="md" className={LOGIN_CARD}>
            <PasswordSetupForm mode="first-access" action={action} />
          </Card>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-tertiary">
            <Icon name="lock" className="h-3.5 w-3.5" />
            Depois de salvar, você entra direto.
          </p>
        </div>
      </main>
    </div>
  );
}

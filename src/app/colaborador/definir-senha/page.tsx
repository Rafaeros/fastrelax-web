import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { brand } from "@/config/brand";
import { FirstAccessScreen } from "@/features/authentication/components/FirstAccessScreen";
import { collaboratorFirstAccessPasswordAction } from "@/features/collaborator-portal/actions/portal.actions";
import { getCurrentCollaborator } from "@/features/collaborator-portal/services/portal.service";

export const metadata: Metadata = {
  title: `Definir senha — ${brand.name}`,
};

/**
 * Primeiro acesso do colaborador.
 *
 * <p>
 * Mora fora do grupo `(app)` de propósito: o layout de lá redireciona para cá
 * quem ainda tem senha temporária, e ter esta tela dentro dele criaria um laço.
 * É também a única rota do app que o backend libera nesse estado — todo o resto
 * responde 403 até a senha ser trocada.
 */
export default async function DefinirSenhaPage() {
  const collaborator = await getCurrentCollaborator();
  if (!collaborator) redirect("/colaborador/entrar");

  // Senha já definida: não há o que fazer aqui, e deixar a tela acessível daria
  // a impressão de que a troca ficou pendente.
  if (!collaborator.mustChangePassword) redirect("/colaborador");

  return (
    <FirstAccessScreen
      firstName={collaborator.name.trim().split(/\s+/)[0]}
      unlocks="o app"
      issuedBy="o RH"
      action={collaboratorFirstAccessPasswordAction}
      safeArea
    />
  );
}

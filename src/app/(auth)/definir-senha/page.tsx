import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { brand } from "@/config/brand";
import { FirstAccessScreen } from "@/features/authentication/components/FirstAccessScreen";
import { getCurrentUser } from "@/features/authentication/services/auth.service";
import { firstAccessPasswordAction } from "@/features/users/actions/password.actions";

export const metadata: Metadata = {
  title: `Definir senha — ${brand.name}`,
};

/**
 * Primeiro acesso do usuário do painel.
 *
 * <p>
 * Mora fora de `/painel` de propósito: o layout de lá redireciona para cá quem
 * ainda tem senha temporária, e ter esta tela dentro dele criaria um laço. É
 * também a única rota que o backend libera nesse estado — todo o resto responde
 * 403 até a senha ser trocada, inclusive a listagem de empresas do SYSADMIN
 * recém-criado pelo seeder.
 */
export default async function DefinirSenhaPainelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  // Senha já definida: não há o que fazer aqui, e deixar a tela acessível daria
  // a impressão de que a troca ficou pendente.
  if (!user.mustChangePassword) redirect("/painel");

  return (
    <FirstAccessScreen
      firstName={user.name.trim().split(/\s+/)[0]}
      unlocks="o painel"
      action={firstAccessPasswordAction}
    />
  );
}

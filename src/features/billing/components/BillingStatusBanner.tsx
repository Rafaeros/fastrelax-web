import Link from "next/link";
import { Alert, Button } from "@/components/ui";
import { formatLongDateTime } from "@/lib/format";
import type { AuthUser } from "@/features/authentication/types/auth.types";

export function BillingStatusBanner({ user }: { user: AuthUser }) {
  const status = user.companyBillingStatus;
  if (!status || status === "ACTIVE") {
    return null;
  }

  if (status === "PAST_DUE") {
    const graceText = user.companyGraceUntil
      ? `até ${formatLongDateTime(user.companyGraceUntil)}`
      : "pelos 5 dias de carência contratual";

    return (
      <div className="mb-4">
        <Alert tone="warning" title="Fatura em atraso — período de carência ativo">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Identificamos uma fatura vencida da sua empresa. O agendamento e o uso das cadeiras
              seguem liberados normalmente {graceText}. Regularize para evitar a suspensão do
              painel e do aplicativo.
            </span>
            <Link href="/painel/faturas" className="shrink-0">
              <Button size="sm" variant="secondary">
                Abrir faturas
              </Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="mb-4">
        <Alert tone="warning" title="Sua empresa ainda não tem um plano ativo">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Enquanto o primeiro pagamento não for confirmado, os colaboradores não conseguem entrar
              no app e o painel fica restrito a Faturas. Escolha um plano para liberar o acesso.
            </span>
            <Link href="/painel/faturas" className="shrink-0">
              <Button size="sm" variant="primary">
                Escolher plano
              </Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  if (status === "CANCELLED") {
    return (
      <div className="mb-4">
        <Alert tone="error" title="Contrato encerrado">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              O app dos colaboradores está desligado. Para voltar a usar, escolha um plano em
              Faturas; os dados da empresa continuam disponíveis para exportação.
            </span>
            <Link href="/painel/faturas" className="shrink-0">
              <Button size="sm" variant="primary">
                Ver planos
              </Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <div className="mb-4">
        <Alert tone="error" title="Acesso operacional suspenso por pendência financeira">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              O prazo de carência de 5 dias encerrou sem confirmação de pagamento. O aplicativo dos
              colaboradores e as rotinas operacionais estão bloqueados — as cadeiras permanecem
              energizadas apenas para uso manual pelo botão físico. Quite a fatura em aberto para
              restabelecer o acesso na hora, ou exporte os dados da empresa.
            </span>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link href="/painel/faturas">
                <Button size="sm" variant="primary">
                  Pagar fatura
                </Button>
              </Link>
              <a href="/api/colaboradores/planilha?tipo=exportar" download>
                <Button size="sm" variant="secondary">
                  Exportar dados (LGPD)
                </Button>
              </a>
            </div>
          </div>
        </Alert>
      </div>
    );
  }

  return null;
}

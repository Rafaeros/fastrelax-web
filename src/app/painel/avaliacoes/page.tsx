import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Alert } from "@/components/ui";
import { emptyPageSlice, toPageSlice } from "@/lib/api/pagination.types";
import { requireCompanyUser } from "@/features/authentication/lib/guards";
import { listActiveDepartments } from "@/features/departments/services/department.service";
import { EvaluationsView } from "@/features/evaluations/components/EvaluationsView";
import {
  getEvaluationSummary,
  listEvaluations,
} from "@/features/evaluations/services/evaluation.service";
import type { Evaluation } from "@/features/evaluations/types/evaluation.types";

export const metadata: Metadata = {
  title: `Avaliações — ${brand.name}`,
};

export default async function AvaliacoesPage() {
  // Avaliação é dado operacional e nominal da empresa: a equipe da plataforma
  // não alcança, do mesmo jeito que não alcança a agenda.
  await requireCompanyUser();

  // Primeira página, resumo e departamentos no servidor: a tela chega inteira,
  // sem piscar vazia nem disparar três esperas em sequência.
  const [listResult, summaryResult, departmentsResult] = await Promise.all([
    listEvaluations({ page: 0 }),
    getEvaluationSummary(),
    listActiveDepartments(),
  ]);

  const initialSlice = listResult.ok ? toPageSlice(listResult.data) : emptyPageSlice<Evaluation>();

  return (
    // No desktop (lg+), a lista rola dentro da tabela e o resumo fica parado;
    // no celular, a página inteira rola pelo <main> para não comprimir a tabela.
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      {!listResult.ok && (
        <Alert tone="error" title="Não foi possível carregar as avaliações">
          {listResult.message}
        </Alert>
      )}

      <EvaluationsView
        initialSlice={initialSlice}
        initialSummary={summaryResult.ok ? summaryResult.data : null}
        departments={
          departmentsResult.ok
            ? departmentsResult.data.content.map(({ id, name }) => ({ id, name }))
            : []
        }
      />
    </div>
  );
}

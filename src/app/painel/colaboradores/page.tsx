import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Alert } from "@/components/ui";
import { toPageSlice, emptyPageSlice } from "@/lib/api/pagination.types";
import { fetchCollaboratorsPage } from "@/features/collaborators/actions/collaborator.actions";
import { CollaboratorsTable } from "@/features/collaborators/components/CollaboratorsTable";
import { listCollaborators } from "@/features/collaborators/services/collaborator.service";
import type { Collaborator } from "@/features/collaborators/types/collaborator.types";
import { listActiveDepartments } from "@/features/departments/services/department.service";
import { requireCompanyUser } from "@/features/authentication/lib/guards";

export const metadata: Metadata = {
  title: `Colaboradores — ${brand.name}`,
};

export default async function ColaboradoresPage() {
  // O cadastro carrega CPF: por decisão de produto, a equipe da plataforma não
  // enxerga dado pessoal dos clientes.
  await requireCompanyUser();

  // Primeira página no servidor: a tabela chega preenchida, sem piscar vazia.
  // Departamentos vêm junto porque o cadastro exige um (`departmentId` é @NotNull).
  const [result, departmentsResult] = await Promise.all([
    listCollaborators({ page: 0 }),
    listActiveDepartments(),
  ]);

  const initialSlice = result.ok ? toPageSlice(result.data) : emptyPageSlice<Collaborator>();
  const departments = departmentsResult.ok ? departmentsResult.data.content : [];

  return (
    // No desktop (lg+), a lista rola dentro da tabela; no celular, o <main> rola a página.
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      {!result.ok && (
        <Alert tone="error" title="Não foi possível carregar os colaboradores">
          {result.message}
        </Alert>
      )}

      <CollaboratorsTable
        initialSlice={initialSlice}
        loadPage={fetchCollaboratorsPage}
        departments={departments}
      />
    </div>
  );
}

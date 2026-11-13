import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { Alert } from "@/components/ui";
import { emptyPageSlice, toPageSlice } from "@/lib/api/pagination.types";
import { fetchDepartmentsPage } from "@/features/departments/actions/department.actions";
import { DepartmentsTable } from "@/features/departments/components/DepartmentsTable";
import { listDepartments } from "@/features/departments/services/department.service";
import type { Department } from "@/features/departments/types/department.types";
import { requireCompanyUser } from "@/features/authentication/lib/guards";

export const metadata: Metadata = {
  title: `Departamentos — ${brand.name}`,
};

export default async function DepartamentosPage() {
  await requireCompanyUser();

  // Primeira página no servidor: a tabela chega preenchida, sem piscar vazia.
  const result = await listDepartments({ page: 0 });
  const initialSlice = result.ok ? toPageSlice(result.data) : emptyPageSlice<Department>();

  return (
    // No desktop (lg+), a lista rola dentro da tabela; no celular, o <main> rola a página.
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      {!result.ok && (
        <Alert tone="error" title="Não foi possível carregar os departamentos">
          {result.message}
        </Alert>
      )}

      <DepartmentsTable initialSlice={initialSlice} loadPage={fetchDepartmentsPage} />
    </div>
  );
}

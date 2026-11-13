"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  DeleteAction,
  EditAction,
  InfiniteDataTable,
  RowAction,
  RowActions,
  TableIdentity,
  TableToolbar,
  useToast,
} from "@/components/ui";
import type { DataTableColumn } from "@/components/ui";
import type { PageSlice } from "@/lib/api/pagination.types";
import {
  deletePlanAction,
  togglePlanActiveAction,
} from "@/features/billing/actions/billing.actions";
import { PlanFormModal } from "@/features/billing/components/PlanFormModal";
import { formatCentsToBrl, formatTierRange } from "@/features/billing/lib/format";
import type { Plan } from "@/features/billing/types/billing.types";

export type PlansTableProps = {
  initialSlice: PageSlice<Plan>;
  loadPage: (page: number) => Promise<PageSlice<Plan>>;
};

export function PlansTable({ initialSlice, loadPage }: PlansTableProps) {
  const [reloadSignal, setReloadSignal] = useState(0);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const toast = useToast();

  const reload = () => setReloadSignal((c) => c + 1);

  const columns = useMemo<DataTableColumn<Plan>[]>(
    () => [
      {
        id: "name",
        header: "Plano / Faixa",
        cell: (row) => (
          <TableIdentity
            name={row.name}
            secondary={formatTierRange(row.minCollaborators, row.maxCollaborators)}
          />
        ),
      },
      {
        id: "monthlyPrice",
        header: "Mensalidade",
        cell: (row) => (
          <span className="font-medium tabular-nums text-ink-primary">
            {formatCentsToBrl(row.monthlyPriceCents)}
          </span>
        ),
      },
      {
        id: "chairs",
        header: "Cadeiras",
        hideOnMobile: true,
        cell: (row) => (
          <span className="text-ink-secondary">
            {row.includedChairs} inclusa(s) · +{formatCentsToBrl(row.extraChairPriceCents)}/extra
          </span>
        ),
      },
      {
        id: "setup",
        header: "Setup / Carência",
        hideOnMobile: true,
        cell: (row) => (
          <span className="text-ink-secondary">
            {formatCentsToBrl(row.setupFeePerChairCents)} · {row.graceDays}d carência
          </span>
        ),
      },
      {
        id: "active",
        header: "Situação",
        cell: (row) => (
          <Badge tone={row.active ? "success" : "neutral"}>
            {row.active ? "Ativo" : "Inativo"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Ações",
        align: "right",
        width: "w-32",
        cell: (row) => (
          <RowActions>
            <EditAction onClick={() => setEditing(row)} />
            <RowAction
              label={row.active ? "Desativar plano" : "Ativar plano"}
              icon={row.active ? "eyeOff" : "check"}
              onClick={async () => {
                const res = await togglePlanActiveAction(row.id);
                if (res.ok) {
                  reload();
                  toast.success(res.message);
                } else {
                  toast.error(res.message);
                }
              }}
            />
            <DeleteAction
              itemName={row.name}
              description="O plano deixa de ser oferecido para novas assinaturas."
              onConfirm={async () => {
                const res = await deletePlanAction(row.id);
                if (res.ok) {
                  reload();
                  toast.success(res.message);
                } else {
                  toast.error(res.message);
                }
              }}
            />
          </RowActions>
        ),
      },
    ],
    [toast],
  );

  return (
    <>
      <InfiniteDataTable
        className="lg:min-h-0 lg:flex-1"
        title="Planos e faixas de colaboradores"
        columns={columns}
        initialSlice={initialSlice}
        loadPage={loadPage}
        reloadKey={reloadSignal}
        filterRow={(row) =>
          !search.trim() || row.name.toLowerCase().includes(search.trim().toLowerCase())
        }
        getRowId={(row) => row.id}
        describe={(loaded, total) => `${loaded} de ${total} faixas`}
        toolbar={
          <TableToolbar
            searchPlaceholder="Buscar plano por nome"
            searchValue={search}
            onSearchChange={setSearch}
            action={
              <Button variant="primary" onClick={() => setCreating(true)}>
                Novo plano
              </Button>
            }
          />
        }
        emptyMessage="Nenhum plano cadastrado."
      />

      {creating && (
        <PlanFormModal
          open={creating}
          onClose={() => setCreating(false)}
          onSaved={reload}
        />
      )}

      {editing && (
        <PlanFormModal
          open={Boolean(editing)}
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </>
  );
}

"use client";

import { useActionState, useEffect } from "react";
import { Alert, Button, Input, Modal, useToast } from "@/components/ui";
import { createPlanAction, updatePlanAction } from "@/features/billing/actions/billing.actions";
import { centsToReaisInput } from "@/features/billing/lib/format";
import { PLAN_INITIAL_STATE, type Plan } from "@/features/billing/types/billing.types";

export type PlanFormModalProps = {
  open: boolean;
  plan?: Plan | null;
  onClose: () => void;
  onSaved: () => void;
};

export function PlanFormModal({ open, plan, onClose, onSaved }: PlanFormModalProps) {
  const isEditing = Boolean(plan);
  const action = isEditing ? updatePlanAction : createPlanAction;
  const [state, formAction, pending] = useActionState(action, PLAN_INITIAL_STATE);
  const toast = useToast();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Plano salvo com sucesso");
      onSaved();
      onClose();
    }
  }, [state, toast, onSaved, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar faixa de plano" : "Nova faixa de plano"}
      description="Defina a faixa de colaboradores ativos, a mensalidade e os parâmetros de cadeira e carência."
    >
      <form action={formAction} className="flex flex-col gap-4">
        {plan && <input type="hidden" name="id" value={plan.id} />}

        {state.status === "error" && state.message && (
          <Alert tone="error" title="Não foi possível salvar o plano">
            {state.message}
          </Alert>
        )}

        <Input
          name="name"
          label="Nome do plano"
          placeholder="Ex.: Corporativo — Até 50 colaboradores"
          defaultValue={plan?.name ?? ""}
          error={state.fieldErrors?.name}
          required
        />

        <Input
          name="description"
          label="Descrição (opcional)"
          placeholder="Resumo comercial desta faixa"
          defaultValue={plan?.description ?? ""}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="minCollaborators"
            type="number"
            min={0}
            label="Mínimo de colaboradores ativos"
            defaultValue={plan?.minCollaborators ?? 1}
            error={state.fieldErrors?.minCollaborators}
            required
          />
          <Input
            name="maxCollaborators"
            type="number"
            min={1}
            label="Máximo de colaboradores (vazio = sem limite)"
            placeholder="Ex.: 50"
            defaultValue={plan?.maxCollaborators ?? ""}
            error={state.fieldErrors?.maxCollaborators}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="monthlyPriceReais"
            label="Mensalidade da faixa (R$)"
            placeholder="490,00"
            defaultValue={plan ? centsToReaisInput(plan.monthlyPriceCents) : "490,00"}
            error={state.fieldErrors?.monthlyPriceCents}
            required
          />
          <Input
            name="graceDays"
            type="number"
            min={0}
            max={60}
            label="Dias de carência antes de suspender"
            defaultValue={plan?.graceDays ?? 5}
            error={state.fieldErrors?.graceDays}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            name="includedChairs"
            type="number"
            min={1}
            label="Cadeiras inclusas"
            defaultValue={plan?.includedChairs ?? 1}
            error={state.fieldErrors?.includedChairs}
            required
          />
          <Input
            name="extraChairPriceReais"
            label="Cadeira extra / mês (R$)"
            placeholder="150,00"
            defaultValue={plan ? centsToReaisInput(plan.extraChairPriceCents) : "150,00"}
            error={state.fieldErrors?.extraChairPriceCents}
            required
          />
          <Input
            name="setupFeePerChairReais"
            label="Setup por cadeira (R$)"
            placeholder="350,00"
            defaultValue={plan ? centsToReaisInput(plan.setupFeePerChairCents) : "350,00"}
            error={state.fieldErrors?.setupFeePerChairCents}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pending}>
            {isEditing ? "Salvar alterações" : "Criar plano"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

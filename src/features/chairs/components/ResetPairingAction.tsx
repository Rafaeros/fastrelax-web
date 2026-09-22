"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog, RowAction, useToast } from "@/components/ui";
import { resetChairPairingAction } from "@/features/chairs/actions/chair.actions";
import type { Chair } from "@/features/chairs/types/chair.types";

export type ResetPairingActionProps = {
  chair: Chair;
  /** Disparado depois do reset — a tabela recarrega para refletir o estado. */
  onReset: () => void;
};

/**
 * Esquece o token pareado desta cadeira, para ela parear de novo no próximo
 * heartbeat.
 *
 * <p>
 * Com confirmação, ao contrário do push de rede/MQTT: a cadeira fica recusando
 * comandos (token inválido) até esse próximo heartbeat chegar, então não é algo
 * para clicar por engano. Precisa disto depois que a flash do ESP32 é apagada
 * por completo — não um reflash comum pelo painel, que não toca a NVS — porque
 * a placa sorteia um token novo no boot seguinte e o antigo, gravado no
 * cadastro, para de bater.
 */
export function ResetPairingAction({ chair, onReset }: ResetPairingActionProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const confirm = () => {
    startTransition(async () => {
      const result = await resetChairPairingAction(chair.id);
      setOpen(false);

      if (result.ok) {
        onReset();
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <RowAction
        label="Esquecer pareamento"
        icon="key"
        disabled={pending}
        onClick={() => setOpen(true)}
      />

      <ConfirmDialog
        open={open}
        icon="key"
        title={`Esquecer o pareamento de ${chair.name}?`}
        description="A cadeira para de responder a comandos até enviar o próximo heartbeat com o token novo. Use depois de apagar a flash inteira do ESP32."
        confirmLabel={pending ? "Esquecendo..." : "Esquecer pareamento"}
        pending={pending}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

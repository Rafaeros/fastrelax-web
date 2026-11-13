"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Button, Icon, IconButton, Input, Modal, useToast } from "@/components/ui";
import { quickCreateDepartmentAction } from "@/features/departments/actions/department.actions";
import type { Department } from "@/features/departments/types/department.types";

export type QuickCreateDepartmentButtonProps = {
  disabled?: boolean;
  /** Disparado com o departamento recém-criado, já pronto para ser selecionado. */
  onCreated: (department: Department) => void;
};

/**
 * Cadastro rápido de departamento, aberto de dentro do formulário de
 * colaborador — evita sair do modal para ir até a tela de departamentos e
 * voltar depois só para terminar o cadastro que ficou pela metade.
 */
export function QuickCreateDepartmentButton({
  disabled,
  onCreated,
}: QuickCreateDepartmentButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const openModal = () => {
    setName("");
    setError(undefined);
    setOpen(true);
  };

  const close = () => {
    if (pending) return;
    setOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // No DOM este form fica no <body> (portal, ver abaixo), mas eventos do
    // React seguem a árvore de componentes: sem isto o "submit" borbulharia
    // até o onSubmit do form de colaborador e cadastraria o colaborador junto.
    event.stopPropagation();
    setError(undefined);

    startTransition(async () => {
      const result = await quickCreateDepartmentAction(name);

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      toast.success("Departamento cadastrado");
      onCreated(result.department);
      setOpen(false);
    });
  };

  return (
    <>
      <IconButton
        label="Novo departamento"
        icon={<Icon name="plus" className="h-4 w-4" />}
        onClick={openModal}
        disabled={disabled}
      />

      {/*
        Portal no <body>: o botão vive dentro do <form> de colaborador, e um
        <form> dentro de outro é HTML inválido (erro de hidratação, e Enter no
        campo enviaria o form de fora). Só existe aberto, então nunca roda no
        servidor e não precisa esperar montar para achar o document.
      */}
      {open && createPortal(
      <Modal
        open={open}
        onClose={close}
        size="sm"
        dismissible={!pending}
        title="Novo departamento"
        description="Cadastra e já volta selecionado no colaborador."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={close} disabled={pending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="quick-create-department-form"
              size="sm"
              disabled={pending}
              trailingIcon={
                pending ? <Icon name="loader" className="h-4 w-4 animate-spin" /> : undefined
              }
            >
              {pending ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </>
        }
      >
        <form
          id="quick-create-department-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          noValidate
        >
          <Input
            name="name"
            label="Nome do departamento"
            placeholder="Ex.: Tecnologia"
            autoComplete="off"
            autoFocus
            maxLength={100}
            disabled={pending}
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={error}
            leadingIcon={<Icon name="dashboard" />}
          />
        </form>
      </Modal>,
      document.body,
      )}
    </>
  );
}

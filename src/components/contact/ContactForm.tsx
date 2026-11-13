"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button, Icon, Input, Select, Textarea } from "@/components/ui";
import { contact } from "@/config/brand";

const COMPANY_SIZES = [
  { label: "Até 100 pessoas", value: "Até 100 pessoas" },
  { label: "101 a 500 pessoas", value: "101 a 500 pessoas" },
  { label: "501 a 2.000 pessoas", value: "501 a 2.000 pessoas" },
  { label: "Mais de 2.000 pessoas", value: "Mais de 2.000 pessoas" },
];

/**
 * Pedido de proposta.
 *
 * <p>
 * Ainda não existe rota de contato no fastrelax-api. Em vez de fingir um
 * envio, o formulário monta o e-mail com os campos preenchidos e abre o
 * programa de e-mail da pessoa — quem clica sabe exatamente o que foi enviado
 * e para onde. Quando a rota existir, troca-se só o {@code handleSubmit}.
 */
export function ContactForm() {
  const [opened, setOpened] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    const body = [
      `Nome: ${get("nome")}`,
      `Empresa: ${get("empresa")}`,
      `E-mail: ${get("email")}`,
      get("telefone") && `Telefone: ${get("telefone")}`,
      `Tamanho do time: ${get("porte")}`,
      "",
      get("mensagem"),
    ]
      // `get("telefone") && ...` vira "" quando o campo fica vazio: sai da mensagem.
      .filter((line, i) => i === 5 || line !== "")
      .join("\n");

    const subject = `Proposta para ${get("empresa")}`;
    window.location.href = `mailto:${contact.salesEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Nome" name="nome" autoComplete="name" required />
        <Input label="Empresa" name="empresa" autoComplete="organization" required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="E-mail de trabalho" name="email" type="email" autoComplete="email" required />
        <Input label="Telefone" name="telefone" type="tel" autoComplete="tel" hint="Opcional" />
      </div>
      <Select label="Quantas pessoas no escritório" name="porte" options={COMPANY_SIZES} />
      <Textarea
        label="O que você precisa"
        name="mensagem"
        rows={4}
        hint="Opcional. Ex.: quantos andares, se já tem cadeira, prazo para começar."
      />

      <Button type="submit" size="lg" fullWidth trailingIcon={<Icon name="mail" className="h-4 w-4" />}>
        Enviar pedido de proposta
      </Button>

      <AnimatePresence>
        {opened && (
          <motion.p
            role="status"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-control border border-success-700 bg-success-bg px-4 py-3 text-sm text-success-400"
          >
            Abrimos o seu programa de e-mail com a mensagem pronta. Confira e envie por lá. Se nada abriu,
            escreva direto para{" "}
            <a href={`mailto:${contact.salesEmail}`} className="underline underline-offset-2">
              {contact.salesEmail}
            </a>
            .
          </motion.p>
        )}
      </AnimatePresence>

      <p className="text-xs leading-relaxed text-ink-tertiary">
        Usamos estes dados só para responder ao seu pedido. Veja a{" "}
        <Link href="/privacidade" className="text-accent-soft underline underline-offset-2">
          Política de privacidade
        </Link>
        .
      </p>
    </form>
  );
}

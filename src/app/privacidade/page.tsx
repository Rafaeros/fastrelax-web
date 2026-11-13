import type { Metadata } from "next";
import Link from "next/link";
import type { LegalSection } from "@/components/legal/LegalDocument";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { brand, contact } from "@/config/brand";

export const metadata: Metadata = {
  title: `Privacidade e LGPD — ${brand.name}`,
  description: `Como a ${brand.name} trata os dados pessoais de colaboradores, usuários do painel de RH e contatos comerciais, conforme a LGPD.`,
};

const mail = (address: string) => <a href={`mailto:${address}`}>{address}</a>;

/*
 * Texto montado a partir do levantamento técnico de LGPD do projeto
 * (papéis por modelo de negócio, dados tratados, retenção). Não é parecer
 * jurídico: revisar com advogado antes de publicar.
 */
const SECTIONS: LegalSection[] = [
  {
    id: "quem-somos",
    title: "A quem esta política se aplica",
    body: (
      <>
        <p>
          A {brand.name} fornece o software que agenda e aciona cadeiras de massagem instaladas em
          empresas: o app do colaborador, o painel de RH e o módulo que conecta cada cadeira à
          plataforma.
        </p>
        <p>Esta política explica como tratamos os dados pessoais de três grupos de pessoas:</p>
        <ul>
          <li>
            <strong>Colaboradores</strong> das empresas clientes, que agendam e iniciam sessões pelo app.
          </li>
          <li>
            <strong>Usuários do painel</strong>: pessoas do RH ou da administração da empresa cliente.
          </li>
          <li>
            <strong>Contatos comerciais</strong>: quem nos escreve pelo formulário de contato ou por e-mail.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "papeis",
    title: "Quem decide sobre os seus dados",
    body: (
      <>
        <p>
          A LGPD separa quem decide sobre o tratamento (o <strong>controlador</strong>) de quem trata os
          dados em nome dele (o <strong>operador</strong>).
        </p>
        <ul>
          <li>
            <strong>Dados de colaboradores e de usuários do painel:</strong> a empresa onde você trabalha é
            a controladora. É ela quem decide quem é cadastrado, quais horários cada pessoa pode usar e
            por quanto tempo os dados ficam guardados. A {brand.name} é operadora e trata esses dados
            só para prestar o serviço contratado, conforme as instruções da empresa.
          </li>
          <li>
            <strong>Dados de contatos comerciais:</strong> a {brand.name} é a controladora.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "dados",
    title: "Quais dados tratamos",
    body: (
      <>
        <p>
          <strong>Colaboradores:</strong> nome, CPF, e-mail, telefone, departamento, local de trabalho,
          horários permitidos, agendamentos, histórico de sessões e as avaliações que você fizer depois
          de cada sessão.
        </p>
        <p>
          <strong>Usuários do painel:</strong> nome, e-mail, perfil de acesso e a empresa a que pertencem.
        </p>
        <p>
          <strong>Contatos comerciais:</strong> nome, empresa, e-mail, telefone e porte do time, conforme
          você preencher.
        </p>
        <p>
          <strong>Dados técnicos:</strong> registros de acesso à aplicação (endereço IP, data e hora), que a
          lei brasileira obriga a guardar.
        </p>
        <p>
          <strong>A cadeira não recebe dados pessoais.</strong> O módulo instalado nela só recebe comandos
          de ligar e desligar, sem nome, CPF ou qualquer informação sobre quem está sentado.
        </p>
      </>
    ),
  },
  {
    id: "nao-coletamos",
    title: "O que não coletamos",
    body: (
      <>
        <p>
          Não pedimos informações de saúde, como contraindicações, doenças ou medicamentos. Se você tiver
          alguma condição que torne a massagem desaconselhável, converse com um médico antes de usar a
          cadeira (veja os <Link href="/termos-de-uso#saude">Termos de uso</Link>). Não usamos seus dados
          para publicidade, não os vendemos e não traçamos perfil de comportamento.
        </p>
      </>
    ),
  },
  {
    id: "finalidades",
    title: "Para que usamos os dados",
    body: (
      <>
        <ul>
          <li>Identificar você no login e manter sua sessão aberta com segurança.</li>
          <li>Mostrar os horários livres, registrar a reserva e enviar o lembrete antes da sessão.</li>
          <li>Ligar a cadeira no horário reservado e desligá-la ao fim do programa.</li>
          <li>
            Gerar os indicadores do painel de RH (uso por departamento, comparecimento, satisfação) para a
            empresa cliente.
          </li>
          <li>Responder a pedidos de proposta e manter o contato comercial.</li>
          <li>Cumprir obrigações legais, como a guarda dos registros de acesso.</li>
        </ul>
        <p>
          As bases legais são a execução do contrato com a empresa cliente (art. 7º, V), o cumprimento de
          obrigação legal (art. 7º, II) e, para o contato comercial, o legítimo interesse em responder a
          quem nos procurou (art. 7º, IX).
        </p>
      </>
    ),
  },
  {
    id: "compartilhamento",
    title: "Com quem compartilhamos",
    body: (
      <>
        <p>Só com quem precisa dos dados para o serviço funcionar:</p>
        <ul>
          <li>A empresa onde você trabalha, que vê seus agendamentos e o histórico de uso no painel.</li>
          <li>Provedores de hospedagem, de envio de e-mail e de notificações, contratados por nós.</li>
          <li>Autoridades públicas, quando houver ordem judicial ou obrigação legal.</li>
        </ul>
        <p>
          Cada empresa cliente vê apenas os dados das próprias pessoas. Nenhuma empresa acessa dados de
          outra.
        </p>
      </>
    ),
  },
  {
    id: "seguranca",
    title: "Como protegemos",
    body: (
      <>
        <ul>
          <li>Toda comunicação entre o app, o painel e a plataforma usa HTTPS.</li>
          <li>O CPF é guardado cifrado no banco de dados.</li>
          <li>Senhas e chaves de acesso ficam guardadas só em forma de hash, que não pode ser revertido.</li>
          <li>O login fica num cookie inacessível a scripts da página, e as tentativas são limitadas.</li>
          <li>A equipe técnica da {brand.name} não tem acesso aos dados operacionais das empresas clientes.</li>
        </ul>
      </>
    ),
  },
  {
    id: "retencao",
    title: "Por quanto tempo guardamos",
    body: (
      <>
        <ul>
          <li>
            <strong>Cadastro, agenda e avaliações:</strong> enquanto durar o contrato da sua empresa. Quando
            um colaborador é desligado, a empresa pode pedir a exclusão: o cadastro é anonimizado, e as
            sessões passam a contar só como estatística, sem identificar ninguém.
          </li>
          <li>
            <strong>Registros de acesso:</strong> seis meses, como exige o Marco Civil da Internet.
          </li>
          <li>
            <strong>Documentos financeiros dos contratos:</strong> cinco anos, pelo prazo fiscal.
          </li>
          <li>
            <strong>Contatos comerciais:</strong> até você pedir a exclusão ou até dois anos sem conversa.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "direitos",
    title: "Seus direitos",
    body: (
      <>
        <p>Pela LGPD (art. 18), você pode pedir:</p>
        <ul>
          <li>Confirmação de que tratamos seus dados e acesso a eles.</li>
          <li>Correção de dados incompletos ou desatualizados.</li>
          <li>Anonimização, bloqueio ou exclusão de dados desnecessários.</li>
          <li>Portabilidade para outro fornecedor.</li>
          <li>Informação sobre com quem compartilhamos.</li>
        </ul>
        <p>
          <strong>Se você é colaborador,</strong> faça o pedido ao RH da sua empresa, que é a controladora.
          Se preferir, escreva para {mail(contact.privacyEmail)}: encaminhamos à empresa e ajudamos a
          atender. <strong>Se você é contato comercial,</strong> escreva direto para o mesmo endereço.
          Respondemos em até 15 dias.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        Usamos só os cookies necessários para manter você conectado ao app e ao painel. Não usamos cookies de
        publicidade nem ferramentas de rastreamento de terceiros, por isso não há banner de consentimento.
      </p>
    ),
  },
  {
    id: "incidentes",
    title: "Se algo der errado",
    body: (
      <p>
        Se houver um incidente de segurança que possa trazer risco a você, avisamos a empresa controladora,
        a Autoridade Nacional de Proteção de Dados (ANPD) e as pessoas afetadas, com o que aconteceu e o que
        foi feito para conter o problema.
      </p>
    ),
  },
  {
    id: "encarregado",
    title: "Encarregado de dados",
    body: (
      <p>
        Dúvidas sobre esta política ou sobre seus dados: {mail(contact.privacyEmail)}. Quando mudarmos esta
        política, a data no topo da página muda junto, e avisamos as empresas clientes antes de qualquer
        alteração relevante.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacidade e LGPD"
      updatedAt="11 de novembro de 2026"
      summary={
        <p>
          A sua empresa decide quem usa as cadeiras; nós tratamos os dados só para o agendamento funcionar.
          A cadeira não recebe nenhum dado seu, e não pedimos informações de saúde.
        </p>
      }
      sections={SECTIONS}
    />
  );
}

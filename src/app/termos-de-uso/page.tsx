import type { Metadata } from "next";
import Link from "next/link";
import type { LegalSection } from "@/components/legal/LegalDocument";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { brand, contact } from "@/config/brand";

export const metadata: Metadata = {
  title: `Termos de uso — ${brand.name}`,
  description: `Regras de uso do app do colaborador, do painel de RH e das cadeiras de massagem conectadas à ${brand.name}.`,
};

/*
 * As regras de operação abaixo descrevem o comportamento real do sistema:
 * sessão só no horário reservado, finalização automática, suspensão que
 * encerra o software mas devolve a cadeira ao modo manual. Não é parecer
 * jurídico: revisar com advogado antes de publicar.
 */
const SECTIONS: LegalSection[] = [
  {
    id: "aceite",
    title: "Aceite",
    body: (
      <p>
        Ao entrar no app do colaborador ou no painel de RH, você concorda com estes termos e com a{" "}
        <Link href="/privacidade">Política de privacidade</Link>. Se não concordar, não use a plataforma e
        fale com o RH da sua empresa.
      </p>
    ),
  },
  {
    id: "servico",
    title: "O que é o serviço",
    body: (
      <>
        <p>
          A {brand.name} oferece o software que organiza o uso de cadeiras de massagem dentro de empresas:
          o app em que o colaborador reserva e inicia a sessão, o painel em que o RH gerencia o programa e o
          módulo que liga cada cadeira à plataforma.
        </p>
        <p>
          A cadeira pertence à empresa cliente ou a quem ela contratou. A {brand.name} responde pelo
          software e pelo módulo de conexão, não pela fabricação da cadeira.
        </p>
      </>
    ),
  },
  {
    id: "contas",
    title: "Sua conta",
    body: (
      <>
        <ul>
          <li>
            O colaborador entra com o identificador da empresa, o CPF e a senha. O primeiro acesso é feito
            pelo convite enviado ao seu e-mail.
          </li>
          <li>A conta é pessoal. Não empreste a senha nem reserve horários para outra pessoa.</li>
          <li>
            Se suspeitar que alguém usou sua conta, troque a senha pelo app e avise o RH da sua empresa.
          </li>
          <li>
            Usuários do painel respondem pelos cadastros que fazem e devem manter os dados do time
            atualizados.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "uso",
    title: "Agenda e uso das cadeiras",
    body: (
      <>
        <ul>
          <li>Você só pode reservar horários dentro da janela e do limite que a sua empresa definiu.</li>
          <li>
            A cadeira só liga pelo app no horário reservado. Se você não iniciar a sessão a tempo, a reserva
            expira e o horário volta a ficar livre.
          </li>
          <li>Ao fim do programa a sessão é finalizada automaticamente, e a cadeira desliga.</li>
          <li>Se não puder ir, cancele pelo app para liberar o horário a outra pessoa.</li>
          <li>Deixe a cadeira limpa e como encontrou. Avise o RH se notar qualquer defeito.</li>
        </ul>
      </>
    ),
  },
  {
    id: "saude",
    title: "Saúde e segurança",
    body: (
      <>
        <p>
          A massagem na cadeira é um momento de relaxamento e{" "}
          <strong>não substitui avaliação ou tratamento médico</strong>.
        </p>
        <p>
          Consulte um médico antes de usar se você estiver grávida, usar marca-passo ou outro dispositivo
          implantado, tiver trombose, osteoporose, lesão ou cirurgia recente, ou qualquer condição em que a
          massagem possa ser desaconselhada.
        </p>
        <p>
          Interrompa a sessão imediatamente se sentir dor ou desconforto: toque em Finalizar sessão no app
          ou use o botão de desligar da própria cadeira. A plataforma não pergunta sobre a sua saúde, e a
          decisão de usar a cadeira é sua.
        </p>
      </>
    ),
  },
  {
    id: "proibido",
    title: "O que não é permitido",
    body: (
      <ul>
        <li>Tentar ligar a cadeira fora da agenda ou contornar os limites de uso.</li>
        <li>Tentar acessar dados de outras pessoas ou de outras empresas.</li>
        <li>Abrir, alterar ou desconectar o módulo instalado na cadeira.</li>
        <li>Copiar, descompilar ou revender o software.</li>
      </ul>
    ),
  },
  {
    id: "disponibilidade",
    title: "Disponibilidade",
    body: (
      <>
        <p>
          A cadeira depende da rede Wi-Fi da empresa para receber comandos. Se a rede ou a plataforma
          estiverem fora do ar, a cadeira continua funcionando pelo próprio botão, só que sem agenda.
        </p>
        <p>
          Podemos interromper o serviço por pouco tempo para manutenção ou atualização do módulo. Sempre que
          possível, isso acontece fora do horário comercial.
        </p>
      </>
    ),
  },
  {
    id: "empresa",
    title: "Empresa contratante",
    body: (
      <>
        <p>
          A empresa cliente é responsável por cadastrar corretamente as pessoas, informar o seu time sobre o
          programa e sobre o tratamento de dados, e definir janelas e limites de uso.
        </p>
        <p>
          Se o contrato for suspenso por falta de pagamento, depois do prazo de carência combinado, o acesso
          ao app e ao painel é encerrado. As cadeiras continuam funcionando no modo manual, pelo botão, e
          voltam à agenda quando o contrato for regularizado.
        </p>
      </>
    ),
  },
  {
    id: "propriedade",
    title: "Propriedade intelectual",
    body: (
      <p>
        O software, a marca {brand.name} e o conteúdo da plataforma pertencem à {brand.name}. O contrato dá à
        empresa cliente e ao seu time o direito de usar a plataforma enquanto ele estiver vigente, sem
        transferir a propriedade.
      </p>
    ),
  },
  {
    id: "responsabilidade",
    title: "Limites de responsabilidade",
    body: (
      <p>
        Não respondemos por danos causados pelo uso da cadeira em desacordo com estes termos ou com as
        orientações do fabricante, nem por falhas da rede da empresa cliente. Nada nestes termos afasta
        direitos que a lei garante a você e que não podem ser renunciados.
      </p>
    ),
  },
  {
    id: "alteracoes",
    title: "Mudanças e lei aplicável",
    body: (
      <p>
        Podemos atualizar estes termos; a data no topo mostra a versão em vigor, e avisamos as empresas
        clientes antes de mudanças relevantes. Estes termos seguem a lei brasileira. Dúvidas:{" "}
        <a href={`mailto:${contact.salesEmail}`}>{contact.salesEmail}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Termos de uso"
      updatedAt="11 de novembro de 2026"
      summary={
        <p>
          Reserve só dentro da sua janela, use a cadeira no horário marcado e cancele quando não puder ir.
          Se tiver alguma condição de saúde, consulte um médico antes da primeira sessão.
        </p>
      }
      sections={SECTIONS}
    />
  );
}

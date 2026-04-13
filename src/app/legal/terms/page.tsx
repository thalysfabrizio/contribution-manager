import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Uso — Contribution Manager',
  description:
    'Termos e condições para uso do Contribution Manager, plataforma gratuita de gestão de contribuições mensais.',
};

export default function TermsPage() {
  return (
    <>
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-text-muted">Versão 1.0 — 13 de abril de 2026</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          Termos de Uso
        </h1>
        <p className="text-text-secondary">
          Estes termos regem o uso da plataforma <strong>Contribution Manager</strong>. Ao criar
          uma conta, você declara que leu, entendeu e concorda integralmente com estas condições.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">1. Objeto</h2>
        <p className="text-text-secondary">
          O Contribution Manager é uma ferramenta gratuita para organização, acompanhamento e
          cobrança de contribuições mensais por grupos, igrejas e associações. A plataforma
          oferece controle de participantes, registro de pagamentos, envio manual de lembretes e
          histórico de auditoria.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">2. Natureza gratuita e versão beta</h2>
        <p className="text-text-secondary">
          O serviço é oferecido <strong>gratuitamente</strong> e encontra-se em fase de
          lançamento. Não há compromisso contratual de disponibilidade contínua, garantia de
          nível de serviço (SLA) ou suporte técnico dedicado. Funcionalidades podem ser
          modificadas, adicionadas ou removidas a qualquer momento.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">3. Cadastro e autenticação</h2>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>
            A criação de conta requer aceite expresso destes Termos e da Política de Privacidade.
          </li>
          <li>
            O usuário é o único responsável pela guarda do acesso à sua conta de email, pois a
            autenticação é feita por provedores externos (Google) ou por link mágico enviado por
            email.
          </li>
          <li>
            Contas inativas, suspeitas de fraude ou que violem estes termos podem ser suspensas
            ou encerradas sem aviso prévio.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">4. Responsabilidades do usuário</h2>
        <p className="text-text-secondary">Ao utilizar a plataforma, você se compromete a:</p>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>
            fornecer dados verdadeiros, precisos e atualizados, tanto nos cadastros de campanha
            quanto dos participantes;
          </li>
          <li>
            cadastrar dados de terceiros (nome, telefone) somente com consentimento prévio,
            assumindo a responsabilidade legal pela base coletada;
          </li>
          <li>
            utilizar a plataforma em conformidade com a LGPD e demais legislações aplicáveis,
            respondendo integralmente perante titulares de dados;
          </li>
          <li>não utilizar a plataforma para fins ilícitos, fraudulentos ou discriminatórios;</li>
          <li>
            não tentar contornar limites de segurança, realizar engenharia reversa ou
            sobrecarregar a infraestrutura de forma maliciosa.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">5. Política de uso aceitável</h2>
        <p className="text-text-secondary">É <strong>expressamente proibido</strong>:</p>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>utilizar a plataforma para envio massivo de mensagens não solicitadas (spam);</li>
          <li>cadastrar participantes sem o devido consentimento;</li>
          <li>coletar ou processar dados sensíveis (saúde, orientação, origem) sem base legal;</li>
          <li>cobrar contribuições de forma coercitiva ou enganosa;</li>
          <li>
            representar-se indevidamente como outra pessoa ou organização no preenchimento dos
            dados de conta ou de campanha.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">6. Propriedade intelectual</h2>
        <p className="text-text-secondary">
          O código-fonte, layout, marca e demais elementos do Contribution Manager são de
          propriedade de seus mantenedores. O usuário retém a titularidade dos dados que insere na
          plataforma e pode exportá-los a qualquer momento em formato JSON.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">7. Ausência de garantias</h2>
        <p className="text-text-secondary">
          A plataforma é fornecida &quot;<strong>no estado em que se encontra</strong>&quot;, sem
          garantias explícitas ou implícitas de adequação a finalidade específica, disponibilidade
          ininterrupta, ausência de erros ou integração com ferramentas externas. Os mantenedores
          não serão responsáveis por lucros cessantes, danos indiretos ou perda de dados
          decorrentes do uso da plataforma, ressalvadas as hipóteses em que a legislação
          brasileira vede a limitação.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">8. Rescisão</h2>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>
            O usuário pode, a qualquer momento, excluir sua conta através do painel de
            configurações. A exclusão é definitiva e remove todas as campanhas de sua
            propriedade.
          </li>
          <li>
            Os mantenedores podem suspender ou encerrar contas que violem estes Termos, a
            legislação aplicável ou que representem risco à plataforma ou a outros usuários.
          </li>
          <li>
            O encerramento da conta não afasta a responsabilidade por atos praticados durante a
            vigência do relacionamento.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">9. Alterações dos termos</h2>
        <p className="text-text-secondary">
          Estes Termos podem ser atualizados. Alterações materiais serão comunicadas e passarão a
          valer na próxima sessão do usuário, com aceite expresso da nova versão. O uso continuado
          após o aceite implica concordância com as modificações.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">10. Legislação e foro</h2>
        <p className="text-text-secondary">
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o
          foro do domicílio do usuário para dirimir quaisquer controvérsias decorrentes deste
          contrato, ressalvadas as hipóteses de foro obrigatório previstas na legislação.
        </p>
      </section>
    </>
  );
}

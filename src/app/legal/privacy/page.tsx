import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade — Contribution Manager',
  description:
    'Como o Contribution Manager coleta, usa, armazena e protege seus dados pessoais em conformidade com a LGPD.',
};

export default function PrivacyPage() {
  return (
    <>
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-text-muted">Versão 1.0 — 13 de abril de 2026</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          Política de Privacidade
        </h1>
        <p className="text-text-secondary">
          Esta política descreve como o <strong>Contribution Manager</strong> coleta, utiliza,
          armazena e compartilha dados pessoais, em conformidade com a Lei Geral de Proteção de
          Dados (Lei nº 13.709/2018 — LGPD).
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">1. Quem somos</h2>
        <p className="text-text-secondary">
          O Contribution Manager é uma plataforma gratuita para gestão de contribuições mensais de
          grupos, igrejas e associações. O controlador dos dados é o operador que criou a conta e
          cadastrou a campanha (&quot;<strong>Organizador</strong>&quot;). A plataforma atua como
          operadora técnica, processando os dados apenas conforme instrução do Organizador.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">2. Dados que coletamos</h2>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>
            <strong>Dados de conta do Organizador:</strong> nome, endereço de email e, quando
            aplicável, imagem de perfil fornecida pelo provedor de autenticação (Google).
          </li>
          <li>
            <strong>Dados dos participantes cadastrados na campanha:</strong> nome completo e
            telefone. Esses dados são inseridos pelo Organizador e pertencem ao titular original.
          </li>
          <li>
            <strong>Dados operacionais da campanha:</strong> configurações (nome, chave PIX,
            valores, meses de vigência), pagamentos registrados e histórico de mensagens enviadas.
          </li>
          <li>
            <strong>Registros de auditoria:</strong> histórico de ações relevantes executadas por
            usuários autenticados (criação de campanha, edição, alteração de pagamento, convites),
            com carimbo de data e identificação do ator.
          </li>
          <li>
            <strong>Dados técnicos mínimos:</strong> data de criação da conta, data do último
            login e sessões ativas. Não utilizamos cookies de rastreamento publicitário.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">3. Finalidade do tratamento</h2>
        <p className="text-text-secondary">Os dados são utilizados exclusivamente para:</p>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>autenticar o Organizador e exibir suas campanhas;</li>
          <li>organizar o cadastro e o controle de pagamentos dos participantes;</li>
          <li>gerar lembretes de pagamento (o envio efetivo é ação manual do Organizador);</li>
          <li>registrar histórico de ações para auditoria e resolução de disputas;</li>
          <li>garantir a segurança da plataforma contra abuso.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">4. Base legal (art. 7º da LGPD)</h2>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>
            <strong>Execução de contrato (art. 7º, V):</strong> tratamento necessário para prestar
            o serviço ao Organizador.
          </li>
          <li>
            <strong>Legítimo interesse (art. 7º, IX):</strong> aplicável aos registros de
            auditoria e à segurança da plataforma, sempre respeitando os direitos do titular.
          </li>
          <li>
            <strong>Cumprimento de obrigação legal/regulatória (art. 7º, II):</strong> quando
            aplicável, como no atendimento a requisições de autoridades competentes.
          </li>
          <li>
            <strong>Consentimento (art. 7º, I):</strong> obtido no cadastro do Organizador através
            do aceite expresso desta política e dos Termos de Uso.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">5. Compartilhamento e sub-operadores</h2>
        <p className="text-text-secondary">
          Não vendemos nem alugamos dados pessoais. Compartilhamos dados com os seguintes
          sub-operadores, estritamente para viabilizar o serviço:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>
            <strong>Google LLC</strong> — autenticação via OAuth (recebe apenas os dados
            necessários para confirmar a identidade do usuário no momento do login).
          </li>
          <li>
            <strong>Resend, Inc.</strong> — envio de emails transacionais (links de acesso
            mágico). Recebe apenas o endereço de destino e o conteúdo do email.
          </li>
          <li>
            <strong>Provedor de hospedagem e banco de dados</strong> — infraestrutura técnica
            onde os dados da aplicação são armazenados, sob contratos que exigem confidencialidade
            e proteção adequadas.
          </li>
        </ul>
        <p className="text-text-secondary">
          Nenhum dado pessoal é compartilhado com anunciantes ou para fins de marketing de
          terceiros.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">6. Retenção e exclusão</h2>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>
            <strong>Dados de conta e campanha:</strong> mantidos enquanto a conta estiver ativa.
            Ao excluir sua conta, todas as campanhas de sua propriedade são permanentemente
            removidas.
          </li>
          <li>
            <strong>Registros de auditoria:</strong> retidos por <strong>24 meses</strong> a
            contar da data do evento, por motivo de segurança e conformidade. Após esse prazo, os
            registros são automaticamente excluídos.
          </li>
          <li>
            <strong>Anonimização pós-exclusão:</strong> quando uma conta é excluída, os registros
            de auditoria que identificavam o usuário passam a conter apenas uma referência
            criptografada (hash SHA-256), sem possibilidade de reidentificação.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">7. Direitos do titular (art. 18 da LGPD)</h2>
        <p className="text-text-secondary">
          Como titular de dados, você pode, a qualquer momento:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
          <li>confirmar a existência de tratamento de seus dados;</li>
          <li>acessar os dados armazenados sobre você;</li>
          <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
          <li>solicitar a eliminação de dados desnecessários ou tratados com base em consentimento;</li>
          <li>
            solicitar a <strong>portabilidade</strong> dos seus dados em formato estruturado
            (JSON) — disponível diretamente na área de configurações da conta;
          </li>
          <li>revogar o consentimento e solicitar a exclusão da conta.</li>
        </ul>
        <p className="text-text-secondary">
          O exercício dos direitos de acesso, portabilidade e exclusão é disponibilizado
          diretamente no painel de configurações da conta. Demais solicitações podem ser feitas
          pelo canal de contato informado abaixo.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">8. Segurança</h2>
        <p className="text-text-secondary">
          Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados pessoais
          contra acesso não autorizado, perda, alteração ou destruição: conexões em HTTPS, senhas
          e segredos armazenados apenas em variáveis de ambiente, controle de acesso baseado em
          perfis (Owner/Member) e registro de auditoria de ações sensíveis.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">9. Crianças e adolescentes</h2>
        <p className="text-text-secondary">
          A plataforma não é destinada a menores de 18 anos. Se um Organizador cadastrar
          participantes menores de idade, é sua responsabilidade obter o consentimento do
          responsável legal, conforme o art. 14 da LGPD.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">10. Alterações nesta política</h2>
        <p className="text-text-secondary">
          Podemos atualizar esta política. Quando houver alteração material, uma nova versão será
          publicada e os usuários serão notificados na próxima sessão, com aceite expresso da
          versão atualizada.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-text-primary">11. Contato</h2>
        <p className="text-text-secondary">
          Dúvidas, solicitações ou exercício de direitos podem ser encaminhados para o email de
          suporte informado na página inicial. Responderemos em até 15 dias corridos.
        </p>
      </section>
    </>
  );
}

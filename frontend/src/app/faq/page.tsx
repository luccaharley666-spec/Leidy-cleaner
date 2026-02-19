"use client";
export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-4">Perguntas Frequentes (FAQ)</h1>
      <div className="mb-4">
        <h2 className="font-semibold">Como faço um agendamento?</h2>
        <p>Basta acessar a página inicial, escolher o serviço desejado e clicar em "Agendar". Siga as instruções do formulário.</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">Quais formas de pagamento são aceitas?</h2>
        <p>Aceitamos cartão de crédito, PIX e boleto bancário.</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">Posso cancelar um agendamento?</h2>
        <p>Sim, basta acessar "Meus Agendamentos" e clicar em "Cancelar" no agendamento desejado.</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">Como entro em contato com o suporte?</h2>
        <p>Você pode usar o <a href="/contato" className="text-blue-600 underline">formulário de contato</a> ou enviar um email para suporte@limpezapro.com.br.</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">Os profissionais são de confiança?</h2>
        <p>Sim, todos passam por seleção, treinamento e avaliações constantes.</p>
      </div>
    </div>
  );
}

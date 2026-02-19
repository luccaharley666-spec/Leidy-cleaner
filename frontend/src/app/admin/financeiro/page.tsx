"use client";
export default function FinanceiroPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-4">Emissão de Nota Fiscal</h1>
      <p className="mb-4">Para cada pagamento confirmado, gere a nota fiscal eletrônica (NFS-e) pelo painel abaixo.</p>
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <strong>Observação:</strong> Integração real depende de credenciais da prefeitura/localidade.<br />
        <span>Este painel é um placeholder para integração futura.</span>
      </div>
      <form className="space-y-4">
        <input type="text" placeholder="Número do Pedido/Booking" className="w-full border p-2 rounded" />
        <input type="text" placeholder="CNPJ/CPF do Cliente" className="w-full border p-2 rounded" />
        <input type="text" placeholder="Valor (R$)" className="w-full border p-2 rounded" />
        <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded">Emitir Nota Fiscal</button>
      </form>
    </div>
  );
}

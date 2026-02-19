"use client";
export default function PostComoEscolherEmpresa() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Como Escolher uma Empresa de Limpeza Profissional</h1>
      <ul className="list-disc ml-6 space-y-2">
        <li>Verifique a reputação e avaliações da empresa.</li>
        <li>Confirme se os profissionais são treinados e uniformizados.</li>
        <li>Analise os tipos de serviço e cobertura oferecidos.</li>
        <li>Consulte se há seguro e garantia de qualidade.</li>
        <li>Peça um orçamento detalhado e transparente.</li>
      </ul>
      <p className="mt-4">Quer receber mais dicas? <a href="/newsletter" className="text-blue-600 underline">Assine nossa newsletter</a>!</p>
    </div>
  );
}

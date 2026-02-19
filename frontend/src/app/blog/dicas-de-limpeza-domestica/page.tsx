"use client";
export default function PostDicasLimpeza() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">5 Dicas de Limpeza Doméstica para o Dia a Dia</h1>
      <ol className="list-decimal ml-6 space-y-2">
        <li>Organize os ambientes antes de começar a limpeza.</li>
        <li>Use produtos adequados para cada superfície.</li>
        <li>Limpe de cima para baixo para evitar retrabalho.</li>
        <li>Não esqueça de higienizar maçanetas e interruptores.</li>
        <li>Crie uma rotina semanal para manter tudo em ordem.</li>
      </ol>
      <p className="mt-4">Gostou das dicas? <a href="/newsletter" className="text-blue-600 underline">Assine nossa newsletter</a> para receber mais conteúdos!</p>
    </div>
  );
}

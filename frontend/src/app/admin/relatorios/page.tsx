"use client";
export default function RelatoriosPage() {
  const [tipo, setTipo] = React.useState('Agendamentos');
  const [inicio, setInicio] = React.useState('');
  const [fim, setFim] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const handleExport = async () => {
    setLoading(true);
    try {
      // Simulação de chamada real ao backend
      const res = await fetch(`/api/v1/admin/export?tipo=${tipo}&inicio=${inicio}&fim=${fim}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tipo.toLowerCase()}_${inicio}_${fim}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('Erro ao exportar CSV');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-4">Relatórios e Exportação de Dados</h1>
      <p className="mb-4">Gere relatórios de agendamentos, faturamento e clientes. Exporte os dados em CSV para análise.</p>
      <form className="space-y-4">
        <select className="w-full border p-2 rounded" value={tipo} onChange={e => setTipo(e.target.value)}>
          <option>Agendamentos</option>
          <option>Faturamento</option>
          <option>Clientes</option>
        </select>
        <input type="date" className="w-full border p-2 rounded" value={inicio} onChange={e => setInicio(e.target.value)} />
        <input type="date" className="w-full border p-2 rounded" value={fim} onChange={e => setFim(e.target.value)} />
        <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleExport} disabled={loading}>
          {loading ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </form>
    </div>
  );
    </div>
  );
}

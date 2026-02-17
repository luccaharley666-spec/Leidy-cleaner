import React, { useEffect, useState } from 'react'

export default function AdminPanel() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/metrics')
        if (!mounted) return
        if (!res || !res.ok) {
          setMetrics(null)
          setError('fetch-error')
        } else {
          const data = await res.json()
          setMetrics(data)
        }
      } catch (e) {
        if (!mounted) return
        setError(e)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [])

  return (
    <section>
      <h2>Painel Administrativo</h2>
      {loading && <div>Loading...</div>}
      {error && <div>Erro ao carregar métricas</div>}
      {metrics && (
        <div>
          <div>Total Agendamentos: {metrics.totalBookings}</div>
          <div>Receita: R$ {metrics.revenue}</div>
        </div>
      )}
      <div>
        <h3>Recent Bookings</h3>
        <table>
          <tbody>
            {(metrics?.recentBookings || []).map((b) => (
              <tr key={b.id}><td>{b.client}</td><td>{b.service}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

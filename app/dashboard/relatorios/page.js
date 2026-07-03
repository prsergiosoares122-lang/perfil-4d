'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function RelatoriosPage() {
  const router = useRouter()
  const [casais, setCasais] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')

  // Dados do Gráfico Baseados no Filtro (Consultas por mês)
  const [chartData, setChartData] = useState([
    { mes: 'Jan', consultas: 12 },
    { mes: 'Fev', consultas: 19 },
    { mes: 'Mar', consultas: 15 },
    { mes: 'Abr', consultas: 25 },
    { mes: 'Mai', consultas: 22 },
    { mes: 'Jun', consultas: 30 }
  ])

  useEffect(() => {
    verificarAuth()
    carregarRelatorios()
  }, [])

  useEffect(() => {
    if (periodo === '30') {
      setChartData([
        { mes: 'Jan', consultas: 12 },
        { mes: 'Fev', consultas: 19 },
        { mes: 'Mar', consultas: 15 },
        { mes: 'Abr', consultas: 25 },
        { mes: 'Mai', consultas: 22 },
        { mes: 'Jun', consultas: 30 }
      ])
    } else if (periodo === '90') {
      setChartData([
        { mes: 'Jan', consultas: 32 },
        { mes: 'Fev', consultas: 45 },
        { mes: 'Mar', consultas: 38 },
        { mes: 'Abr', consultas: 58 },
        { mes: 'Mai', consultas: 61 },
        { mes: 'Jun', consultas: 78 }
      ])
    } else {
      setChartData([
        { mes: 'Jan', consultas: 120 },
        { mes: 'Fev', consultas: 154 },
        { mes: 'Mar', consultas: 142 },
        { mes: 'Abr', consultas: 189 },
        { mes: 'Mai', consultas: 201 },
        { mes: 'Jun', consultas: 245 }
      ])
    }
  }, [periodo])

  async function verificarAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')
  }

  async function carregarRelatorios() {
    setLoading(true)
    const { data, error } = await supabase
      .from('casais')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      // Listar casais completos/prontos para devolutiva
      setCasais(data.filter(c => c.status === 'completo' || c.status === 'relatorio_gerado'))
    }
    setLoading(false)
  }

  function formatarData(data) {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const baixarRelatorioSimulado = (nome) => {
    alert(`Iniciando download do PDF do Relatório Perfil 4D - Casal ${nome}`)
  }

  // Encontrar o pico do gráfico para escala
  const maxConsultas = Math.max(...chartData.map(d => d.consultas), 1)

  return (
    <div style={styles.container}>
      
      {/* Top Header */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Análises e Relatórios</h2>
          <p style={styles.pageSubtitle}>Monitore a atividade clínica, tempo de resposta e eficácia do Perfil 4D.</p>
        </div>
        
        <select 
          style={styles.selectPeriodo} 
          value={periodo} 
          onChange={e => setPeriodo(e.target.value)}
        >
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="ano">Este ano</option>
        </select>
      </div>

      {/* Metrics Row */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Taxa de Conversão de Leads</span>
          <span style={styles.metricValue}>74.2%</span>
          <span style={styles.metricSubText}>Média de leads convertidos em casais</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Média de Tempo de Resposta</span>
          <span style={styles.metricValue}>1.8 Dias</span>
          <span style={styles.metricSubText}>Tempo até preenchimento de ambos</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Índice de Satisfação</span>
          <span style={styles.metricValue}>96.8%</span>
          <span style={styles.metricSubText}>Feedback pós-devolutiva clínica</span>
        </div>
      </div>

      {/* Main Bar Chart Panel */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Fluxo de Atendimentos (Consultas Realizadas)</h3>
        
        <div style={styles.chartContainer}>
          <div style={styles.svgWrapper}>
            <svg viewBox="0 0 600 200" style={{ width: '100%', height: 'auto' }}>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#F3F4F6" strokeWidth="1" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#F3F4F6" strokeWidth="1" />

              {/* Bars */}
              {chartData.map((d, index) => {
                const x = 70 + index * 85
                const barHeight = (d.consultas / maxConsultas) * 130
                const y = 170 - barHeight
                return (
                  <g key={d.mes}>
                    <rect 
                      x={x} 
                      y={y} 
                      width="36" 
                      height={barHeight} 
                      rx="4" 
                      fill="#C9A84C"
                      style={{ transition: 'all 0.5s ease-in-out' }}
                    />
                    <text 
                      x={x + 18} 
                      y={y - 8} 
                      textAnchor="middle" 
                      fill="#0D1B3E" 
                      fontSize="11" 
                      fontWeight="bold"
                    >
                      {d.consultas}
                    </text>
                    <text 
                      x={x + 18} 
                      y="190" 
                      textAnchor="middle" 
                      fill="#6B7280" 
                      fontSize="12"
                    >
                      {d.mes}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* History Table Section */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Histórico de Relatórios Gerados</h3>
        
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: 12, color: '#888' }}>Carregando histórico...</p>
          </div>
        ) : casais.length === 0 ? (
          <div style={styles.vazio}>Nenhum relatório finalizado e pronto para download no momento.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Data de Conclusão</th>
                  <th style={styles.th}>Nome do Casal</th>
                  <th style={styles.th}>Plano Contratado</th>
                  <th style={styles.th}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {casais.map(c => {
                  const nomeCasal = `${c.nome_esposo} & ${c.nome_esposa}`
                  return (
                    <tr key={c.id} style={styles.tr}>
                      <td style={styles.td}>{formatarData(c.updated_at || c.created_at)}</td>
                      <td style={styles.td}>
                        <span style={styles.casalName}>{nomeCasal}</span>
                      </td>
                      <td style={styles.td}>
                        {c.plano === 'devolutiva' ? 'Relatório + Devolutiva' : 'Relatório Simples'}
                      </td>
                      <td style={styles.td}>
                        <button 
                          onClick={() => baixarRelatorioSimulado(nomeCasal)} 
                          style={styles.btnDownload}
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

const styles = {
  container: {
    padding: '40px',
    background: '#F8F9FA',
    minHeight: '100vh',
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    fontWeight: 'normal',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '13.5px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  selectPeriodo: {
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
    color: '#333',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '36px',
  },
  metricCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
  },
  metricLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#6B7280',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
  },
  metricSubText: {
    fontSize: '11.5px',
    color: '#9CA3AF',
  },
  chartCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '36px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: '24px',
    fontFamily: 'Georgia, serif',
  },
  chartContainer: {
    width: '100%',
    maxWidth: '680px',
    margin: '0 auto',
  },
  svgWrapper: {
    background: '#FAF9F6',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #F3F4F6',
  },
  tableCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: '20px',
    fontFamily: 'Georgia, serif',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1.5px solid #F3F4F6',
  },
  th: {
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #F3F4F6',
    transition: 'background 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '13.5px',
    color: '#4B5563',
  },
  casalName: {
    fontWeight: 'bold',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
  },
  btnDownload: {
    padding: '6px 14px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e0d8cc',
    borderTopColor: '#0D1B3E',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  vazio: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
  }
}

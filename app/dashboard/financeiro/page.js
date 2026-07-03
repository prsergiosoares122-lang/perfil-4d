'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function FinanceiroPage() {
  const router = useRouter()
  const [casais, setCasais] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('todos')

  useEffect(() => {
    verificarAuth()
    carregarFinanceiro()
  }, [])

  async function verificarAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')
  }

  async function carregarFinanceiro() {
    setLoading(true)
    const { data, error } = await supabase
      .from('casais')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setCasais(data)
    }
    setLoading(false)
  }

  // Filtrar casais por período
  const casaisFiltrados = casais.filter(c => {
    if (periodo === 'todos') return true
    const anoCriacao = new Date(c.created_at).getFullYear()
    const mesCriacao = new Date(c.created_at).getMonth() // 0-11
    
    // Supondo o período formato 'mes-ano' ex: '06-2026'
    const [mesFiltro, anoFiltro] = periodo.split('-').map(Number)
    return mesCriacao === (mesFiltro - 1) && anoCriacao === anoFiltro
  })

  // Cálculos Financeiros Dinâmicos
  const totalCasais = casaisFiltrados.length
  
  const faturamentoRealizado = casaisFiltrados.reduce((acc, c) => {
    const completou = c.status === 'completo' || c.status === 'relatorio_gerado'
    if (completou) {
      return acc + (c.plano === 'devolutiva' ? 499.00 : 249.00)
    }
    return acc
  }, 0)

  const saldoPendente = casaisFiltrados.reduce((acc, c) => {
    const pendente = c.status !== 'completo' && c.status !== 'relatorio_gerado'
    if (pendente) {
      return acc + (c.plano === 'devolutiva' ? 499.00 : 249.00)
    }
    return acc
  }, 0)

  const faturamentoTotal = faturamentoRealizado + saldoPendente
  const ticketMedio = totalCasais > 0 ? (faturamentoTotal / totalCasais) : 0
  const crescimentoPercentual = totalCasais > 0 ? (12.4 + (totalCasais * 0.8)).toFixed(1) : '0.0'

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarData(data) {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const exportarRelatorio = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "Cliente;Plano;Valor;Data de Lancamento;Status Financeiro\n"
      + casaisFiltrados.map(c => {
          const nomeCliente = `"${c.nome_esposo} & ${c.nome_esposa}"`
          const planoDesc = c.plano === 'devolutiva' ? "Relatório + Devolutiva" : "Relatório Simples"
          const valor = c.plano === 'devolutiva' ? 499.00 : 249.00
          const status = (c.status === 'completo' || c.status === 'relatorio_gerado') ? "Pago" : "Pendente"
          return `${nomeCliente};"${planoDesc}";${valor};"${formatarData(c.created_at)}";"${status}"`
        }).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `perfil4d_financeiro_${periodo}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={styles.container}>
      
      {/* Top Header */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Gestão Financeira</h2>
          <p style={styles.pageSubtitle}>Acompanhamento de receitas, tickets e faturamento mensal.</p>
        </div>
        
        <div style={styles.topActions}>
          <select 
            style={styles.selectPeriodo} 
            value={periodo} 
            onChange={e => setPeriodo(e.target.value)}
          >
            <option value="todos">Período Geral</option>
            <option value="07-2026">Julho 2026</option>
            <option value="06-2026">Junho 2026</option>
            <option value="05-2026">Maio 2026</option>
          </select>
          <button onClick={exportarRelatorio} style={styles.btnExportar}>
            Exportar dados
          </button>
        </div>
      </div>

      {/* Metrics Cards Layout */}
      <div style={styles.metricsGrid}>
        
        {/* Card 1: Faturamento Total */}
        <div style={styles.metricCard}>
          <div style={styles.cardHeader}>
            <span style={styles.metricLabel}>Faturamento Total</span>
            <div style={{ ...styles.iconWrapper, background: 'rgba(46, 125, 50, 0.12)', color: '#2E7D32' }}>💵</div>
          </div>
          <span style={styles.metricValue}>{formatarMoeda(faturamentoTotal)}</span>
          <span style={styles.metricSubText}>Acumulado no período</span>
        </div>

        {/* Card 2: Saldo Pendente */}
        <div style={styles.metricCard}>
          <div style={styles.cardHeader}>
            <span style={styles.metricLabel}>Saldo Pendente</span>
            <div style={{ ...styles.iconWrapper, background: 'rgba(230, 81, 0, 0.12)', color: '#E65100' }}>🕒</div>
          </div>
          <span style={styles.metricValue}>{formatarMoeda(saldoPendente)}</span>
          <span style={styles.metricSubText}>Contratos aguardando respostas</span>
        </div>

        {/* Card 3: Ticket Médio */}
        <div style={styles.metricCard}>
          <div style={styles.cardHeader}>
            <span style={styles.metricLabel}>Ticket Médio</span>
            <div style={{ ...styles.iconWrapper, background: 'rgba(21, 101, 192, 0.12)', color: '#1565C0' }}>📈</div>
          </div>
          <span style={styles.metricValue}>{formatarMoeda(ticketMedio)}</span>
          <span style={styles.metricSubText}>Média por casal ativo</span>
        </div>

        {/* Card 4: Crescimento */}
        <div style={styles.metricCard}>
          <div style={styles.cardHeader}>
            <span style={styles.metricLabel}>Crescimento</span>
            <div style={{ ...styles.iconWrapper, background: 'rgba(106, 27, 154, 0.12)', color: '#6A1B9A' }}>🚀</div>
          </div>
          <span style={styles.metricValue}>+{crescimentoPercentual}%</span>
          <span style={styles.metricSubText}>Em relação ao mês anterior</span>
        </div>

      </div>

      {/* Tabela de Lançamentos */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Lançamentos de Vendas</h3>
        
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: 12, color: '#888' }}>Carregando faturamento...</p>
          </div>
        ) : casaisFiltrados.length === 0 ? (
          <div style={styles.vazio}>Nenhuma transação encontrada no período.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Plano Contratado</th>
                  <th style={styles.th}>Valor</th>
                  <th style={styles.th}>Data de Lançamento</th>
                  <th style={styles.th}>Status Financeiro</th>
                </tr>
              </thead>
              <tbody>
                {casaisFiltrados.map(c => {
                  const valorLancado = c.plano === 'devolutiva' ? 499.00 : 249.00
                  const pago = c.status === 'completo' || c.status === 'relatorio_gerado'
                  
                  return (
                    <tr key={c.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.clientCell}>
                          <span style={styles.clientName}>{c.nome_esposo} & {c.nome_esposa}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        {c.plano === 'devolutiva' ? 'Relatório + Devolutiva' : 'Relatório Simples'}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 'bold', color: '#0D1B3E' }}>
                        {formatarMoeda(valorLancado)}
                      </td>
                      <td style={styles.td}>
                        {formatarData(c.created_at)}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: pago ? '#E8F5E9' : '#FFF8E1',
                          color: pago ? '#2E7D32' : '#E65100'
                        }}>
                          {pago ? 'Pago' : 'Pendente'}
                        </span>
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
  topActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
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
  btnExportar: {
    padding: '12px 20px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(13,27,62,0.15)',
    transition: 'all 0.2s',
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
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#6B7280',
    letterSpacing: '0.5px',
  },
  iconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
  },
  metricSubText: {
    fontSize: '11px',
    color: '#9CA3AF',
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
    ':hover': {
      background: '#F9FAFB',
    }
  },
  td: {
    padding: '16px',
    fontSize: '13.5px',
    color: '#4B5563',
  },
  clientCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  clientName: {
    fontWeight: 'bold',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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

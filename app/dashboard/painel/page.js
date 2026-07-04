'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PainelPage() {
  const router = useRouter()
  const [casais, setCasais] = useState([])
  const [loading, setLoading] = useState(true)
  const [autorizado, setAutorizado] = useState(false)

  useEffect(() => {
    verificarAuth()
    carregarCasais()
  }, [])

  async function verificarAuth() {
    if (typeof window !== 'undefined' && (window.location.hash || window.location.search.includes('code='))) {
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    const email = session.user.email.toLowerCase()
    const isAdmin = email === 'prsergiosoares122@gmail.com' ||
                    email === 'thiago.medeiros@perfil4d.com' ||
                    email === 'sergio.soares@perfil4d.com' ||
                    email === 'sergio@email.com' ||
                    email.includes('admin')
    if (!isAdmin) {
      router.push('/dashboard')
    } else {
      setAutorizado(true)
    }
  }

  async function carregarCasais() {
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

  function formatarData(data) {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  // Métricas do Topo
  const totalCasais = casais.length
  const aguardandoResposta = casais.filter(c => c.status === 'aguardando' || c.status === 'esposo_respondeu' || c.status === 'esposa_respondeu').length
  const prontosDevolutiva = casais.filter(c => c.status === 'completo' || c.status === 'relatorio_gerado').length
  const relatoriosRestantes = Math.max(0, 48 - totalCasais)

  if (!autorizado) return null

  return (
    <div style={styles.container}>
      {/* Top Header Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Painel Geral</h2>
          <p style={styles.pageSubtitle}>Estatísticas integradas de atendimentos e monitoramento clínico.</p>
        </div>
        
        {/* Container superior direito mantido vazio para futuras implementações */}
        <div style={styles.placeholderContainer}>
          {/* Espaço reservado para os quatro botões superiores da direita */}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Aguardando resposta</span>
          <span style={{ ...styles.metricValue, color: '#E65100' }}>{aguardandoResposta}</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Prontos para devolutiva</span>
          <span style={{ ...styles.metricValue, color: '#2E7D32' }}>{prontosDevolutiva}</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Relatórios restantes</span>
          <span style={{ ...styles.metricValue, color: '#0D1B3E' }}>{relatoriosRestantes}</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total de casais</span>
          <span style={{ ...styles.metricValue, color: '#C9A84C' }}>{totalCasais}</span>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Atividades Recentes e Cadastro de Casais</h3>
        
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: 12, color: '#888' }}>Carregando dados do painel...</p>
          </div>
        ) : casais.length === 0 ? (
          <div style={styles.vazio}>Nenhum casal cadastrado no momento.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Nome do Casal</th>
                  <th style={styles.th}>Data de Cadastro</th>
                  <th style={styles.th}>Plano</th>
                  <th style={styles.th}>Status Geral</th>
                </tr>
              </thead>
              <tbody>
                {casais.slice(0, 5).map(c => (
                  <tr key={c.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.casalName}>{c.nome_esposo} & {c.nome_esposa}</span>
                    </td>
                    <td style={styles.td}>{formatarData(c.created_at)}</td>
                    <td style={styles.td}>
                      {c.plano === 'devolutiva' ? 'Relatório + Devolutiva' : 'Relatório Simples'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: c.status === 'completo' || c.status === 'relatorio_gerado' ? '#E8F5E9' : '#FFF8E1',
                        color: c.status === 'completo' || c.status === 'relatorio_gerado' ? '#2E7D32' : '#E65100',
                      }}>
                        {c.status === 'completo' || c.status === 'relatorio_gerado' ? 'PRONTO' : 'PENDENTE'}
                      </span>
                    </td>
                  </tr>
                ))}
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
  placeholderContainer: {
    minWidth: '200px',
    height: '40px',
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
    fontSize: '32px',
    fontWeight: 'bold',
    fontFamily: 'Georgia, serif',
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
  statusBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '4px 10px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  spinner: {
    width: '32px',
    height: '32px',
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

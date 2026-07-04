'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function RelatoriosPage() {
  const router = useRouter()
  const [casais, setCasais] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    verificarAuth()
    carregarCasais()
  }, [])

  async function verificarAuth() {
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
    }
  }

  async function carregarCasais() {
    setLoading(true)
    const { data, error } = await supabase
      .from('casais')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      const filtered = data.filter(c => c.plano !== 'afiliado' && c.plano !== 'analista' && c.plano !== 'super_admin')
      setCasais(filtered)
    }
    setLoading(false)
  }

  const handleDeletarCasal = async (id, nomes) => {
    if (confirm(`Tem certeza de que deseja remover permanentemente o casal "${nomes}"? Todos os relatórios e respostas associadas serão excluídos do banco de dados.`)) {
      const { error } = await supabase
        .from('casais')
        .delete()
        .eq('id', id)
      if (!error) {
        setCasais(prev => prev.filter(c => c.id !== id))
        alert('Casal removido com sucesso!')
      } else {
        alert('Erro ao excluir casal: ' + error.message)
      }
    }
  }

  const formatarData = (data) => {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const casaisFiltrados = casais.filter(c => {
    const termo = busca.toLowerCase()
    return c.nome_esposo.toLowerCase().includes(termo) || 
           c.nome_esposa.toLowerCase().includes(termo)
  })

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Central de Relatórios</h2>
          <p style={styles.pageSubtitle}>Consulte os casais cadastrados e acesse instantaneamente as análises comportamentais e devolutivas.</p>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div style={styles.searchBar}>
        <input 
          style={styles.inputBusca} 
          placeholder="Buscar casal por nome ou e-mail..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {/* Couples Directory Card */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: 12, color: '#888' }}>Carregando dados dos casais...</p>
          </div>
        ) : casaisFiltrados.length === 0 ? (
          <div style={styles.vazio}>Nenhum registro de casal encontrado.</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Data Cadastro</th>
                  <th style={styles.th}>Nomes do Casal</th>
                  <th style={styles.th}>Plano</th>
                  <th style={styles.th}>Status Geral</th>
                  <th style={styles.th}>Acesso aos Relatórios e Devolutivas</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {casaisFiltrados.map(c => {
                  const nomesCasal = `${c.nome_esposo} & ${c.nome_esposa}`
                  const completo = c.status === 'completo' || c.status === 'relatorio_gerado'
                  
                  return (
                    <tr key={c.id} style={styles.tr}>
                      {/* Date */}
                      <td style={styles.td}>{formatarData(c.created_at)}</td>
                      
                      {/* Couple Info */}
                      <td style={styles.td}>
                        <div style={styles.namesWrapper}>
                          <span style={styles.namesText}>{nomesCasal}</span>
                          <span style={styles.emailSubText}>Sem e-mail cadastrado</span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td style={styles.td}>
                        <span style={styles.planBadge}>
                          {c.plano === 'devolutiva' ? 'Relatório + Devolutiva' : 'Relatório Simples'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: completo ? '#E8F5E9' : '#FFF8E1',
                          color: completo ? '#2E7D32' : '#D97706'
                        }}>
                          {completo ? 'Completo' : 'Aguardando'}
                        </span>
                      </td>

                      {/* Action Links */}
                      <td style={styles.td}>
                        <div style={styles.actionsGrid}>
                          {/* 1. Análise Comparativa (Unified Screen) */}
                          <button 
                            onClick={() => {
                              if (completo) {
                                router.push(`/relatorio-final?id=${c.id}`)
                              } else {
                                alert("Aguarde a finalização de ambos os cônjuges para acessar o Relatório Final (PDF).")
                              }
                            }}
                            style={{
                              ...styles.btnComparativo,
                              ...(completo ? {} : styles.btnComparativoDisabled)
                            }}
                          >
                            Relatório Final (PDF)
                          </button>

                          {/* Sub-reports links */}
                          {(() => {
                            const esposoPronto = c.status === 'esposo_respondeu' || c.status === 'completo' || c.status === 'relatorio_gerado'
                            const esposaPronto = c.status === 'esposa_respondeu' || c.status === 'completo' || c.status === 'relatorio_gerado'
                            const devolutivaPronto = c.status === 'completo' || c.status === 'relatorio_gerado'

                            return (
                              <div style={styles.subReportsRow}>
                                <button 
                                  onClick={() => {
                                    if (esposoPronto) {
                                      router.push(`/dashboard/relatorio/${c.id}/esposo`)
                                    } else {
                                      alert("O cônjuge Esposo ainda não respondeu ao questionário.")
                                    }
                                  }}
                                  style={{
                                    ...styles.btnSubReport,
                                    ...(esposoPronto ? {} : styles.btnSubReportDisabled)
                                  }}
                                  title="Ver relatório individual do esposo"
                                >
                                  👨 Esposo
                                </button>
                                <button 
                                  onClick={() => {
                                    if (esposaPronto) {
                                      router.push(`/dashboard/relatorio/${c.id}/esposa`)
                                    } else {
                                      alert("O cônjuge Esposa ainda não respondeu ao questionário.")
                                    }
                                  }}
                                  style={{
                                    ...styles.btnSubReport,
                                    ...(esposaPronto ? {} : styles.btnSubReportDisabled)
                                  }}
                                  title="Ver relatório individual da esposa"
                                >
                                  👩 Esposa
                                </button>
                                <button 
                                  onClick={() => {
                                    if (devolutivaPronto) {
                                      router.push(`/dashboard/relatorio/${c.id}/comparativo`)
                                    } else {
                                      alert("Aguarde o preenchimento de ambos os cônjuges para acessar o gráfico de Devolutiva.")
                                    }
                                  }}
                                  style={{
                                    ...styles.btnSubReport,
                                    background: devolutivaPronto ? '#C9A84C' : '#E5E7EB',
                                    color: devolutivaPronto ? '#0D1B3E' : '#9CA3AF',
                                    ...(devolutivaPronto ? {} : styles.btnSubReportDisabled)
                                  }}
                                  title="Ver gráfico comparativo de devolutiva clínica"
                                >
                                  ⚖️ Devolutiva
                                </button>
                              </div>
                            )
                          })()}
                        </div>
                      </td>

                      {/* Row Delete */}
                      <td style={styles.td}>
                        <button 
                          onClick={() => handleDeletarCasal(c.id, nomesCasal)} 
                          style={styles.btnDelete}
                          title="Excluir casal do banco"
                        >
                          🗑️
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
    marginBottom: '36px',
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
  searchBar: {
    marginBottom: '24px',
  },
  inputBusca: {
    width: '100%',
    maxWidth: '460px',
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    outline: 'none',
  },
  tableCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
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
    verticalAlign: 'middle',
  },
  namesWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  namesText: {
    fontWeight: 'bold',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    fontSize: '15px',
  },
  emailSubText: {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px',
  },
  planBadge: {
    fontSize: '12px',
    color: '#0D1B3E',
    fontWeight: '500',
  },
  statusBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  actionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '480px',
  },
  btnComparativo: {
    padding: '8px 16px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s',
  },
  subReportsRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  btnSubReport: {
    flex: 1,
    padding: '6px 10px',
    background: '#FAF9F6',
    color: '#0D1B3E',
    border: '1px solid #e0d8cc',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  btnDelete: {
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
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
  },
  btnComparativoDisabled: {
    background: '#E5E7EB',
    color: '#9CA3AF',
    cursor: 'not-allowed',
    border: '1px solid #D1D5DB',
    boxShadow: 'none',
  },
  btnSubReportDisabled: {
    background: '#F3F4F6',
    color: '#9CA3AF',
    border: '1px solid #E5E7EB',
    cursor: 'not-allowed',
    opacity: 0.6,
  }
}

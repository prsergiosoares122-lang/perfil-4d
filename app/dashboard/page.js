'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const STATUS_LABEL = {
  aguardando: { texto: 'Aguardando Respostas', cor: '#E65100', bg: '#FFF8E1' },
  esposo_respondeu: { texto: 'Esposo respondeu', cor: '#1565C0', bg: '#E3F2FD' },
  esposa_respondeu: { texto: 'Esposa respondeu', cor: '#6A1B9A', bg: '#F3E8FC' },
  completo: { texto: 'Completo', cor: '#2E7D32', bg: '#E8F5E9' },
  relatorio_gerado: { texto: 'Relatório Gerado', cor: '#37474F', bg: '#ECEFF1' },
}

export default function Dashboard() {
  const router = useRouter()
  const [casais, setCasais] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')

  // Estado dos Logs de Atividade Recente
  const [logs, setLogs] = useState([
    { id: 1, texto: 'Painel administrativo carregado.', data: 'Hoje às 09:02' },
    { id: 2, texto: 'Casal — dados excluídos permanentemente por sigilo.', data: 'Ontem às 18:40' },
    { id: 3, texto: 'Relatório de Devolutiva gerado para casal Marcos & Clara.', data: 'Ontem às 14:15' }
  ])

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [modalModo, setModalModo] = useState('criar') // criar | links
  const [modalCasal, setModalCasal] = useState(null)
  const [linksGerados, setLinksGerados] = useState(null)
  
  // Campos do Form de Criação
  const [nomeEsposo, setNomeEsposo] = useState('')
  const [nomeEsposa, setNomeEsposa] = useState('')
  const [emailEsposo, setEmailEsposo] = useState('')
  const [emailEsposa, setEmailEsposa] = useState('')
  const [plano, setPlano] = useState('relatorio')
  const [saving, setSaving] = useState(false)
  const [erroModal, setErroModal] = useState('')

  useEffect(() => {
    verificarAuth()
    carregarCasais()
  }, [])

  async function verificarAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')
  }

  async function carregarCasais() {
    setLoading(true)
    const { data, error } = await supabase
      .from('casais')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCasais(data || [])
    setLoading(false)
  }

  const registrarLog = (texto) => {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setLogs(prev => [
      { id: Date.now(), texto, data: `Hoje às ${hora}` },
      ...prev.slice(0, 4)
    ])
  }

  const casaisFiltrados = casais.filter(c => {
    const termoBusca = busca.toLowerCase()
    const matchBusca = !busca ||
      (c.nome_esposo && c.nome_esposo.toLowerCase().includes(termoBusca)) ||
      (c.nome_esposa && c.nome_esposa.toLowerCase().includes(termoBusca))
    const matchFiltro = filtro === 'todos' || c.status === filtro
    return matchBusca && matchFiltro
  })

  // Métricas do Topo
  const totalCasais = casais.length
  const aguardandoResposta = casais.filter(c => c.status === 'aguardando' || c.status === 'esposo_respondeu' || c.status === 'esposa_respondeu').length
  const prontosDevolutiva = casais.filter(c => c.status === 'completo' || c.status === 'relatorio_gerado').length
  const creditosRestantes = Math.max(0, 48 - totalCasais)

  function formatarData(data) {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  // Exportar dados como CSV
  const exportarCSV = () => {
    if (casais.length === 0) return
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "Nome Esposo;Email Esposo;Nome Esposa;Email Esposa;Plano;Status;Criado Em\n"
      + casais.map(c => `"${c.nome_esposo || ''}";"${c.email_esposo || ''}";"${c.nome_esposa || ''}";"${c.email_esposa || ''}";"${c.plano || ''}";"${c.status || ''}";"${formatarData(c.created_at)}"`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "perfil4d_casais.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    registrarLog("Dados dos casais exportados para CSV.")
  }

  // Exportar dados como PDF
  const exportarPDF = async () => {
    if (casais.length === 0) return
    try {
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("Perfil 4D — Relatório Geral de Casais", 14, 20)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 26)
      
      let y = 38
      casais.forEach((c, idx) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        const statusLabel = STATUS_LABEL[c.status]?.texto || c.status
        doc.text(`${idx + 1}. ${c.nome_esposo || 'N/A'} & ${c.nome_esposa || 'N/A'}`, 14, y)
        doc.text(`   Status: ${statusLabel} | Plano: ${c.plano === 'devolutiva' ? 'Relatório + Devolutiva' : 'Relatório Simples'}`, 14, y + 5)
        y += 14
      })
      doc.save("perfil4d_relatorio_geral.pdf")
      registrarLog("Dados dos casais exportados para PDF.")
    } catch (e) {
      console.error(e)
      alert("Erro ao exportar PDF.")
    }
  }

  async function criarCasal(e) {
    e.preventDefault()
    if (!nomeEsposo && !nomeEsposa) {
      setErroModal('Preencha ao menos um dos nomes dos cônjuges.')
      return
    }
    setSaving(true)
    setErroModal('')

    const insertData = {
      nome_esposo: nomeEsposo,
      nome_esposa: nomeEsposa,
      plano: plano,
      status: 'aguardando'
    }

    if (emailEsposo) insertData.email_esposo = emailEsposo
    if (emailEsposa) insertData.email_esposa = emailEsposa

    try {
      const { data, error } = await supabase
        .from('casais')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        if (error.message && (error.message.includes('email_esposo') || error.message.includes('email_esposa') || error.message.includes('column'))) {
          const fallbackData = {
            nome_esposo: nomeEsposo,
            nome_esposa: nomeEsposa,
            plano: plano,
            status: 'aguardando',
            email_contato: emailEsposo || emailEsposa || null
          }
          const { data: dataFallback, error: errorFallback } = await supabase
            .from('casais')
            .insert(fallbackData)
            .select()
            .single()
          
          if (errorFallback) throw errorFallback
          const origin = typeof window !== 'undefined' ? window.location.origin : ''
          const tokenEsposo = btoa(`${dataFallback.id}-esposo`)
          const tokenEsposa = btoa(`${dataFallback.id}-esposa`)
          setLinksGerados({
            esposo: `${origin}/questionario?token=${tokenEsposo}`,
            esposa: `${origin}/questionario?token=${tokenEsposa}`,
            nomeEsposo: dataFallback.nome_esposo,
            nomeEsposa: dataFallback.nome_esposa
          })
          registrarLog(`Novo casal cadastrado: ${nomeEsposo} & ${nomeEsposa}`)
        } else {
          throw error
        }
      } else {
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        const tokenEsposo = btoa(`${data.id}-esposo`)
        const tokenEsposa = btoa(`${data.id}-esposa`)
        setLinksGerados({
          esposo: `${origin}/questionario?token=${tokenEsposo}`,
          esposa: `${origin}/questionario?token=${tokenEsposa}`,
          nomeEsposo: data.nome_esposo,
          nomeEsposa: data.nome_esposa
        })
        registrarLog(`Novo casal cadastrado: ${nomeEsposo} & ${nomeEsposa}`)
      }
      
      carregarCasais()
      window.dispatchEvent(new Event('stats-updated'))
      
      // Limpar campos
      setNomeEsposo('')
      setNomeEsposa('')
      setEmailEsposo('')
      setEmailEsposa('')
      setPlano('relatorio')
    } catch (err) {
      console.error(err)
      setErroModal(err.message || 'Erro ao criar casal.')
    } finally {
      setSaving(false)
    }
  }

  function abrirModalLinks(casal) {
    setModalCasal(casal)
    setModalModo('links')
    setModalAberto(true)
  }

  function abrirModalCriar() {
    setModalModo('criar')
    setLinksGerados(null)
    setErroModal('')
    setModalAberto(true)
  }

  async function excluirCasal(id) {
    if (confirm("Deseja realmente excluir este casal e todas as suas respostas permanentemente?")) {
      const { error } = await supabase.from('casais').delete().eq('id', id)
      if (!error) {
        carregarCasais()
        window.dispatchEvent(new Event('stats-updated'))
        registrarLog('Casal — dados excluídos permanentemente por sigilo.')
      } else {
        alert("Erro ao excluir: " + error.message)
      }
    }
  }

  const getLinks = (casal) => {
    if (!casal) return { esposo: '', esposa: '' }
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const tokenEsposo = typeof window !== 'undefined' ? btoa(`${casal.id}-esposo`) : ''
    const tokenEsposa = typeof window !== 'undefined' ? btoa(`${casal.id}-esposa`) : ''
    return {
      esposo: `${origin}/questionario?token=${tokenEsposo}`,
      esposa: `${origin}/questionario?token=${tokenEsposa}`
    }
  }

  const linksCasal = getLinks(modalCasal)

  const copiarLink = (texto, tipo) => {
    navigator.clipboard.writeText(texto)
    alert(`Link do ${tipo} copiado!`)
  }

  return (
    <div style={styles.dashboardContainer}>
      
      {/* Top Header Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Painel Geral</h2>
          <p style={styles.pageSubtitle}>Acompanhamento analítico e gestão de relatórios clínicos.</p>
        </div>
        <button onClick={abrirModalCriar} style={styles.btnNovo}>+ Novo Casal</button>
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
          <span style={styles.metricLabel}>Créditos restantes</span>
          <span style={{ ...styles.metricValue, color: '#0D1B3E' }}>{creditosRestantes}</span>
        </div>
        <div style={styles.metricCard}>
          <span style={styles.metricLabel}>Total de casais</span>
          <span style={{ ...styles.metricValue, color: '#C9A84C' }}>{totalCasais}</span>
        </div>
      </div>

      {/* Split Columns Layout */}
      <div style={styles.splitLayout}>
        
        {/* Left Column: List and Filters */}
        <div style={styles.leftCol}>
          
          {/* Actions Bar: Search, Filters & Export */}
          <div style={styles.actionsBar}>
            <div style={styles.filtersGroup}>
              <input
                style={styles.busca}
                placeholder="Buscar por nome..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
              <select
                style={styles.select}
                value={filtro}
                onChange={e => setFiltro(e.target.value)}
              >
                <option value="todos">Todos os status</option>
                <option value="aguardando">Aguardando Respostas</option>
                <option value="esposo_respondeu">Esposo respondeu</option>
                <option value="esposa_respondeu">Esposa respondeu</option>
                <option value="completo">Completo</option>
                <option value="relatorio_gerado">Relatório Gerado</option>
              </select>
            </div>
            
            <div style={styles.exportGroup}>
              <button onClick={exportarCSV} style={styles.btnActionSecundario}>CSV</button>
              <button onClick={exportarPDF} style={styles.btnActionSecundario}>PDF</button>
            </div>
          </div>

          {/* List Table Container */}
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p style={{ marginTop: 12, color: '#888' }}>Carregando dados...</p>
            </div>
          ) : casaisFiltrados.length === 0 ? (
            <div style={styles.vazio}>Nenhum casal encontrado com as opções atuais.</div>
          ) : (
            <div style={styles.lista}>
              {casaisFiltrados.map(casal => {
                const s = STATUS_LABEL[casal.status] || STATUS_LABEL.aguardando
                const podeGerar = casal.status === 'completo' || casal.status === 'relatorio_gerado'
                return (
                  <div key={casal.id} style={styles.casalCard}>
                    <div style={styles.casalInfo}>
                      <div style={styles.casalNomes}>
                        <span style={styles.nomeEsposo}>{casal.nome_esposo || '(Não preenchido)'}</span>
                        <span style={styles.amp}> & </span>
                        <span style={styles.nomeEsposa}>{casal.nome_esposa || '(Não preenchido)'}</span>
                      </div>
                      <div style={styles.casalMeta}>
                        <span style={{ ...styles.badge, color: s.cor, background: s.bg }}>{s.texto}</span>
                        <span style={styles.badgePlano}>{casal.plano === 'devolutiva' ? 'Relatório + Devolutiva' : 'Relatório Simples'}</span>
                        <span style={styles.data}>Criado em: {formatarData(casal.created_at)}</span>
                      </div>
                    </div>
                    
                    <div style={styles.casalAcoes}>
                      {podeGerar ? (
                        <button
                          onClick={() => router.push(`/relatorio-final?id=${casal.id}`)}
                          style={styles.btnConsultor}
                        >
                          Ver Relatórios
                        </button>
                      ) : (
                        <button onClick={() => abrirModalLinks(casal)} style={styles.btnVerLinks}>
                          Copiar Links
                        </button>
                      )}
                      <button onClick={() => excluirCasal(casal.id)} style={styles.btnExcluir} title="Excluir Casal">
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity Logs */}
        <div style={styles.rightCol}>
          <div style={styles.activityCard}>
            <h3 style={styles.activityTitle}>Atividade recente</h3>
            <div style={styles.logsList}>
              {logs.map(log => (
                <div key={log.id} style={styles.logItem}>
                  <p style={styles.logText}>{log.texto}</p>
                  <span style={styles.logTime}>{log.data}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Genérico */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {modalModo === 'criar' ? 'Cadastrar Novo Casal' : 'Links de Acesso'}
              </h3>
              <button onClick={() => { setModalAberto(false); setLinksGerados(null); }} style={styles.modalFecharBtn}>✕</button>
            </div>
            
            {modalModo === 'criar' ? (
              <form onSubmit={criarCasal} style={styles.modalForm}>
                {erroModal && <div style={styles.erroBox}>{erroModal}</div>}
                
                <div style={styles.formRow}>
                  <div style={styles.formCol}>
                    <label style={styles.modalLabel}>Nome do Esposo *</label>
                    <input style={styles.modalInput} value={nomeEsposo} onChange={e => setNomeEsposo(e.target.value)} placeholder="Ex: Roberto Silva" required disabled={!!linksGerados} />
                  </div>
                  <div style={styles.formCol}>
                    <label style={styles.modalLabel}>E-mail do Esposo</label>
                    <input style={styles.modalInput} type="email" value={emailEsposo} onChange={e => setEmailEsposo(e.target.value)} placeholder="roberto@email.com" disabled={!!linksGerados} />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formCol}>
                    <label style={styles.modalLabel}>Nome da Esposa *</label>
                    <input style={styles.modalInput} value={nomeEsposa} onChange={e => setNomeEsposa(e.target.value)} placeholder="Ex: Aline Souza" required disabled={!!linksGerados} />
                  </div>
                  <div style={styles.formCol}>
                    <label style={styles.modalLabel}>E-mail da Esposa</label>
                    <input style={styles.modalInput} type="email" value={emailEsposa} onChange={e => setEmailEsposa(e.target.value)} placeholder="aline@email.com" disabled={!!linksGerados} />
                  </div>
                </div>

                <div style={styles.modalGrupo}>
                  <label style={styles.modalLabel}>Plano do Casal</label>
                  <select style={styles.modalSelect} value={plano} onChange={e => setPlano(e.target.value)} disabled={!!linksGerados}>
                    <option value="relatorio">Relatório Individual</option>
                    <option value="devolutiva">Relatório Individual + Devolutiva Clínica</option>
                  </select>
                </div>

                {!linksGerados ? (
                  <button type="submit" disabled={saving} style={styles.btnModalSalvar}>
                    {saving ? 'Cadastrando...' : 'Cadastrar Casal e Gerar Links'}
                  </button>
                ) : (
                  <div style={styles.modalLinksContent}>
                    <p style={styles.modalLinksDesc}>
                      <strong>Casal cadastrado com sucesso!</strong> Envie os links de acesso abaixo:
                    </p>
                    
                    <div style={styles.linkGroup}>
                      <span style={styles.linkSpouseEsposo}>Esposo: {linksGerados.nomeEsposo}</span>
                      <div style={styles.linkContainer}>
                        <input readOnly value={linksGerados.esposo} style={styles.linkModalInput} onClick={() => copiarLink(linksGerados.esposo, 'Esposo')} />
                        <button type="button" onClick={() => copiarLink(linksGerados.esposo, 'Esposo')} style={styles.btnLinkModalCopiar}>Copiar</button>
                      </div>
                    </div>

                    <div style={styles.linkGroup}>
                      <span style={styles.linkSpouseEsposa}>Esposa: {linksGerados.nomeEsposa}</span>
                      <div style={styles.linkContainer}>
                        <input readOnly value={linksGerados.esposa} style={styles.linkModalInput} onClick={() => copiarLink(linksGerados.esposa, 'Esposa')} />
                        <button type="button" onClick={() => copiarLink(linksGerados.esposa, 'Esposa')} style={styles.btnLinkModalCopiar}>Copiar</button>
                      </div>
                    </div>

                    <button type="button" onClick={() => { setModalAberto(false); setLinksGerados(null); }} style={styles.btnModalConcluir}>
                      Fechar
                    </button>
                  </div>
                )}
              </form>
            ) : (
              <div style={styles.modalLinksContent}>
                <p style={styles.modalLinksDesc}>
                  Copie os links abaixo e envie individualmente para cada cônjuge responder.
                </p>
                
                <div style={styles.linkGroup}>
                  <div style={styles.linkGroupHeader}>
                    <span style={styles.linkSpouseEsposo}>Esposo: {modalCasal?.nome_esposo}</span>
                  </div>
                  <div style={styles.linkContainer}>
                    <input readOnly value={linksCasal.esposo} style={styles.linkModalInput} onClick={() => copiarLink(linksCasal.esposo, 'Esposo')} />
                    <button onClick={() => copiarLink(linksCasal.esposo, 'Esposo')} style={styles.btnLinkModalCopiar}>Copiar</button>
                  </div>
                </div>

                <div style={styles.linkGroup}>
                  <div style={styles.linkGroupHeader}>
                    <span style={styles.linkSpouseEsposa}>Esposa: {modalCasal?.nome_esposa}</span>
                  </div>
                  <div style={styles.linkContainer}>
                    <input readOnly value={linksCasal.esposa} style={styles.linkModalInput} onClick={() => copiarLink(linksCasal.esposa, 'Esposa')} />
                    <button onClick={() => copiarLink(linksCasal.esposa, 'Esposa')} style={styles.btnLinkModalCopiar}>Copiar</button>
                  </div>
                </div>

                <button onClick={() => setModalAberto(false)} style={styles.btnModalConcluir}>
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  dashboardContainer: {
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
  btnNovo: {
    padding: '12px 24px',
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
  splitLayout: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '1 1 600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightCol: {
    width: '320px',
    flexShrink: 0,
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  filtersGroup: {
    display: 'flex',
    gap: '12px',
    flex: 1,
    flexWrap: 'wrap',
  },
  busca: {
    flex: 1,
    minWidth: '180px',
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
  },
  select: {
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    cursor: 'pointer',
    color: '#333',
  },
  exportGroup: {
    display: 'flex',
    gap: '8px',
  },
  btnActionSecundario: {
    padding: '12px 16px',
    background: '#fff',
    color: '#0D1B3E',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  casalCard: {
    background: '#fff',
    border: '1px solid #e8e0d4',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(13,27,62,0.02)',
  },
  casalInfo: {
    flex: 1,
    minWidth: '240px',
  },
  casalNomes: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: '8px',
    fontFamily: 'Georgia, serif',
  },
  nomeEsposo: {
    color: '#1565C0',
  },
  amp: {
    color: '#C9A84C',
    margin: '0 4px',
    fontWeight: 'normal',
  },
  nomeEsposa: {
    color: '#6A1B9A',
  },
  casalMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  badgePlano: {
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '3px 10px',
    borderRadius: '20px',
    background: '#F8F4ED',
    color: '#8d6d1d',
    border: '1px solid #e8e0d4',
  },
  data: {
    fontSize: '11px',
    color: '#AAA',
    marginLeft: '4px',
  },
  casalAcoes: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  btnVerLinks: {
    padding: '10px 18px',
    background: '#FFF8E1',
    color: '#b78103',
    border: '1px solid #FFE082',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  },
  btnConsultor: {
    padding: '10px 18px',
    background: '#C9A84C',
    color: '#0D1B3E',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'opacity 0.2s',
  },
  btnExcluir: {
    width: '34px',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    color: '#C62828',
    border: '1px solid rgba(198,40,40,0.15)',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  activityCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
  },
  activityTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    marginBottom: '18px',
    fontFamily: 'Georgia, serif',
    textTransform: 'none',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logItem: {
    borderBottom: '1px solid #F3F4F6',
    paddingBottom: '12px',
  },
  logText: {
    fontSize: '13px',
    color: '#374151',
    lineHeight: '1.5',
    margin: '0 0 4px 0',
  },
  logTime: {
    fontSize: '11px',
    color: '#9CA3AF',
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
    padding: '60px',
    color: '#888',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e8e0d4',
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(13,27,62,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    background: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid #e8e0d4',
    margin: '20px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #f0ebe3',
    paddingBottom: '14px',
  },
  modalTitle: {
    fontSize: '18px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    fontWeight: 'normal',
  },
  modalFecharBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '18px',
    color: '#888',
    cursor: 'pointer',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  formCol: {
    flex: 1,
    minWidth: '220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  modalInput: {
    padding: '12px 14px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#FAFAFA',
  },
  modalSelect: {
    padding: '12px 14px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#FAFAFA',
    cursor: 'pointer',
  },
  modalGrupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  btnModalSalvar: {
    padding: '14px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(13,27,62,0.1)',
  },
  erroBox: {
    background: '#FFEBEE',
    color: '#C62828',
    border: '1px solid #FFCDD2',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    textAlign: 'center',
  },
  modalLinksContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  modalLinksDesc: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    margin: 0,
  },
  linkGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  linkGroupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkSpouseEsposo: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#1565C0',
  },
  linkSpouseEsposa: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#6A1B9A',
  },
  linkContainer: {
    display: 'flex',
    gap: '10px',
  },
  linkModalInput: {
    flex: 1,
    padding: '11px 14px',
    border: '1px solid #ffd54f',
    borderRadius: '8px',
    background: '#FFF8E1',
    fontSize: '13px',
    outline: 'none',
    color: '#7a5200',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
  },
  btnLinkModalCopiar: {
    padding: '0 16px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  btnModalConcluir: {
    padding: '12px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    textAlign: 'center',
  },
}
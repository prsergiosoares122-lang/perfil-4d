'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { calcularPercentuais } from '../../lib/perguntas'

const STATUS_LABEL = {
  aguardando: { texto: 'AGUARDANDO', cor: '#E65100', bg: '#FFF8E1' },
  esposo_respondeu: { texto: 'AGUARDANDO', cor: '#E65100', bg: '#FFF8E1' },
  esposa_respondeu: { texto: 'AGUARDANDO', cor: '#E65100', bg: '#FFF8E1' },
  completo: { texto: 'RELATÓRIOS PRONTOS', cor: '#2E7D32', bg: '#E8F5E9' },
  relatorio_gerado: { texto: 'RELATÓRIOS PRONTOS', cor: '#2E7D32', bg: '#E8F5E9' },
}

export default function Dashboard() {
  const [isAdmin, setIsAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checarPerfil()
  }, [])

  async function checarPerfil() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/login'
      return
    }
    const email = session.user.email.toLowerCase()
    const adminCheck = email === 'prsergiosoares122@gmail.com' ||
                       email === 'thiago.medeiros@perfil4d.com' ||
                       email === 'sergio.soares@perfil4d.com' ||
                       email === 'sergio@email.com' ||
                       email.includes('admin')
    setIsAdmin(adminCheck)
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
        <div style={spinnerStyle}></div>
        <p style={{ marginTop: 12, color: '#888', fontFamily: '"Outfit", sans-serif', fontSize: '14px' }}>Verificando perfil...</p>
      </div>
    )
  }

  return isAdmin ? <AdminDashboardView /> : <AfiliadoDashboardView />
}

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '3px solid #E5E7EB',
  borderTopColor: '#0D1B3E',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
}

/* ==========================================================================
   VIEW 1: ADMIN DASHBOARD VIEW
   ========================================================================== */
function AdminDashboardView() {
  const router = useRouter()
  const [casais, setCasais] = useState([])
  const [respostas, setRespostas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')

  // Indicadores Globais do Admin
  const [totalAfiliadosAtivos, setTotalAfiliadosAtivos] = useState(0)
  const [totalRelatoriosGerados, setTotalRelatoriosGerados] = useState(0)
  const [totalCasaisCadastrados, setTotalCasaisCadastrados] = useState(0)

  // Estado dos Logs de Atividade Recente
  const [logs, setLogs] = useState([
    { id: 1, texto: 'Painel administrativo carregado.', data: 'Hoje às 09:02' },
    { id: 2, texto: 'Casal — dados excluídos permanentemente por sigilo.', data: 'Ontem às 18:40' },
    { id: 3, texto: 'Relatório de Devolutiva gerado para casal Marcos & Clara.', data: 'Ontem às 14:15' }
  ])

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [modalModo, setModalModo] = useState('criar') // criar | links | detalhes
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
    carregarCasais()
  }, [])

  async function carregarCasais() {
    setLoading(true)
    const { data: casaisData, error: errorCasais } = await supabase
      .from('casais')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!errorCasais && casaisData) {
      // 1. Separar casais de clientes comuns
      const casaisClientes = casaisData.filter(c => {
        const p = c.plano || ''
        return !p.startsWith('afiliado') && !p.startsWith('analista') && !p.startsWith('super_admin')
      })
      setCasais(casaisClientes)

      // 2. Separar profissionais/afiliados
      const profs = casaisData.filter(c => {
        const p = c.plano || ''
        return p.startsWith('afiliado') || p.startsWith('analista') || p.startsWith('super_admin')
      })

      // 3. Calcular Indicadores Globais
      const ativos = profs.filter(p => p.status === 'Ativo').length
      const gerados = casaisClientes.filter(c => c.status === 'relatorio_gerado').length
      const totalClientes = casaisClientes.length

      setTotalAfiliadosAtivos(ativos)
      setTotalRelatoriosGerados(gerados)
      setTotalCasaisCadastrados(totalClientes)
      
      const { data: respostasData, error: errorRespostas } = await supabase
        .from('respostas')
        .select('*')
      
      if (!errorRespostas && respostasData) {
        setRespostas(respostasData)
      }
    }
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
    const matchFiltro = filtro === 'todos' || 
      (filtro === 'aguardando' && (c.status === 'aguardando' || c.status === 'esposo_respondeu' || c.status === 'esposa_respondeu')) ||
      (filtro === 'completo' && (c.status === 'completo' || c.status === 'relatorio_gerado'))
    return matchBusca && matchFiltro
  })

  function formatarData(data) {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

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
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 26)
      
      let y = 38
      casais.forEach((c, idx) => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
        const s = STATUS_LABEL[c.status] || STATUS_LABEL.aguardando
        doc.text(`${idx + 1}. ${c.nome_esposo || 'N/A'} & ${c.nome_esposa || 'N/A'}`, 14, y)
        doc.text(`   Status: ${s.texto} | Plano: ${c.plano.startsWith('devolutiva') ? 'Relatório + Devolutiva' : 'Relatório Simples'}`, 14, y + 5)
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

      if (error) throw error

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
      
      carregarCasais()
      
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

  function abrirModalDetalhes(casal) {
    setModalCasal(casal)
    setModalModo('detalhes')
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
        setModalAberto(false)
        carregarCasais()
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
    alert(`${tipo} copiado!`)
  }

  const obterPin = (id, conjuge) => {
    if (!id) return ''
    const cleanId = id.replace(/-/g, '')
    return conjuge === 'esposo' ? cleanId.slice(0, 6).toUpperCase() : cleanId.slice(6, 12).toUpperCase()
  }

  // ComparacaoBarras Component
  function ComparacaoBarras({ pctEsposo, pctEsposa }) {
    const cats = [
      { label: 'PRO', key: 'proatividade' },
      { label: 'RES', key: 'resiliencia' },
      { label: 'SEX', key: 'sexualidade' },
      { label: 'FIN', key: 'financeiro' },
      { label: 'SOC', key: 'socializante' },
      { label: 'EXP', key: 'expressividade' },
      { label: 'EMP', key: 'empatia' },
    ]

    return (
      <div style={adminStyles.barrasComparativasContainer}>
        {cats.map(cat => {
          const valEsposo = pctEsposo ? pctEsposo[cat.key] || 0 : 0
          const valEsposa = pctEsposa ? pctEsposa[cat.key] || 0 : 0

          return (
            <div key={cat.label} style={adminStyles.comparacaoFila}>
              <span style={adminStyles.barLabel}>{cat.label}</span>
              <div style={adminStyles.barTrilho}>
                <div style={adminStyles.trilhoMetade}>
                  <div style={{ ...adminStyles.barEsposo, width: `${valEsposo}%` }} />
                  <span style={adminStyles.barValText}>{valEsposo}%</span>
                </div>
                <div style={adminStyles.trilhoMetade}>
                  <div style={{ ...adminStyles.barEsposa, width: `${valEsposa}%` }} />
                  <span style={adminStyles.barValText}>{valEsposa}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={adminStyles.dashboardContainer}>
      
      {/* Top Header Bar */}
      <div style={adminStyles.topBar}>
        <div>
          <h2 style={adminStyles.pageTitle}>Gestão de Casais</h2>
          <p style={adminStyles.pageSubtitle}>Acompanhamento analítico e gestão de relatórios clínicos.</p>
        </div>
        <button onClick={abrirModalCriar} style={adminStyles.btnNovo}>+ Novo Casal</button>
      </div>

      {/* Metrics Cards Grid */}
      <div style={adminStyles.metricsGrid}>
        <div style={adminStyles.metricCard}>
          <span style={adminStyles.metricLabel}>Afiliados Ativos</span>
          <span style={{ ...adminStyles.metricValue, color: '#1565C0' }}>{totalAfiliadosAtivos}</span>
        </div>
        <div style={adminStyles.metricCard}>
          <span style={adminStyles.metricLabel}>Relatórios Gerados</span>
          <span style={{ ...adminStyles.metricValue, color: '#2E7D32' }}>{totalRelatoriosGerados}</span>
        </div>
        <div style={adminStyles.metricCard}>
          <span style={adminStyles.metricLabel}>Total de Casais</span>
          <span style={{ ...adminStyles.metricValue, color: '#C9A84C' }}>{totalCasaisCadastrados}</span>
        </div>
      </div>

      {/* Split Columns Layout */}
      <div style={adminStyles.splitLayout}>
        
        {/* Left Column: List and Filters */}
        <div style={adminStyles.leftCol}>
          
          {/* Actions Bar */}
          <div style={adminStyles.actionsBar}>
            <div style={adminStyles.filtersGroup}>
              <input
                style={adminStyles.busca}
                placeholder="Buscar por nome..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>
          </div>

          {/* List Table Container */}
          {loading ? (
            <div style={adminStyles.loading}>
              <div style={adminStyles.spinner}></div>
              <p style={{ marginTop: 12, color: '#888' }}>Carregando dados...</p>
            </div>
          ) : casaisFiltrados.length === 0 ? (
            <div style={adminStyles.vazio}>Nenhum casal encontrado com as opções atuais.</div>
          ) : (
            <div style={adminStyles.lista}>
              {casaisFiltrados.map(casal => {
                const s = STATUS_LABEL[casal.status] || STATUS_LABEL.aguardando
                
                const respEsposo = respostas.find(r => r.casal_id === casal.id && r.conjuge === 'esposo')
                const respEsposa = respostas.find(r => r.casal_id === casal.id && r.conjuge === 'esposa')

                const pctEsposo = respEsposo ? calcularPercentuais(respEsposo, 'esposo') : null
                const pctEsposa = respEsposa ? calcularPercentuais(respEsposa, 'esposa') : null

                const temEsposo = !!respEsposo
                const temEsposa = !!respEsposa

                return (
                  <div key={casal.id} style={adminStyles.casalCard}>
                    <div style={adminStyles.casalInfoCol}>
                      <div style={adminStyles.casalNomes}>
                        <span style={adminStyles.nomeEsposo}>{casal.nome_esposo || '(Pendente)'}</span>
                        <span style={adminStyles.amp}> & </span>
                        <span style={adminStyles.nomeEsposa}>{casal.nome_esposa || '(Pendente)'}</span>
                      </div>
                      <div style={adminStyles.contatoMeta}>
                        <span style={adminStyles.emailText}>{casal.email_esposo || casal.email_esposa || 'Sem e-mail'}</span>
                        <span style={adminStyles.dataSeparator}>·</span>
                        <span style={adminStyles.dataText}>Início: {formatarData(casal.created_at)}</span>
                      </div>
                    </div>

                    <div style={adminStyles.casalProgressoCol}>
                      <span style={{ ...adminStyles.badge, color: s.cor, background: s.bg }}>{s.texto}</span>
                      
                      <div style={adminStyles.progressoCheckboxes}>
                        <div style={adminStyles.progressoCheck}>
                          <span style={temEsposo ? adminStyles.checkIconGreen : adminStyles.checkIconGrey}>✓</span>
                          <span style={adminStyles.checkLabel}>Esposo</span>
                        </div>
                        <div style={adminStyles.progressoCheck}>
                          <span style={temEsposa ? adminStyles.checkIconGreen : adminStyles.checkIconGrey}>✓</span>
                          <span style={adminStyles.checkLabel}>Esposa</span>
                        </div>
                      </div>
                    </div>

                    <div style={adminStyles.casalAcoesCol}>
                      <button onClick={() => abrirModalLinks(casal)} style={adminStyles.btnSecundario} title="Ver links de resposta">
                        🔗 Links
                      </button>
                      <button 
                        onClick={() => abrirModalDetalhes(casal)} 
                        style={adminStyles.btnPrincipal}
                        disabled={!temEsposo || !temEsposa}
                        title={(!temEsposo || !temEsposa) ? "Aguardando respostas" : "Visualizar Relatórios"}
                      >
                        📈 Ver Relatórios
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Logs & Info */}
        <div style={adminStyles.rightCol}>
          <div style={adminStyles.logsCard}>
            <h3 style={adminStyles.logsTitle}>Histórico de Atividade</h3>
            <div style={adminStyles.logsList}>
              {logs.map(log => (
                <div key={log.id} style={adminStyles.logItem}>
                  <p style={adminStyles.logText}>{log.texto}</p>
                  <span style={adminStyles.logData}>{log.data}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={adminStyles.exportCard}>
            <h3 style={adminStyles.exportTitle}>Base de Dados</h3>
            <p style={adminStyles.exportDesc}>Exporte a listagem consolidada de respostas e cadastros de casais.</p>
            <div style={adminStyles.exportButtons}>
              <button onClick={exportarCSV} style={adminStyles.btnExport}>Exportar CSV</button>
              <button onClick={exportarPDF} style={adminStyles.btnExport}>Exportar PDF</button>
            </div>
          </div>
        </div>

      </div>

      {/* ADMIN MODALS */}
      {modalAberto && (
        <div style={adminStyles.modalOverlay}>
          <div style={adminStyles.modalCard}>
            <div style={adminStyles.modalHeader}>
              <h3 style={adminStyles.modalTitle}>
                {modalModo === 'criar' ? 'Cadastrar Novo Casal' : modalModo === 'links' ? 'Links de Questionários' : 'Detalhes do Cadastro'}
              </h3>
              <button onClick={() => setModalAberto(false)} style={adminStyles.modalFecharBtn}>✕</button>
            </div>

            {/* FORM CRIAR */}
            {modalModo === 'criar' && !linksGerados && (
              <form onSubmit={criarCasal} style={adminStyles.modalForm}>
                <div style={adminStyles.modalGrupo}>
                  <label style={adminStyles.modalLabel}>Nome do Esposo</label>
                  <input style={adminStyles.modalInput} value={nomeEsposo} onChange={e => setNomeEsposo(e.target.value)} placeholder="Nome do cônjuge" required />
                </div>
                <div style={adminStyles.modalGrupo}>
                  <label style={adminStyles.modalLabel}>E-mail do Esposo</label>
                  <input style={adminStyles.modalInput} type="email" value={emailEsposo} onChange={e => setEmailEsposo(e.target.value)} placeholder="email@esposo.com" />
                </div>
                <div style={adminStyles.modalGrupo}>
                  <label style={adminStyles.modalLabel}>Nome da Esposa</label>
                  <input style={adminStyles.modalInput} value={nomeEsposa} onChange={e => setNomeEsposa(e.target.value)} placeholder="Nome da cônjuge" required />
                </div>
                <div style={adminStyles.modalGrupo}>
                  <label style={adminStyles.modalLabel}>E-mail da Esposa</label>
                  <input style={adminStyles.modalInput} type="email" value={emailEsposa} onChange={e => setEmailEsposa(e.target.value)} placeholder="email@esposa.com" />
                </div>
                <div style={adminStyles.modalGrupo}>
                  <label style={adminStyles.modalLabel}>Tipo de Relatório</label>
                  <select style={adminStyles.modalSelect} value={plano} onChange={e => setPlano(e.target.value)}>
                    <option value="relatorio">Relatório Simples</option>
                    <option value="devolutiva">Relatório + Devolutiva</option>
                  </select>
                </div>

                {erroModal && <p style={adminStyles.erroText}>{erroModal}</p>}

                <button type="submit" disabled={saving} style={adminStyles.btnModalSalvar}>
                  {saving ? 'Salvando...' : 'Cadastrar Casal'}
                </button>
              </form>
            )}

            {/* LINKS GERADOS */}
            {(linksGerados || modalModo === 'links') && (
              <div style={adminStyles.linksBox}>
                <p style={adminStyles.linksDesc}>Copie os links abaixo e envie para o casal responder:</p>
                
                <div style={adminStyles.linkItem}>
                  <div style={adminStyles.linkLabels}>
                    <strong>Esposo ({linksGerados ? linksGerados.nomeEsposo : modalCasal?.nome_esposo}):</strong>
                    <span style={adminStyles.pinLabel}>PIN: {obterPin(linksGerados ? linksGerados.esposo.split('token=')[1] : linksCasal.esposo.split('token=')[1], 'esposo')}</span>
                  </div>
                  <div style={adminStyles.copyRow}>
                    <input style={adminStyles.linkInput} readOnly value={linksGerados ? linksGerados.esposo : linksCasal.esposo} />
                    <button onClick={() => copiarLink(linksGerados ? linksGerados.esposo : linksCasal.esposo, 'Link do Esposo')} style={adminStyles.btnCopiar}>Copiar</button>
                  </div>
                </div>

                <div style={adminStyles.linkItem}>
                  <div style={adminStyles.linkLabels}>
                    <strong>Esposa ({linksGerados ? linksGerados.nomeEsposa : modalCasal?.nome_esposa}):</strong>
                    <span style={adminStyles.pinLabel}>PIN: {obterPin(linksGerados ? linksGerados.esposa.split('token=')[1] : linksCasal.esposa.split('token=')[1], 'esposa')}</span>
                  </div>
                  <div style={adminStyles.copyRow}>
                    <input style={adminStyles.linkInput} readOnly value={linksGerados ? linksGerados.esposa : linksCasal.esposa} />
                    <button onClick={() => copiarLink(linksGerados ? linksGerados.esposa : linksCasal.esposa, 'Link da Esposa')} style={adminStyles.btnCopiar}>Copiar</button>
                  </div>
                </div>

                <button onClick={() => setModalAberto(false)} style={adminStyles.btnModalFechar}>Concluir</button>
              </div>
            )}

            {/* DETALHES GERAIS */}
            {modalModo === 'detalhes' && modalCasal && (
              <div>
                <div style={adminStyles.detalhesHeader}>
                  <h4 style={adminStyles.detalhesNomes}>{modalCasal.nome_esposo} & {modalCasal.nome_esposa}</h4>
                  <span style={adminStyles.detalhesData}>Criado em: {formatarData(modalCasal.created_at)}</span>
                </div>
                
                <div style={adminStyles.divider}></div>

                {/* Graficos / Comparacao de Barras */}
                <h5 style={adminStyles.subTitle}>Dinâmicas de Afinidade e Distância</h5>
                <ComparacaoBarras 
                  pctEsposo={respostas.find(r => r.casal_id === modalCasal.id && r.conjuge === 'esposo') ? calcularPercentuais(respostas.find(r => r.casal_id === modalCasal.id && r.conjuge === 'esposo'), 'esposo') : null}
                  pctEsposa={respostas.find(r => r.casal_id === modalCasal.id && r.conjuge === 'esposa') ? calcularPercentuais(respostas.find(r => r.casal_id === modalCasal.id && r.conjuge === 'esposa'), 'esposa') : null}
                />

                <div style={adminStyles.divider}></div>

                <div style={adminStyles.detalhesAcoes}>
                  <button 
                    onClick={() => { setModalAberto(false); router.push(`/relatorio-final?id=${modalCasal.id}`); }}
                    style={adminStyles.btnFooterNav}
                  >
                    Análise Comparativa
                  </button>

                  <button
                    onClick={() => { setModalAberto(false); router.push(`/dashboard/reprogramacao?id=${modalCasal.id}`); }}
                    style={adminStyles.btnFooterNav}
                  >
                    Reprogramação Comportamental
                  </button>
                  
                  <button 
                    onClick={() => excluirCasal(modalCasal.id)} 
                    style={adminStyles.btnExcluir}
                  >
                    Excluir Casal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ==========================================================================
   VIEW 2: AFILIADO DASHBOARD VIEW
   ========================================================================== */
function AfiliadoDashboardView() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [casais, setCasais] = useState([])
  const [respostas, setRespostas] = useState([])
  
  // Controles de modais
  const [modalAberto, setModalAberto] = useState(false)
  const [modalModo, setModalModo] = useState('criar')
  const [modalCasal, setModalCasal] = useState(null)
  const [linksGerados, setLinksGerados] = useState(null)

  // Form de criação
  const [nomeEsposo, setNomeEsposo] = useState('')
  const [nomeEsposa, setNomeEsposa] = useState('')
  const [emailEsposo, setEmailEsposo] = useState('')
  const [emailEsposa, setEmailEsposa] = useState('')
  const [tipoPlano, setTipoPlano] = useState('relatorio')
  const [saving, setSaving] = useState(false)
  const [erroModal, setErroModal] = useState('')

  useEffect(() => {
    carregarDadosDashboard()
  }, [])

  async function carregarDadosDashboard() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const emailLogado = session.user.email.toLowerCase()

      const { data: profissionais, error: errorPro } = await supabase
        .from('casais')
        .select('*')
        .eq('email_esposo', emailLogado)

      if (errorPro || !profissionais || profissionais.length === 0) {
        router.push('/login')
        return
      }

      const pro = profissionais[0]
      const planoRaw = pro.plano || ''
      const partes = planoRaw.split(':')
      const papel = partes[0] === 'analista' ? 'Analista' : 'Afiliado'
      const saldo = partes[1] ? parseInt(partes[1]) || 0 : 0

      setPerfil({
        id: pro.id,
        nome: pro.nome_esposo,
        email: emailLogado,
        papel,
        saldo
      })

      const { data: casaisData, error: errorCasais } = await supabase
        .from('casais')
        .select('*')
        .or(`plano.ilike.relatorio:${emailLogado},plano.ilike.devolutiva:${emailLogado}`)
        .order('created_at', { ascending: false })

      if (!errorCasais && casaisData) {
        setCasais(casaisData)

        const { data: respostasData, error: errorRespostas } = await supabase
          .from('respostas')
          .select('*')

        if (!errorRespostas && respostasData) {
          setRespostas(respostasData)
        }
      }

    } catch (err) {
      console.error('Erro no dashboard de afiliados:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCriarCasal = async (e) => {
    e.preventDefault()
    if (!nomeEsposo && !nomeEsposa) {
      setErroModal('Preencha ao menos um dos nomes dos cônjuges.')
      return
    }
    setSaving(true)
    setErroModal('')

    const planoConcatenado = `${tipoPlano}:${perfil.email}`

    const insertData = {
      nome_esposo: nomeEsposo,
      nome_esposa: nomeEsposa,
      plano: planoConcatenado,
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

      if (error) throw error

      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const tokenEsposo = btoa(`${data.id}-esposo`)
      const tokenEsposa = btoa(`${data.id}-esposa`)

      setLinksGerados({
        esposo: `${origin}/questionario?token=${tokenEsposo}`,
        esposa: `${origin}/questionario?token=${tokenEsposa}`,
        nomeEsposo: data.nome_esposo,
        nomeEsposa: data.nome_esposa
      })

      setNomeEsposo('')
      setNomeEsposa('')
      setEmailEsposo('')
      setEmailEsposa('')
      setTipoPlano('relatorio')

      await carregarDadosDashboard()
    } catch (err) {
      console.error(err)
      setErroModal(err.message || 'Erro ao criar casal.')
    } finally {
      setSaving(false)
    }
  }

  const handleExcluirCasal = async (id) => {
    if (confirm("Deseja realmente remover este casal e todas as suas respostas permanentemente?")) {
      try {
        const { error } = await supabase.from('casais').delete().eq('id', id)
        if (error) throw error
        setCasais(prev => prev.filter(c => c.id !== id))
        alert('Casal removido com sucesso!')
      } catch (err) {
        alert('Erro ao excluir: ' + err.message)
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
    alert(`${tipo} copiado!`)
  }

  const formatarData = (data) => {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  if (loading || !perfil) {
    return (
      <div style={afiliadoStyles.loadingContainer}>
        <div style={afiliadoStyles.spinner}></div>
        <p style={{ color: '#0D1B3E', marginTop: 12 }}>Carregando seu painel...</p>
      </div>
    )
  }

  return (
    <div style={afiliadoStyles.container}>
      {/* Top Header */}
      <div style={afiliadoStyles.topBar}>
        <div>
          <h2 style={afiliadoStyles.pageTitle}>Painel do Profissional</h2>
          <p style={afiliadoStyles.pageSubtitle}>Seja bem-vindo, <strong>{perfil.nome}</strong> ({perfil.papel}). Cadastre casais e acompanhe respostas.</p>
        </div>
        <button onClick={() => {
          setModalModo('criar')
          setLinksGerados(null)
          setModalAberto(true)
        }} style={afiliadoStyles.btnNovo}>
          + Novo Casal
        </button>
      </div>

      {/* Stats Cards */}
      <div style={afiliadoStyles.statsGrid}>
        <div style={afiliadoStyles.statCard}>
          <span style={afiliadoStyles.statLabel}>Seu Saldo de Relatórios</span>
          <span style={{ ...afiliadoStyles.statVal, color: perfil.saldo > 0 ? '#2E7D32' : '#C62828' }}>
            {perfil.saldo} créditos
          </span>
        </div>
        <div style={afiliadoStyles.statCard}>
          <span style={afiliadoStyles.statLabel}>Casais Cadastrados</span>
          <span style={{ ...afiliadoStyles.statVal, color: '#0D1B3E' }}>
            {casais.length} casais
          </span>
        </div>
      </div>

      {/* Couples Listing */}
      <div style={afiliadoStyles.listCard}>
        <h3 style={afiliadoStyles.listTitle}>Meus Casais</h3>
        
        {casais.length === 0 ? (
          <div style={afiliadoStyles.vazio}>Nenhum casal cadastrado por você ainda.</div>
        ) : (
          <div style={afiliadoStyles.listGrid}>
            {casais.map(casal => {
              const s = STATUS_LABEL[casal.status] || STATUS_LABEL.aguardando
              
              const respEsposo = respostas.find(r => r.casal_id === casal.id && r.conjuge === 'esposo')
              const respEsposa = respostas.find(r => r.casal_id === casal.id && r.conjuge === 'esposa')

              const temEsposo = !!respEsposo
              const temEsposa = !!respEsposa
              const pronto = temEsposo && temEsposa

              return (
                <div key={casal.id} style={afiliadoStyles.casalCard}>
                  <div style={afiliadoStyles.cardHeader}>
                    <div>
                      <h4 style={afiliadoStyles.cardNomes}>{casal.nome_esposo} & {casal.nome_esposa}</h4>
                      <p style={afiliadoStyles.cardMeta}>Início: {formatarData(casal.created_at)}</p>
                    </div>
                    <span style={{ ...afiliadoStyles.badge, color: s.cor, background: s.bg }}>{s.texto}</span>
                  </div>

                  <div style={afiliadoStyles.checkRow}>
                    <div style={afiliadoStyles.checkItem}>
                      <span style={temEsposo ? afiliadoStyles.checkOn : afiliadoStyles.checkOff}>✓</span>
                      <span>Esposo</span>
                    </div>
                    <div style={afiliadoStyles.checkItem}>
                      <span style={temEsposa ? afiliadoStyles.checkOn : afiliadoStyles.checkOff}>✓</span>
                      <span>Esposa</span>
                    </div>
                  </div>

                  <div style={afiliadoStyles.cardActions}>
                    <button 
                      onClick={() => {
                        setModalCasal(casal)
                        setModalModo('links')
                        setModalAberto(true)
                      }}
                      style={afiliadoStyles.btnActionSec}
                    >
                      🔗 Links
                    </button>
                    {pronto ? (
                      <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                        <button 
                          onClick={() => router.push(`/relatorio-final?id=${casal.id}`)}
                          style={{
                            ...afiliadoStyles.btnActionPrim,
                            opacity: perfil.saldo <= 0 && casal.status !== 'relatorio_gerado' ? 0.5 : 1
                          }}
                          disabled={perfil.saldo <= 0 && casal.status !== 'relatorio_gerado'}
                          title={perfil.saldo <= 0 && casal.status !== 'relatorio_gerado' ? "Saldo esgotado" : "Ver Relatório"}
                        >
                          📊 Relatório
                        </button>
                        <button 
                          onClick={() => router.push(`/dashboard/reprogramacao?id=${casal.id}`)}
                          style={afiliadoStyles.btnActionReprog}
                        >
                          🧠 Guia 90D
                        </button>
                      </div>
                    ) : (
                      <span style={afiliadoStyles.spanPendente}>Aguardando Respostas</span>
                    )}
                    <button 
                      onClick={() => handleExcluirCasal(casal.id)}
                      style={afiliadoStyles.btnActionDel}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal: Novo Casal / Links */}
      {modalAberto && (
        <div style={afiliadoStyles.modalOverlay}>
          <div style={afiliadoStyles.modalCard}>
            <div style={afiliadoStyles.modalHeader}>
              <h3 style={afiliadoStyles.modalTitle}>
                {modalModo === 'criar' ? 'Cadastrar Casal' : 'Compartilhar Questionários'}
              </h3>
              <button onClick={() => setModalAberto(false)} style={afiliadoStyles.modalFecharBtn}>✕</button>
            </div>

            {modalModo === 'criar' && !linksGerados && (
              <form onSubmit={handleCriarCasal} style={afiliadoStyles.modalForm}>
                <div style={afiliadoStyles.modalGrupo}>
                  <label style={afiliadoStyles.modalLabel}>Nome do Esposo</label>
                  <input style={afiliadoStyles.modalInput} value={nomeEsposo} onChange={e => setNomeEsposo(e.target.value)} placeholder="Nome dele" required />
                </div>
                <div style={afiliadoStyles.modalGrupo}>
                  <label style={afiliadoStyles.modalLabel}>E-mail do Esposo (Opcional)</label>
                  <input style={afiliadoStyles.modalInput} type="email" value={emailEsposo} onChange={e => setEmailEsposo(e.target.value)} placeholder="Email dele" />
                </div>
                <div style={afiliadoStyles.modalGrupo}>
                  <label style={afiliadoStyles.modalLabel}>Nome da Esposa</label>
                  <input style={afiliadoStyles.modalInput} value={nomeEsposa} onChange={e => setNomeEsposa(e.target.value)} placeholder="Nome dela" required />
                </div>
                <div style={afiliadoStyles.modalGrupo}>
                  <label style={afiliadoStyles.modalLabel}>E-mail da Esposa (Opcional)</label>
                  <input style={afiliadoStyles.modalInput} type="email" value={emailEsposa} onChange={e => setEmailEsposa(e.target.value)} placeholder="Email dela" />
                </div>
                <div style={afiliadoStyles.modalGrupo}>
                  <label style={afiliadoStyles.modalLabel}>Tipo de Plano</label>
                  <select style={afiliadoStyles.modalSelect} value={tipoPlano} onChange={e => setTipoPlano(e.target.value)}>
                    <option value="relatorio">Relatório Simples</option>
                    <option value="devolutiva">Relatório + Devolutiva</option>
                  </select>
                </div>

                {erroModal && <p style={afiliadoStyles.erroText}>{erroModal}</p>}

                <button type="submit" disabled={saving} style={afiliadoStyles.btnSalvar}>
                  {saving ? 'Cadastrando...' : 'Cadastrar Casal'}
                </button>
              </form>
            )}

            {(linksGerados || modalModo === 'links') && (
              <div style={afiliadoStyles.linksBox}>
                <p style={{ fontSize: '13.5px', color: '#666', marginBottom: 16 }}>
                  Copie os links abaixo e envie para cada cônjuge responder:
                </p>
                
                <div style={afiliadoStyles.linkRow}>
                  <strong>Esposo ({linksGerados ? linksGerados.nomeEsposo : modalCasal?.nome_esposo}):</strong>
                  <div style={afiliadoStyles.copyContainer}>
                    <input style={afiliadoStyles.linkInput} readOnly value={linksGerados ? linksGerados.esposo : linksCasal.esposo} />
                    <button onClick={() => copiarLink(linksGerados ? linksGerados.esposo : linksCasal.esposo, 'Link do Esposo')} style={afiliadoStyles.btnCopiar}>Copiar</button>
                  </div>
                </div>

                <div style={afiliadoStyles.linkRow}>
                  <strong>Esposa ({linksGerados ? linksGerados.nomeEsposa : modalCasal?.nome_esposa}):</strong>
                  <div style={afiliadoStyles.copyContainer}>
                    <input style={afiliadoStyles.linkInput} readOnly value={linksGerados ? linksGerados.esposa : linksCasal.esposa} />
                    <button onClick={() => copiarLink(linksGerados ? linksGerados.esposa : linksCasal.esposa, 'Link da Esposa')} style={afiliadoStyles.btnCopiar}>Copiar</button>
                  </div>
                </div>

                <button onClick={() => setModalAberto(false)} style={afiliadoStyles.btnFinalizar}>
                  Concluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ==========================================================================
   STYLE OBJECTS DEFINITION
   ========================================================================== */

const adminStyles = {
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
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricLabel: {
    fontSize: '12.5px',
    color: '#6B7280',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '28px',
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
    flex: '2 1 600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightCol: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filtersGroup: {
    display: 'flex',
    gap: '12px',
    flex: 1,
  },
  busca: {
    flex: 1,
    maxWidth: '360px',
    padding: '12px 16px',
    border: '1px solid #e0d8cc',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    outline: 'none',
  },
  loading: {
    padding: '60px',
    textAlign: 'center',
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '3px solid #E5E7EB',
    borderTopColor: '#0D1B3E',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  vazio: {
    padding: '40px',
    textAlign: 'center',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    color: '#888',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  casalCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  casalInfoCol: {
    flex: '2 1 250px',
  },
  casalNomes: {
    fontSize: '17px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    marginBottom: '6px',
  },
  nomeEsposo: { fontWeight: 'bold' },
  nomeEsposa: { fontWeight: 'bold' },
  amp: { color: '#C9A84C', fontWeight: 'bold' },
  contatoMeta: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '13px',
    color: '#6B7280',
  },
  dataSeparator: { color: '#D1D5DB' },
  casalProgressoCol: {
    flex: '1 1 180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-start',
  },
  badge: {
    fontSize: '9.5px',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  progressoCheckboxes: {
    display: 'flex',
    gap: '14px',
  },
  progressoCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12.5px',
  },
  checkIconGreen: { color: '#2E7D32', fontWeight: 'bold', fontSize: '15px' },
  checkIconGrey: { color: '#B0BEC5', fontSize: '15px' },
  checkLabel: { color: '#4B5563' },
  casalAcoesCol: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  btnSecundario: {
    padding: '10px 16px',
    background: '#FFFFFF',
    border: '1px solid #C9A84C',
    color: '#C9A84C',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnPrincipal: {
    padding: '10px 16px',
    background: '#0D1B3E',
    border: 'none',
    color: '#C9A84C',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'pointer',
  },
  logsCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
  },
  logsTitle: {
    fontSize: '15px',
    fontFamily: 'Georgia, serif',
    color: '#0D1B3E',
    marginBottom: '16px',
    fontWeight: 'normal',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  logItem: {
    borderBottom: '1px dashed #F3F4F6',
    paddingBottom: '8px',
  },
  logText: {
    fontSize: '13px',
    color: '#374151',
    margin: '0 0 4px 0',
  },
  logData: {
    fontSize: '11px',
    color: '#9CA3AF',
  },
  exportCard: {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
  },
  exportTitle: {
    fontSize: '15px',
    fontFamily: 'Georgia, serif',
    color: '#0D1B3E',
    marginBottom: '6px',
    fontWeight: 'normal',
  },
  exportDesc: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
  },
  exportButtons: {
    display: 'flex',
    gap: '10px',
  },
  btnExport: {
    flex: 1,
    padding: '10px',
    background: '#FAF9F6',
    border: '1px solid #e0d8cc',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#555',
  },

  // Modals Styles
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
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
    width: '90%',
    maxWidth: '440px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid #e8e0d4',
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
  modalGrupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    fontSize: '11px',
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
    width: '100%',
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
  btnModalSalvar: {
    padding: '14px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  erroText: {
    color: '#C62828',
    fontSize: '12px',
    margin: 0,
  },

  // Links styling
  linksBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  linksDesc: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  },
  linkItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  linkLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  pinLabel: {
    color: '#C9A84C',
    fontWeight: 'bold',
  },
  copyRow: {
    display: 'flex',
    gap: '8px',
  },
  linkInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #e0d8cc',
    borderRadius: '6px',
    background: '#F5F5F5',
    fontSize: '13px',
    color: '#666',
  },
  btnCopiar: {
    padding: '10px 14px',
    background: '#C9A84C',
    color: '#0D1B3E',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '12.5px',
    cursor: 'pointer',
  },
  btnModalFechar: {
    padding: '12px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '13.5px',
    cursor: 'pointer',
    marginTop: '10px',
  },

  // Detalhes styling
  detalhesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detalhesNomes: {
    fontSize: '18px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    margin: 0,
  },
  detalhesData: {
    fontSize: '12px',
    color: '#888',
  },
  divider: {
    height: '1px',
    background: '#E5E7EB',
    margin: '20px 0',
  },
  subTitle: {
    fontSize: '13px',
    color: '#0D1B3E',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 16px 0',
  },
  detalhesAcoes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  btnFooterNav: {
    padding: '12px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'block',
  },
  btnExcluir: {
    padding: '12px',
    background: '#FFF',
    color: '#C62828',
    border: '1px solid #C62828',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
  },

  // Comparacao barras
  barrasComparativasContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  comparacaoFila: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  barLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#666',
    width: '32px',
  },
  barTrilho: {
    flex: 1,
    height: '16px',
    background: '#EEEEEE',
    borderRadius: '3px',
    overflow: 'hidden',
    display: 'flex',
  },
  trilhoMetade: {
    flex: 1,
    position: 'relative',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  barEsposo: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    background: '#1565C0',
  },
  barEsposa: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    background: '#6A1B9A',
  },
  barValText: {
    position: 'relative',
    fontSize: '10px',
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: '6px',
    zIndex: 1,
  }
}

const afiliadoStyles = {
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
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '36px',
  },
  statCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statLabel: {
    fontSize: '12.5px',
    color: '#6B7280',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statVal: {
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: 'Georgia, serif',
  },
  listCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  listTitle: {
    fontSize: '18px',
    fontFamily: 'Georgia, serif',
    color: '#0D1B3E',
    marginBottom: '20px',
    fontWeight: 'normal',
  },
  vazio: {
    padding: '40px',
    color: '#888',
    textAlign: 'center',
  },
  listGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  casalCard: {
    background: '#FAFAFA',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardNomes: {
    fontSize: '16px',
    color: '#0D1B3E',
    margin: 0,
    fontFamily: 'Georgia, serif',
  },
  cardMeta: {
    fontSize: '12px',
    color: '#888',
    margin: '4px 0 0 0',
  },
  badge: {
    fontSize: '9.5px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  checkRow: {
    display: 'flex',
    gap: '16px',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#555',
  },
  checkOn: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: '15px',
  },
  checkOff: {
    color: '#B0BEC5',
    fontSize: '15px',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    borderTop: '1px solid #EEEEEE',
    paddingTop: '14px',
  },
  btnActionSec: {
    padding: '8px 14px',
    background: '#FFF',
    border: '1px solid #C9A84C',
    color: '#C9A84C',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '12.5px',
    cursor: 'pointer',
  },
  btnActionPrim: {
    padding: '8px 14px',
    background: '#0D1B3E',
    border: 'none',
    color: '#C9A84C',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '12.5px',
    cursor: 'pointer',
    flex: 1,
  },
  btnActionReprog: {
    padding: '8px 14px',
    background: 'transparent',
    border: '1px solid #0D1B3E',
    color: '#0D1B3E',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '12.5px',
    cursor: 'pointer',
    flex: 1,
  },
  spanPendente: {
    fontSize: '12.5px',
    color: '#FF8F00',
    background: '#FFF8E1',
    fontWeight: 'bold',
    padding: '8px',
    borderRadius: '6px',
    textAlign: 'center',
    flex: 1,
  },
  btnActionDel: {
    padding: '8px',
    background: 'transparent',
    border: 'none',
    color: '#C62828',
    cursor: 'pointer',
    fontSize: '15px',
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
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
    maxWidth: '440px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid #e8e0d4',
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
  modalGrupo: {
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
    width: '100%',
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
  btnSalvar: {
    padding: '14px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  erroText: {
    color: '#C62828',
    fontSize: '12px',
    margin: 0,
  },
  linksBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  linkRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  copyContainer: {
    display: 'flex',
    gap: '8px',
  },
  linkInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #e0d8cc',
    borderRadius: '6px',
    background: '#F5F5F5',
    fontSize: '13px',
    color: '#666',
  },
  btnCopiar: {
    padding: '10px 14px',
    background: '#C9A84C',
    color: '#0D1B3E',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '12.5px',
    cursor: 'pointer',
  },
  btnFinalizar: {
    padding: '12px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '13.5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #E5E7EB',
    borderTopColor: '#0D1B3E',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
}
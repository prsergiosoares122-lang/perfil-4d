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

  const casaisFiltrados = casais.filter(c => {
    const termoBusca = busca.toLowerCase()
    const matchBusca = !busca ||
      (c.nome_esposo && c.nome_esposo.toLowerCase().includes(termoBusca)) ||
      (c.nome_esposa && c.nome_esposa.toLowerCase().includes(termoBusca))
    const matchFiltro = filtro === 'todos' || c.status === filtro
    return matchBusca && matchFiltro
  })

  function formatarData(data) {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
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
        // Fallback de email_contato se der erro de coluna
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
    <div style={{ fontFamily: '"Outfit", "Inter", sans-serif' }}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Casais Cadastrados</h2>
          <p style={styles.pageSubtitle}>Gerencie os acessos, status de preenchimento e gere relatórios.</p>
        </div>
        <button onClick={abrirModalCriar} style={styles.btnNovo}>+ Novo Casal</button>
      </div>

      <div style={styles.filtros}>
        <input style={styles.busca} placeholder="Buscar por nome..."
          value={busca} onChange={e => setBusca(e.target.value)} />
        <select style={styles.select} value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos os status</option>
          <option value="aguardando">Aguardando Respostas</option>
          <option value="esposo_respondeu">Esposo respondeu</option>
          <option value="esposa_respondeu">Esposa respondeu</option>
          <option value="completo">Completo</option>
          <option value="relatorio_gerado">Relatório Gerado</option>
        </select>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: 12 }}>Carregando dados...</p>
        </div>
      ) : casaisFiltrados.length === 0 ? (
        <div style={styles.vazio}>Nenhum casal encontrado com as opções atuais.</div>
      ) : (
        <div style={styles.lista}>
          {casaisFiltrados.map(casal => {
            const s = STATUS_LABEL[casal.status] || STATUS_LABEL.aguardando
            const podeGerar = casal.status === 'completo' || casal.status === 'relatorio_gerado'
            const links = getLinks(casal)
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
                    <div style={styles.btnGrupoRelatorio}>
                      <button onClick={() => router.push(`/dashboard/relatorio/${casal.id}/esposo`)}
                        style={styles.btnEsposo}>Rel. Esposo</button>
                      <button onClick={() => router.push(`/dashboard/relatorio/${casal.id}/esposa`)}
                        style={styles.btnEsposa}>Rel. Esposa</button>
                      <button onClick={() => router.push(`/dashboard/relatorio/${casal.id}/consultor`)}
                        style={styles.btnConsultor}>Consultor</button>
                    </div>
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
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  pageTitle: { fontSize: 24, color: '#0D1B3E', fontFamily: 'Georgia, serif', fontWeight: 'normal', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#888', margin: 0 },
  btnNovo: { padding: '12px 20px', background: '#0D1B3E', color: '#C9A84C', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(13,27,62,0.15)', transition: 'all 0.2s' },
  filtros: { display: 'flex', gap: 12, marginBottom: 24 },
  busca: { flex: 1, padding: '12px 16px', border: '1px solid #e0d8cc', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' },
  select: { padding: '12px 16px', border: '1px solid #e0d8cc', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', cursor: 'pointer' },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#888' },
  spinner: { width: 40, height: 40, border: '3px solid #e0d8cc', borderTopColor: '#0D1B3E', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  vazio: { textAlign: 'center', padding: 60, color: '#888', background: '#fff', borderRadius: 12, border: '1px solid #e8e0d4' },
  lista: { display: 'flex', flexDirection: 'column', gap: 14 },
  casalCard: { background: '#fff', border: '1px solid #e8e0d4', borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(13,27,62,0.02)' },
  casalInfo: { flex: 1, minWidth: 240 },
  casalNomes: { fontSize: 18, fontWeight: 'bold', color: '#0D1B3E', marginBottom: 8 },
  nomeEsposo: { color: '#1565C0' },
  amp: { color: '#C9A84C', margin: '0 6px' },
  nomeEsposa: { color: '#6A1B9A' },
  casalMeta: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  badge: { fontSize: 11, fontWeight: 'bold', padding: '3px 10px', borderRadius: 20 },
  badgePlano: { fontSize: 11, fontWeight: 'bold', padding: '3px 10px', borderRadius: 20, background: '#F8F4ED', color: '#8d6d1d', border: '1px solid #e8e0d4' },
  data: { fontSize: 11, color: '#AAA', marginLeft: 4 },
  casalAcoes: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  btnGrupoRelatorio: { display: 'flex', gap: 8 },
  btnEsposo: { padding: '9px 15px', background: '#1565C0', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 'bold', transition: 'opacity 0.2s' },
  btnEsposa: { padding: '9px 15px', background: '#6A1B9A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 'bold', transition: 'opacity 0.2s' },
  btnConsultor: { padding: '9px 15px', background: '#C9A84C', color: '#0D1B3E', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 'bold', transition: 'opacity 0.2s' },
  btnVerLinks: { padding: '9px 16px', background: '#FFF8E1', color: '#b78103', border: '1px solid #FFE082', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
  btnExcluir: { width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: '#C62828', border: '1px solid rgba(198,40,40,0.15)', borderRadius: '50%', cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' },
  
  // Modal styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13,27,62,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: '600px', padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #e8e0d4', margin: 20 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #f0ebe3', paddingBottom: 14 },
  modalTitle: { fontSize: 18, color: '#0D1B3E', fontFamily: 'Georgia, serif', fontWeight: 'normal' },
  modalFecharBtn: { background: 'transparent', border: 'none', fontSize: 18, color: '#888', cursor: 'pointer' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: 16 },
  formRow: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  formCol: { flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 6 },
  modalLabel: { fontSize: 12, fontWeight: 'bold', color: '#0D1B3E', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalInput: { padding: '12px 14px', border: '1px solid #e0d8cc', borderRadius: 8, fontSize: 14, outline: 'none', background: '#FAFAFA' },
  modalSelect: { padding: '12px 14px', border: '1px solid #e0d8cc', borderRadius: 8, fontSize: 14, outline: 'none', background: '#FAFAFA', cursor: 'pointer' },
  modalGrupo: { display: 'flex', flexDirection: 'column', gap: 6 },
  btnModalSalvar: { padding: '14px', background: '#0D1B3E', color: '#C9A84C', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(13,27,62,0.1)' },
  erroBox: { background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: 8, padding: 12, fontSize: 13, textAlign: 'center' },
  
  // Modal Links styles
  modalLinksContent: { display: 'flex', flexDirection: 'column', gap: 18 },
  modalLinksDesc: { fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 },
  linkGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  linkGroupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  linkSpouseEsposo: { fontSize: 13, fontWeight: 'bold', color: '#1565C0' },
  linkSpouseEsposa: { fontSize: 13, fontWeight: 'bold', color: '#6A1B9A' },
  linkContainer: { display: 'flex', gap: 10 },
  linkModalInput: { flex: 1, padding: '11px 14px', border: '1px solid #ffd54f', borderRadius: 8, background: '#FFF8E1', fontSize: 13, outline: 'none', color: '#7a5200', textOverflow: 'ellipsis', cursor: 'pointer' },
  btnLinkModalCopiar: { padding: '0 16px', background: '#0D1B3E', color: '#C9A84C', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' },
  btnModalConcluir: { padding: '12px', background: '#f5f5f5', color: '#333', border: '1px solid #e0d8cc', borderRadius: 8, fontSize: 14, fontWeight: 'bold', cursor: 'pointer', marginTop: 10, textAlign: 'center' },
}
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const STATUS_LABEL = {
  aguardando: { texto: 'AGUARDANDO', cor: '#E65100', bg: '#FFF8E1' },
  esposo_respondeu: { texto: 'AGUARDANDO', cor: '#E65100', bg: '#FFF8E1' },
  esposa_respondeu: { texto: 'AGUARDANDO', cor: '#E65100', bg: '#FFF8E1' },
  completo: { texto: 'RELATÓRIOS PRONTOS', cor: '#2E7D32', bg: '#E8F5E9' },
  relatorio_gerado: { texto: 'RELATÓRIOS PRONTOS', cor: '#2E7D32', bg: '#E8F5E9' },
}

export default function AfiliadoDashboard() {
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
      // 1. Obter Sessão
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const emailLogado = session.user.email.toLowerCase()

      // 2. Obter perfil do profissional da tabela casais
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

      // 3. Obter casais cadastrados por este afiliado
      const { data: casaisData, error: errorCasais } = await supabase
        .from('casais')
        .select('*')
        .or(`plano.ilike.relatorio:${emailLogado},plano.ilike.devolutiva:${emailLogado}`)
        .order('created_at', { ascending: false })

      if (!errorCasais && casaisData) {
        setCasais(casaisData)

        // Carregar respostas para verificar preenchimento dos checkboxes
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

    // Associar casal ao criador
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

      // Recarregar lista
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
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#0D1B3E', marginTop: 12 }}>Carregando seu painel...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Painel do Profissional</h2>
          <p style={styles.pageSubtitle}>Seja bem-vindo, <strong>{perfil.nome}</strong> ({perfil.papel}). Cadastre casais e acompanhe respostas.</p>
        </div>
        <button onClick={() => {
          setModalModo('criar')
          setLinksGerados(null)
          setModalAberto(true)
        }} style={styles.btnNovo}>
          + Novo Casal
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Seu Saldo de Relatórios</span>
          <span style={{ ...styles.statVal, color: perfil.saldo > 0 ? '#2E7D32' : '#C62828' }}>
            {perfil.saldo} créditos
          </span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Casais Cadastrados</span>
          <span style={{ ...styles.statVal, color: '#0D1B3E' }}>
            {casais.length} casais
          </span>
        </div>
      </div>

      {/* Couples Listing */}
      <div style={styles.listCard}>
        <h3 style={styles.listTitle}>Meus Casais</h3>
        
        {casais.length === 0 ? (
          <div style={styles.vazio}>Nenhum casal cadastrado por você ainda.</div>
        ) : (
          <div style={styles.listGrid}>
            {casais.map(casal => {
              const s = STATUS_LABEL[casal.status] || STATUS_LABEL.aguardando
              
              const respEsposo = respostas.find(r => r.casal_id === casal.id && r.conjuge === 'esposo')
              const respEsposa = respostas.find(r => r.casal_id === casal.id && r.conjuge === 'esposa')

              const temEsposo = !!respEsposo
              const temEsposa = !!respEsposa
              const pronto = temEsposo && temEsposa

              return (
                <div key={casal.id} style={styles.casalCard}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h4 style={styles.cardNomes}>{casal.nome_esposo} & {casal.nome_esposa}</h4>
                      <p style={styles.cardMeta}>Início: {formatarData(casal.created_at)}</p>
                    </div>
                    <span style={{ ...styles.badge, color: s.cor, background: s.bg }}>{s.texto}</span>
                  </div>

                  <div style={styles.checkRow}>
                    <div style={styles.checkItem}>
                      <span style={temEsposo ? styles.checkOn : styles.checkOff}>✓</span>
                      <span>Esposo</span>
                    </div>
                    <div style={styles.checkItem}>
                      <span style={temEsposa ? styles.checkOn : styles.checkOff}>✓</span>
                      <span>Esposa</span>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button 
                      onClick={() => {
                        setModalCasal(casal)
                        setModalModo('links')
                        setModalAberto(true)
                      }}
                      style={styles.btnActionSec}
                    >
                      🔗 Links
                    </button>
                    {pronto ? (
                      <button 
                        onClick={() => router.push(`/relatorio-final?id=${casal.id}`)}
                        style={{
                          ...styles.btnActionPrim,
                          opacity: perfil.saldo <= 0 && casal.status !== 'relatorio_gerado' ? 0.5 : 1
                        }}
                        disabled={perfil.saldo <= 0 && casal.status !== 'relatorio_gerado'}
                        title={perfil.saldo <= 0 && casal.status !== 'relatorio_gerado' ? "Saldo esgotado" : "Ver Relatórios"}
                      >
                        📊 Relatório
                      </button>
                    ) : (
                      <span style={styles.spanPendente}>Aguardando Respostas</span>
                    )}
                    <button 
                      onClick={() => handleExcluirCasal(casal.id)}
                      style={styles.btnActionDel}
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
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {modalModo === 'criar' ? 'Cadastrar Casal' : 'Compartilhar Questionários'}
              </h3>
              <button onClick={() => setModalAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>

            {modalModo === 'criar' && !linksGerados && (
              <form onSubmit={handleCriarCasal} style={styles.modalForm}>
                <div style={styles.modalGrupo}>
                  <label style={styles.modalLabel}>Nome do Esposo</label>
                  <input style={styles.modalInput} value={nomeEsposo} onChange={e => setNomeEsposo(e.target.value)} placeholder="Nome dele" required />
                </div>
                <div style={styles.modalGrupo}>
                  <label style={styles.modalLabel}>E-mail do Esposo (Opcional)</label>
                  <input style={styles.modalInput} type="email" value={emailEsposo} onChange={e => setEmailEsposo(e.target.value)} placeholder="Email dele" />
                </div>
                <div style={styles.modalGrupo}>
                  <label style={styles.modalLabel}>Nome da Esposa</label>
                  <input style={styles.modalInput} value={nomeEsposa} onChange={e => setNomeEsposa(e.target.value)} placeholder="Nome dela" required />
                </div>
                <div style={styles.modalGrupo}>
                  <label style={styles.modalLabel}>E-mail da Esposa (Opcional)</label>
                  <input style={styles.modalInput} type="email" value={emailEsposa} onChange={e => setEmailEsposa(e.target.value)} placeholder="Email dela" />
                </div>
                <div style={styles.modalGrupo}>
                  <label style={styles.modalLabel}>Tipo de Plano</label>
                  <select style={styles.modalSelect} value={tipoPlano} onChange={e => setTipoPlano(e.target.value)}>
                    <option value="relatorio">Relatório Simples</option>
                    <option value="devolutiva">Relatório + Devolutiva</option>
                  </select>
                </div>

                {erroModal && <p style={styles.erroText}>{erroModal}</p>}

                <button type="submit" disabled={saving} style={styles.btnSalvar}>
                  {saving ? 'Cadastrando...' : 'Cadastrar Casal'}
                </button>
              </form>
            )}

            {(linksGerados || modalModo === 'links') && (
              <div style={styles.linksBox}>
                <p style={{ fontSize: '13.5px', color: '#666', marginBottom: 16 }}>
                  Copie os links abaixo e envie para cada cônjuge responder individualmente:
                </p>
                
                <div style={styles.linkRow}>
                  <strong>Esposo ({linksGerados ? linksGerados.nomeEsposo : modalCasal?.nome_esposo}):</strong>
                  <div style={styles.copyContainer}>
                    <input style={styles.linkInput} readOnly value={linksGerados ? linksGerados.esposo : linksCasal.esposo} />
                    <button onClick={() => copiarLink(linksGerados ? linksGerados.esposo : linksCasal.esposo, 'Link do Esposo')} style={styles.btnCopiar}>Copiar</button>
                  </div>
                </div>

                <div style={styles.linkRow}>
                  <strong>Esposa ({linksGerados ? linksGerados.nomeEsposa : modalCasal?.nome_esposa}):</strong>
                  <div style={styles.copyContainer}>
                    <input style={styles.linkInput} readOnly value={linksGerados ? linksGerados.esposa : linksCasal.esposa} />
                    <button onClick={() => copiarLink(linksGerados ? linksGerados.esposa : linksCasal.esposa, 'Link da Esposa')} style={styles.btnCopiar}>Copiar</button>
                  </div>
                </div>

                <button onClick={() => setModalAberto(false)} style={styles.btnFinalizar}>
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

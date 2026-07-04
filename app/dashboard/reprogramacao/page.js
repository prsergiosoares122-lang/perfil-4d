'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { calcularPercentuais } from '@/lib/perguntas'
import { gerarGuia90Dias, gerarImpressaoGuiaHTML } from '@/lib/reprogramacao'

export default function ReprogramacaoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <p style={{ color: '#0D1B3E', fontSize: 16 }}>Carregando módulo de reprogramação...</p>
      </div>
    }>
      <ReprogramacaoContent />
    </Suspense>
  )
}

function ReprogramacaoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const casalIdParam = searchParams.get('id')

  const [casal, setCasal] = useState(null)
  const [respostas, setRespostas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  // Abas de Cônjuges: 'esposo' | 'esposa'
  const [abaAtiva, setAbaAtiva] = useState('esposo')
  
  // Controle de expansão das fases (Fase 1, Fase 2, Fase 3)
  const [faseExpandidda, setFaseExpandida] = useState({ 1: true, 2: false, 3: false })

  // Estados dos guias gerados
  const [guiaEsposo, setGuiaEsposo] = useState(null)
  const [guiaEsposa, setGuiaEsposa] = useState(null)

  // Dias concluídos (checklist local)
  const [concluidosMap, setConcluidosMap] = useState({ esposo: [], esposa: [] })

  // Controle do modal de detalhes do dia
  const [diaSelecionado, setDiaSelecionado] = useState(null)

  useEffect(() => {
    verificarAuth()
    if (casalIdParam) {
      carregarDados(casalIdParam)
    } else {
      setErro('Nenhum ID de casal informado na URL.')
      setLoading(false)
    }
  }, [casalIdParam])

  async function verificarAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')
  }

  async function carregarDados(id) {
    setLoading(true)
    setErro('')
    try {
      // 1. Carregar Casal
      const { data: casalData, error: errorCasal } = await supabase
        .from('casais')
        .select('*')
        .eq('id', id)
        .single()
      
      if (errorCasal || !casalData) throw new Error('Casal não encontrado.')
      setCasal(casalData)

      // 2. Carregar Respostas
      const { data: respostasData, error: errorRespostas } = await supabase
        .from('respostas')
        .select('*')
        .eq('casal_id', id)

      if (errorRespostas) throw errorRespostas
      setRespostas(respostasData)

      const respEsposo = respostasData.find(r => r.conjuge === 'esposo')
      const respEsposa = respostasData.find(r => r.conjuge === 'esposa')

      if (!respEsposo || !respEsposa) {
        throw new Error('Ainda não foram respondidos os dois questionários obrigatórios para gerar a reprogramação comportamental.')
      }

      // 3. Calcular Scores e Gerar os Guias
      const scoresEsposo = calcularPercentuais(respEsposo, 'esposo')
      const scoresEsposa = calcularPercentuais(respEsposa, 'esposa')

      const gEsposo = gerarGuia90Dias(casalData.nome_esposo, 'esposo', casalData.nome_esposa, scoresEsposo)
      const gEsposa = gerarGuia90Dias(casalData.nome_esposa, 'esposa', casalData.nome_esposo, scoresEsposa)

      setGuiaEsposo(gEsposo)
      setGuiaEsposa(gEsposa)

      // 4. Carregar dias concluídos do localStorage
      const savedEsposo = localStorage.getItem(`perfil4d_reprog_${id}_esposo`)
      const savedEsposa = localStorage.getItem(`perfil4d_reprog_${id}_esposa`)
      
      setConcluidosMap({
        esposo: savedEsposo ? JSON.parse(savedEsposo) : [],
        esposa: savedEsposa ? JSON.parse(savedEsposa) : []
      })

    } catch (err) {
      console.error(err)
      setErro(err.message || 'Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  const toggleFase = (num) => {
    setFaseExpandida(prev => ({ ...prev, [num]: !prev[num] }))
  }

  const handleToggleDia = (conjugeKey, dia, e) => {
    if (e) e.stopPropagation()
    setConcluidosMap(prev => {
      const lista = prev[conjugeKey] || []
      const novaLista = lista.includes(dia)
        ? lista.filter(d => d !== dia)
        : [...lista, dia]
      localStorage.setItem(`perfil4d_reprog_${casalIdParam}_${conjugeKey}`, JSON.stringify(novaLista))
      return { ...prev, [conjugeKey]: novaLista }
    })
  }

  const handleImprimir = (conjugeKey) => {
    const dadosGuia = conjugeKey === 'esposo' ? guiaEsposo : guiaEsposa
    if (!dadosGuia) return

    const htmlConteudo = gerarImpressaoGuiaHTML(dadosGuia)

    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.width = '0px'
    iframe.style.height = '0px'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(htmlConteudo)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)
    }, 500)
  }

  if (erro) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <h2 style={styles.errorTitle}>Guia Indisponível</h2>
          <p style={styles.errorDesc}>{erro}</p>
          <button onClick={() => router.push('/dashboard')} style={styles.btnVoltar}>
            Voltar ao Painel
          </button>
        </div>
      </div>
    )
  }

  if (loading || !casal) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#0D1B3E', marginTop: 20 }}>Carregando dados da reprogramação...</p>
      </div>
    )
  }

  const guiaAtivo = abaAtiva === 'esposo' ? guiaEsposo : guiaEsposa
  const concluidosAtivos = concluidosMap[abaAtiva] || []
  const porcentagemProgresso = Math.round((concluidosAtivos.length / 90) * 100)

  // Separar dias da aba ativa por Fase
  const diasFase1 = guiaAtivo?.dias.slice(0, 30) || []
  const diasFase2 = guiaAtivo?.dias.slice(30, 60) || []
  const diasFase3 = guiaAtivo?.dias.slice(60, 90) || []

  const obterUrlPdf = (nomeCompleto) => {
    if (!nomeCompleto) return '#'
    const primeiroNome = nomeCompleto.trim().split(' ')[0]
    const nomeLimpo = primeiroNome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
    return `/Guia_90dias_${nomeLimpo}.pdf`
  }

  return (
    <div style={styles.container}>
      {/* Top Navigation / Breadcrumbs */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Reprogramação Comportamental</h2>
          <p style={styles.pageSubtitle}>
            Cronograma de 90 dias personalizado para <strong>{casal.nome_esposo}</strong> & <strong>{casal.nome_esposa}</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a 
            href={obterUrlPdf(casal.nome_esposo)} 
            download={`Guia_90dias_${casal.nome_esposo.trim().split(' ')[0].toUpperCase()}.pdf`} 
            style={styles.btnDownloadPdf}
          >
            📥 Baixar Reprogramação (Esposo)
          </a>
          <a 
            href={obterUrlPdf(casal.nome_esposa)} 
            download={`Guia_90dias_${casal.nome_esposa.trim().split(' ')[0].toUpperCase()}.pdf`} 
            style={styles.btnDownloadPdf}
          >
            📥 Baixar Reprogramação (Esposa)
          </a>
          <button onClick={() => router.push('/dashboard')} style={styles.btnNavVoltar}>
            ← Painel de Casais
          </button>
        </div>
      </div>

      {/* Tabs para Selecionar o Cônjuge */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setAbaAtiva('esposo')}
          style={{ ...styles.tabBtn, ...(abaAtiva === 'esposo' ? styles.tabBtnActiveEsposo : {}) }}
        >
          🙋‍♂️ Guia do Esposo ({casal.nome_esposo})
        </button>
        <button 
          onClick={() => setAbaAtiva('esposa')}
          style={{ ...styles.tabBtn, ...(abaAtiva === 'esposa' ? styles.tabBtnActiveEsposa : {}) }}
        >
          🙋‍♀️ Guia da Esposa ({casal.nome_esposa})
        </button>
      </div>

      {/* Resumo de Ajuste e Progresso do Cônjuge Selecionado */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCol}>
            <h4 style={styles.summarySectionTitle}>Focos de Trabalho do Perfil</h4>
            <div style={styles.focoItems}>
              <div style={styles.focoItem}>
                <span style={styles.focoDotRed}>•</span>
                <strong>Ajuste Comportamental:</strong> {guiaAtivo?.menorComportamento} ({guiaAtivo?.scoreComportamento}%)
              </div>
              <div style={styles.focoItem}>
                <span style={styles.focoDotPurple}>•</span>
                <strong>Linguagem Limitante:</strong> {guiaAtivo?.menorLinguagem} ({guiaAtivo?.scoreLinguagem}%)
              </div>
            </div>
          </div>
          <div style={styles.summaryCol}>
            <div style={styles.progressHeader}>
              <h4 style={styles.summarySectionTitle}>Progresso do Programa</h4>
              <span style={styles.progressCounter}>{concluidosAtivos.length} / 90 dias ({porcentagemProgresso}%)</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={{ ...styles.progressBarVal, width: `${porcentagemProgresso}%`, background: abaAtiva === 'esposo' ? '#1565C0' : '#6A1B9A' }} />
            </div>
          </div>
          <div style={{ ...styles.summaryCol, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button onClick={() => handleImprimir(abaAtiva)} style={styles.btnPrint}>
              🖨️ Imprimir Guia Completo
            </button>
          </div>
        </div>
      </div>

      {/* Fases do Cronograma */}
      <div style={styles.fasesContainer}>
        {/* Fase 1: Consciência */}
        <div style={styles.faseCard}>
          <div onClick={() => toggleFase(1)} style={styles.faseHeader}>
            <div>
              <span style={styles.faseBadge}>DIAS 1-30</span>
              <h3 style={styles.faseTitle}>Fase 1: Consciência</h3>
              <p style={styles.faseDesc}>Foco em auto-observação, identificação de gatilhos automáticos e quebras de reatividades iniciais.</p>
            </div>
            <span style={styles.chevronIcon}>{faseExpandidda[1] ? '▲' : '▼'}</span>
          </div>
          {faseExpandidda[1] && (
            <div style={styles.daysGrid}>
              {diasFase1.map(d => {
                const isConcluido = concluidosAtivos.includes(d.dia)
                return (
                  <div 
                    key={d.dia} 
                    onClick={() => setDiaSelecionado(d)}
                    style={{ ...styles.dayItem, ...(isConcluido ? styles.dayItemCompleted : {}) }}
                  >
                    <div style={styles.dayTopRow}>
                      <span style={{ ...styles.dayBadge, background: isConcluido ? '#E8F5E9' : '#E0F7FA', color: isConcluido ? '#2E7D32' : '#006064' }}>
                        Dia {d.dia}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={isConcluido}
                        onChange={(e) => handleToggleDia(abaAtiva, d.dia, e)}
                        onClick={(e) => e.stopPropagation()}
                        style={styles.dayCheck}
                      />
                    </div>
                    <h5 style={styles.dayTitleText}>{d.tema}</h5>
                    <span style={styles.dayFocoLabel}>{d.focoDetalhe}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Fase 2: Ajuste */}
        <div style={styles.faseCard}>
          <div onClick={() => toggleFase(2)} style={styles.faseHeader}>
            <div>
              <span style={styles.faseBadge}>DIAS 31-60</span>
              <h3 style={styles.faseTitle}>Fase 2: Ajuste</h3>
              <p style={styles.faseDesc}>Foco em práticas deliberadas, introdução de novas formas de comunicação e ativação de conexões.</p>
            </div>
            <span style={styles.chevronIcon}>{faseExpandidda[2] ? '▲' : '▼'}</span>
          </div>
          {faseExpandidda[2] && (
            <div style={styles.daysGrid}>
              {diasFase2.map(d => {
                const isConcluido = concluidosAtivos.includes(d.dia)
                return (
                  <div 
                    key={d.dia} 
                    onClick={() => setDiaSelecionado(d)}
                    style={{ ...styles.dayItem, ...(isConcluido ? styles.dayItemCompleted : {}) }}
                  >
                    <div style={styles.dayTopRow}>
                      <span style={{ ...styles.dayBadge, background: isConcluido ? '#E8F5E9' : '#FFF3E0', color: isConcluido ? '#2E7D32' : '#E65100' }}>
                        Dia {d.dia}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={isConcluido}
                        onChange={(e) => handleToggleDia(abaAtiva, d.dia, e)}
                        onClick={(e) => e.stopPropagation()}
                        style={styles.dayCheck}
                      />
                    </div>
                    <h5 style={styles.dayTitleText}>{d.tema}</h5>
                    <span style={styles.dayFocoLabel}>{d.focoDetalhe}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Fase 3: Consolidação */}
        <div style={styles.faseCard}>
          <div onClick={() => toggleFase(3)} style={styles.faseHeader}>
            <div>
              <span style={styles.faseBadge}>DIAS 61-90</span>
              <h3 style={styles.faseTitle}>Fase 3: Consolidação</h3>
              <p style={styles.faseDesc}>Foco na estruturação de novos rituais duradouros de sintonia, finanças e divisão prática de responsabilidades.</p>
            </div>
            <span style={styles.chevronIcon}>{faseExpandidda[3] ? '▲' : '▼'}</span>
          </div>
          {faseExpandidda[3] && (
            <div style={styles.daysGrid}>
              {diasFase3.map(d => {
                const isConcluido = concluidosAtivos.includes(d.dia)
                return (
                  <div 
                    key={d.dia} 
                    onClick={() => setDiaSelecionado(d)}
                    style={{ ...styles.dayItem, ...(isConcluido ? styles.dayItemCompleted : {}) }}
                  >
                    <div style={styles.dayTopRow}>
                      <span style={{ ...styles.dayBadge, background: isConcluido ? '#E8F5E9' : '#F3E8FC', color: isConcluido ? '#2E7D32' : '#6A1B9A' }}>
                        Dia {d.dia}
                      </span>
                      <input 
                        type="checkbox" 
                        checked={isConcluido}
                        onChange={(e) => handleToggleDia(abaAtiva, d.dia, e)}
                        onClick={(e) => e.stopPropagation()}
                        style={styles.dayCheck}
                      />
                    </div>
                    <h5 style={styles.dayTitleText}>{d.tema}</h5>
                    <span style={styles.dayFocoLabel}>{d.focoDetalhe}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Detalhado do Dia */}
      {diaSelecionado && (
        <div style={styles.modalOverlay} onClick={() => setDiaSelecionado(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalFaseTag}>{diaSelecionado.fase}</span>
                <h3 style={styles.modalTitle}>Dia {diaSelecionado.dia} — {diaSelecionado.tema}</h3>
              </div>
              <button onClick={() => setDiaSelecionado(null)} style={styles.modalFecharBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.metaRow}>
                <strong>Foco de Trabalho:</strong> {diaSelecionado.foco} ({diaSelecionado.focoDetalhe})
              </div>

              <div style={styles.modalGrid}>
                <div style={styles.modalSecao}>
                  <h5 style={styles.secaoTitle}>Leitura do Dia</h5>
                  <p style={styles.secaoText}>{diaSelecionado.leitura}</p>
                </div>
                <div style={styles.modalSecao}>
                  <h5 style={styles.secaoTitle}>Diagnóstico Pessoal</h5>
                  <p style={styles.secaoText}>{diaSelecionado.diagnostico}</p>
                </div>
                <div style={styles.modalSecao}>
                  <h5 style={styles.secaoTitle}>Como está hoje</h5>
                  <p style={styles.secaoText}>{diaSelecionado.comoHoje}</p>
                </div>
                <div style={styles.modalSecao}>
                  <h5 style={styles.secaoTitle}>Visão de Futuro</h5>
                  <p style={styles.secaoText}>{diaSelecionado.visao}</p>
                </div>
              </div>

              <div style={styles.acoesBox}>
                <h5 style={styles.acoesTitle}>Ações de Hoje (Treinamento Deliberado)</h5>
                <ul style={styles.acoesList}>
                  {diaSelecionado.acoes.map((acao, index) => (
                    <li key={index} style={styles.acaoItem}>
                      <span style={styles.checkBullet}>☐</span>
                      <span>{acao}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={styles.reflexaoBox}>
                <strong>Pergunta de Reflexão:</strong>
                <p style={styles.reflexaoText}><em>"{diaSelecionado.reflexao}"</em></p>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                onClick={() => {
                  handleToggleDia(abaAtiva, diaSelecionado.dia)
                  setDiaSelecionado(null)
                }}
                style={{
                  ...styles.btnSalvarConclusao,
                  background: concluidosAtivos.includes(diaSelecionado.dia) ? '#C62828' : '#2E7D32'
                }}
              >
                {concluidosAtivos.includes(diaSelecionado.dia) 
                  ? 'Reabrir / Marcar como Pendente' 
                  : 'Concluir Práticas do Dia'}
              </button>
            </div>
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
    marginBottom: '30px',
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
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  btnNavVoltar: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid #0D1B3E',
    color: '#0D1B3E',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnDownloadPdf: {
    padding: '10px 18px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(13,27,62,0.1)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
  },
  tabContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '1px',
  },
  tabBtn: {
    padding: '14px 24px',
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabBtnActiveEsposo: {
    color: '#1565C0',
    borderBottomColor: '#1565C0',
  },
  tabBtnActiveEsposa: {
    color: '#6A1B9A',
    borderBottomColor: '#6A1B9A',
  },
  summaryCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '36px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
  },
  summaryGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: '1 1 250px',
  },
  summarySectionTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#4B5563',
    marginBottom: '10px',
    letterSpacing: '0.5px',
  },
  focoItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  focoItem: {
    fontSize: '13.5px',
    color: '#374151',
  },
  focoDotRed: { color: '#E53935', fontSize: '18px', marginRight: '6px', verticalAlign: 'middle' },
  focoDotPurple: { color: '#8E24AA', fontSize: '18px', marginRight: '6px', verticalAlign: 'middle' },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCounter: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#0D1B3E',
  },
  progressBarBg: {
    background: '#E5E7EB',
    height: '10px',
    borderRadius: '5px',
    overflow: 'hidden',
    marginTop: '6px',
  },
  progressBarVal: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.4s ease',
  },
  btnPrint: {
    padding: '12px 20px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(13,27,62,0.1)',
  },
  fasesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  faseCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)',
  },
  faseHeader: {
    padding: '24px',
    background: '#FAFAFA',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    borderBottom: '1px solid #F3F4F6',
  },
  faseBadge: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#4B5563',
    background: '#E5E7EB',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    display: 'inline-block',
    marginBottom: '6px',
  },
  faseTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    color: '#0D1B3E',
    margin: 0,
    fontWeight: 'normal',
  },
  faseDesc: {
    fontSize: '13px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  chevronIcon: {
    fontSize: '14px',
    color: '#9CA3AF',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '16px',
    padding: '24px',
    background: '#fff',
  },
  dayItem: {
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '110px',
    background: '#FAFAFA',
  },
  dayItemCompleted: {
    borderColor: '#C8E6C9',
    background: '#F1F8E9',
  },
  dayTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  dayBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  dayCheck: {
    cursor: 'pointer',
    width: '16px',
    height: '16px',
  },
  dayTitleText: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    margin: '0 0 6px 0',
    lineHeight: '1.4',
  },
  dayFocoLabel: {
    fontSize: '11px',
    color: '#6B7280',
  },
  errorContainer: {
    minHeight: '100vh',
    background: '#F8F9FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  errorCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '440px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  },
  errorTitle: {
    fontFamily: 'Georgia, serif',
    color: '#C62828',
    fontSize: '22px',
    marginBottom: '16px',
  },
  errorDesc: {
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  btnVoltar: {
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
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
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, right: 0, bottom: 0, left: 0,
    background: 'rgba(13,27,62,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalCard: {
    background: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '24px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: '#FAFAFA',
  },
  modalFaseTag: {
    fontSize: '10px',
    fontWeight: 'bold',
    background: '#E5E7EB',
    color: '#4B5563',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-block',
    marginBottom: '8px',
  },
  modalFecharBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    color: '#9CA3AF',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  metaRow: {
    fontSize: '13px',
    color: '#4B5563',
    marginBottom: '20px',
    borderBottom: '1px dashed #E5E7EB',
    paddingBottom: '10px',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  modalSecao: {
    background: '#FAFAFA',
    border: '1px solid #F3F4F6',
    borderRadius: '8px',
    padding: '16px',
  },
  secaoTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#6B7280',
    marginBottom: '6px',
    letterSpacing: '0.5px',
  },
  secaoText: {
    fontSize: '13.5px',
    color: '#374151',
    lineHeight: '1.6',
    margin: 0,
  },
  acoesBox: {
    background: '#FAFAFA',
    border: '1px dashed #D1D5DB',
    borderRadius: '8px',
    padding: '18px',
    marginBottom: '20px',
  },
  acoesTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0D1B3E',
    marginBottom: '12px',
    letterSpacing: '0.5px',
  },
  acoesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  acaoItem: {
    display: 'flex',
    gap: '10px',
    fontSize: '13.5px',
    color: '#374151',
    alignItems: 'flex-start',
    lineHeight: '1.5',
  },
  checkBullet: {
    fontFamily: 'monospace',
    color: '#9CA3AF',
    fontSize: '14px',
  },
  reflexaoBox: {
    background: 'rgba(201, 168, 76, 0.08)',
    borderLeft: '4px solid #C9A84C',
    padding: '16px',
    borderRadius: '0 8px 8px 0',
  },
  reflexaoText: {
    margin: '6px 0 0 0',
    fontSize: '14px',
    color: '#0D1B3E',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'flex-end',
    background: '#FAFAFA',
  },
  btnSalvarConclusao: {
    padding: '12px 24px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  }
}

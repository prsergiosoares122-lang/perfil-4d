'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { calcularPercentuais } from '../../lib/perguntas'
import { gerarRelatorioHTML, gerarRelatorioConsultor } from '../../lib/relatorio'
import { gerarGuia90Dias, gerarImpressaoGuiaHTML } from '../../lib/reprogramacao'

export default function RelatorioFinalPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <p style={{ color: '#C9A84C', fontSize: 16 }}>Carregando entregas...</p>
      </div>
    }>
      <RelatorioFinalContent />
    </Suspense>
  )
}

function RelatorioFinalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const casalIdParam = searchParams.get('id')

  const [casal, setCasal] = useState(null)
  const [pctEsposo, setPctEsposo] = useState(null)
  const [pctEsposa, setPctEsposa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingPrint, setLoadingPrint] = useState(false)
  const [erro, setErro] = useState('')
  const [tempoRestante, setTempoRestante] = useState(600) // 10 minutos (600s)

  useEffect(() => {
    verificarAuth()
    if (casalIdParam) {
      carregarDadosCasal(casalIdParam)
    } else {
      setErro('Nenhum ID de casal informado na URL.')
      setLoading(false)
    }
  }, [casalIdParam])

  // Inatividade e limpeza de dados
  useEffect(() => {
    if (!casal || !casalIdParam) return

    let timer
    let countdown

    const limparDadosInatividade = async () => {
      try {
        setLoading(true)
        // 1. Excluir respostas do casal
        await supabase.from('respostas').delete().eq('casal_id', casalIdParam)
        // 2. Excluir casal
        await supabase.from('casais').delete().eq('id', casalIdParam)

        alert("Sessão expirada por inatividade. Todos os dados temporários deste casal foram excluídos permanentemente por segurança e sigilo clínico.")
        window.dispatchEvent(new Event('stats-updated'))
        router.push('/dashboard')
      } catch (err) {
        console.error("Erro ao limpar dados por inatividade:", err)
      }
    }

    const resetTimer = () => {
      setTempoRestante(600)
      clearTimeout(timer)
      clearInterval(countdown)

      // Iniciar timer de 10 minutos
      timer = setTimeout(limparDadosInatividade, 600000)

      // Iniciar contagem regressiva
      countdown = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            clearInterval(countdown)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    const eventos = ['mousemove', 'keypress', 'click', 'touchstart', 'scroll']
    eventos.forEach(evt => window.addEventListener(evt, resetTimer))

    resetTimer()

    return () => {
      clearTimeout(timer)
      clearInterval(countdown)
      eventos.forEach(evt => window.removeEventListener(evt, resetTimer))
    }
  }, [casal, casalIdParam])

  async function verificarAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')
  }

  async function carregarDadosCasal(id) {
    setLoading(true)
    setErro('')
    try {
      const { data: casalData, error: errorCasal } = await supabase
        .from('casais')
        .select('*')
        .eq('id', id)
        .single()
      if (errorCasal || !casalData) throw new Error('Casal não encontrado no banco de dados.')

      const { data: respostasData, error: errorRespostas } = await supabase
        .from('respostas')
        .select('*')
        .eq('casal_id', id)

      if (errorRespostas) throw errorRespostas

      const respEsposo = respostasData.find(r => r.conjuge === 'esposo')
      const respEsposa = respostasData.find(r => r.conjuge === 'esposa')

      if (!respEsposo || !respEsposa) {
        throw new Error('Ainda não foram respondidos os dois questionários obrigatórios para gerar os relatórios.')
      }

      setCasal(casalData)
      setPctEsposo(calcularPercentuais(respEsposo, 'esposo'))
      setPctEsposa(calcularPercentuais(respEsposa, 'esposa'))
    } catch (err) {
      console.error(err)
      setErro(err.message || 'Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }

  const formatarTempo = (segundos) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownloadPDF = async (tipo) => {
    if (!casal || !pctEsposo || !pctEsposa) return
    setLoadingPrint(true)
    try {
      let htmlConteudo = ''
      if (tipo === 'esposo') {
        htmlConteudo = gerarRelatorioHTML(casal, pctEsposo, pctEsposa, 'esposo')
      } else if (tipo === 'esposa') {
        htmlConteudo = gerarRelatorioHTML(casal, pctEsposo, pctEsposa, 'esposa')
      } else {
        htmlConteudo = gerarRelatorioConsultor(casal, pctEsposo, pctEsposa)
      }

      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '800px'
      tempDiv.innerHTML = htmlConteudo
      document.body.appendChild(tempDiv)

      const { default: jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const doc = new jsPDF('p', 'pt', 'a4')
      await doc.html(tempDiv, {
        callback: function (pdf) {
          pdf.save(`Perfil4D_${tipo}_${casal.nome_esposo.split(' ')[0]}_${casal.nome_esposa.split(' ')[0]}.pdf`)
          document.body.removeChild(tempDiv)
          setLoadingPrint(false)
        },
        x: 0,
        y: 0,
        width: 595.28,
        windowWidth: 800
      })
    } catch (e) {
      console.error(e)
      alert('Houve um problema ao gerar o PDF. Você pode imprimir o arquivo e salvar como PDF nas opções nativas.')
      setLoadingPrint(false)
    }
  }

  const handleImprimir = (tipo) => {
    if (!casal || !pctEsposo || !pctEsposa) return

    let htmlConteudo = ''
    if (tipo === 'esposo') {
      htmlConteudo = gerarRelatorioHTML(casal, pctEsposo, pctEsposa, 'esposo')
    } else if (tipo === 'esposa') {
      htmlConteudo = gerarRelatorioHTML(casal, pctEsposo, pctEsposa, 'esposa')
    } else {
      htmlConteudo = gerarRelatorioConsultor(casal, pctEsposo, pctEsposa)
    }

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

  const handleImprimirReprog = (tipo) => {
    if (!casal || !pctEsposo || !pctEsposa) return
    const scores = tipo === 'esposo' ? pctEsposo : pctEsposa
    const nome = tipo === 'esposo' ? casal.nome_esposo : casal.nome_esposa
    const nomeParceiro = tipo === 'esposo' ? casal.nome_esposa : casal.nome_esposo

    const dadosGuia = gerarGuia90Dias(nome, tipo, nomeParceiro, scores)
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

  if (erro) return (
    <div style={styles.errorContainer}>
      <div style={styles.errorCard}>
        <h2 style={styles.errorTitle}>Relatório Indisponível</h2>
        <p style={styles.errorDesc}>{erro}</p>
        <button onClick={() => router.push('/dashboard')} style={styles.btnVoltar}>
          Voltar ao Painel
        </button>
      </div>
    </div>
  )

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={{ color: '#C9A84C', marginTop: 20 }}>Carregando dados do casal...</p>
    </div>
  )

  return (
    <div style={styles.wrapper}>
      {/* Banner de aviso de inatividade */}
      <div style={styles.bannerSeguranca}>
        <div style={styles.bannerText}>
          ⚠️ <strong>Sigilo Clínico Ativo:</strong> Por segurança, os dados deste casal serão excluídos automaticamente do banco de dados em caso de inatividade nesta página.
        </div>
        <div style={styles.bannerCountdown}>
          Tempo Restante: <span style={styles.countdownValue}>{formatarTempo(tempoRestante)}</span>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>PERFIL 4D</h1>
          <p style={styles.subTitle}>ENTREGA DE RELATÓRIOS COMPORTAMENTAIS</p>
          <div style={styles.divider}></div>
          <p style={styles.coupleNames}>{casal.nome_esposo} & {casal.nome_esposa}</p>
        </div>

        {loadingPrint && (
          <div style={styles.loadingPrintOverlay}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#C9A84C', marginTop: 14, fontWeight: 'bold' }}>Gerando arquivo PDF, por favor aguarde...</p>
          </div>
        )}

        <div style={styles.cardsGrid}>
          {/* Card 1: Consultor */}
          <div style={styles.reportCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardBadge}>Analista</span>
              <h2 style={styles.cardTitle}>Relatório Consultor</h2>
            </div>
            <p style={styles.cardDesc}>
              Visão clínica completa contendo a análise comparativa direta entre os cônjuges, índices de distância comportamental e os cruzamentos de todas as 12 áreas.
            </p>
            <div style={styles.cardActions}>
              <button onClick={() => handleDownloadPDF('consultor')} style={styles.btnDownload} disabled={loadingPrint}>
                Download PDF
              </button>
              <button onClick={() => handleImprimir('consultor')} style={styles.btnImprimir} disabled={loadingPrint}>
                Imprimir Relatório
              </button>
            </div>
          </div>

          {/* Card 2: Esposo */}
          <div style={styles.reportCard}>
            <div style={styles.cardHeader}>
              <span style={{ ...styles.cardBadge, background: 'rgba(21, 101, 192, 0.15)', color: '#90CAF9' }}>Cônjuge</span>
              <h2 style={styles.cardTitle}>Relatório do Esposo</h2>
            </div>
            <p style={styles.cardDesc}>
              Relatório personalizado com foco na autopercepção comportamental e perfil DISC do esposo ({casal.nome_esposo}), e as dinâmicas comparativas individuais do casal.
            </p>
            <div style={styles.cardActions}>
              <button onClick={() => handleDownloadPDF('esposo')} style={styles.btnDownload} disabled={loadingPrint}>
                Download PDF
              </button>
              <button onClick={() => handleImprimir('esposo')} style={styles.btnImprimir} disabled={loadingPrint}>
                Imprimir Relatório
              </button>
            </div>
          </div>

          {/* Card 3: Esposa */}
          <div style={styles.reportCard}>
            <div style={styles.cardHeader}>
              <span style={{ ...styles.cardBadge, background: 'rgba(106, 27, 154, 0.15)', color: '#E1BEE7' }}>Cônjuge</span>
              <h2 style={styles.cardTitle}>Relatório da Esposa</h2>
            </div>
            <p style={styles.cardDesc}>
              Relatório personalizado com foco na autopercepção comportamental e perfil DISC da esposa ({casal.nome_esposa}), e as dinâmicas comparativas individuais do casal.
            </p>
            <div style={styles.cardActions}>
              <button onClick={() => handleDownloadPDF('esposa')} style={styles.btnDownload} disabled={loadingPrint}>
                Download PDF
              </button>
              <button onClick={() => handleImprimir('esposa')} style={styles.btnImprimir} disabled={loadingPrint}>
                Imprimir Relatório
              </button>
            </div>
          </div>

          {/* Card 4: Reprogramação Comportamental */}
          <div style={styles.reportCard}>
            <div style={styles.cardHeader}>
              <span style={{ ...styles.cardBadge, background: 'rgba(201, 168, 76, 0.15)', color: '#C9A84C' }}>Planejamento Terapêutico</span>
              <h2 style={styles.cardTitle}>Reprogramação Comportamental</h2>
            </div>
            <p style={styles.cardDesc}>
              Programa de exercícios práticos, leituras de autoanálise e rituais de sintonia diários focado nas menores pontuações do casal.
            </p>
            <div style={styles.cardActions}>
              <button onClick={() => router.push(`/dashboard/reprogramacao?id=${casal.id}`)} style={styles.btnDownload}>
                Acessar Painel Interativo
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleImprimirReprog('esposo')} style={{ ...styles.btnImprimir, flex: 1, padding: '12px 6px', fontSize: '12.5px' }}>
                  Imprimir (Esposo)
                </button>
                <button onClick={() => handleImprimirReprog('esposa')} style={{ ...styles.btnImprimir, flex: 1, padding: '12px 6px', fontSize: '12.5px' }}>
                  Imprimir (Esposa)
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footerActions}>
          <button onClick={() => router.push('/dashboard')} style={styles.btnVoltarDashboard}>
            ← Voltar ao Painel Geral
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#0D1B3E',
    fontFamily: '"Outfit", "Inter", sans-serif',
    color: '#fff',
    paddingBottom: '80px',
  },
  bannerSeguranca: {
    background: '#FFF8E1',
    borderBottom: '2px solid #C9A84C',
    color: '#5c4308',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '13px',
  },
  bannerText: {
    flex: '1 1 300px',
  },
  bannerCountdown: {
    fontWeight: 'bold',
    background: '#FFF0C2',
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #FFE082',
    whiteSpace: 'nowrap',
  },
  countdownValue: {
    color: '#C62828',
    fontFamily: 'monospace',
    fontSize: '15px',
  },
  container: {
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  mainTitle: {
    fontFamily: 'Georgia, serif',
    color: '#C9A84C',
    fontSize: '44px',
    letterSpacing: '6px',
    margin: '0 0 8px 0',
    fontWeight: 'normal',
  },
  subTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '3px',
    margin: '0 0 24px 0',
  },
  divider: {
    width: '80px',
    height: '2px',
    background: '#C9A84C',
    margin: '0 auto 20px',
  },
  coupleNames: {
    fontFamily: 'Georgia, serif',
    fontSize: '22px',
    color: '#fff',
    letterSpacing: '1px',
    margin: 0,
  },
  loadingPrintOverlay: {
    background: 'rgba(13, 27, 62, 0.9)',
    border: '1px solid rgba(201, 168, 76, 0.3)',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    marginBottom: '32px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginBottom: '50px',
  },
  reportCard: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    cursor: 'default',
  },
  cardHeader: {
    marginBottom: '16px',
  },
  cardBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: '4px',
    background: 'rgba(201, 168, 76, 0.15)',
    color: '#C9A84C',
    letterSpacing: '1px',
    marginBottom: '10px',
  },
  cardTitle: {
    fontFamily: 'Georgia, serif',
    color: '#C9A84C',
    fontSize: '22px',
    margin: 0,
    fontWeight: 'normal',
  },
  cardDesc: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: '1.6',
    marginBottom: '28px',
    flexGrow: 1,
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  btnDownload: {
    background: '#C9A84C',
    color: '#0D1B3E',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  btnImprimir: {
    background: 'transparent',
    color: '#C9A84C',
    border: '1px solid #C9A84C',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  footerActions: {
    textAlign: 'center',
  },
  btnVoltarDashboard: {
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '10px 20px',
    transition: 'color 0.2s ease',
  },
  errorContainer: {
    minHeight: '100vh',
    background: '#0D1B3E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  errorCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '40px 32px',
    maxWidth: '440px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
  errorTitle: {
    fontFamily: 'Georgia, serif',
    color: '#E53935',
    fontSize: '22px',
    marginBottom: '16px',
    fontWeight: 'normal',
  },
  errorDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    lineHeight: '1.7',
    marginBottom: '28px',
  },
  btnVoltar: {
    background: '#C9A84C',
    color: '#0D1B3E',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loadingContainer: {
    minHeight: '100vh',
    background: '#0D1B3E',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(201, 168, 76, 0.2)',
    borderTopColor: '#C9A84C',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
}

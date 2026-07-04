'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'
import { decrementarSaldoRelatorio } from '../../../../../lib/afiliados'
import { calcularPercentuais } from '../../../../../lib/perguntas'
import { gerarRelatorioHTML, gerarRelatorioConsultor } from '../../../../../lib/relatorio'

export default function RelatorioPage() {
  const router = useRouter()
  const params = useParams()
  const { id, tipo } = params
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [casal, setCasal] = useState(null)
  const [pctEsposo, setPctEsposo] = useState(null)
  const [pctEsposa, setPctEsposa] = useState(null)
  const [conjugeAtivo, setConjugeAtivo] = useState(tipo === 'esposa' ? 'esposa' : 'esposo')
  const [loadingPrint, setLoadingPrint] = useState(false)

  useEffect(() => { carregarRelatorio() }, [id, tipo])

  async function carregarRelatorio() {
    try {
      // Verificar auth
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      let casalData = casal
      let pEsposo = pctEsposo
      let pEsposa = pctEsposa

      if (!casalData || !pEsposo || !pEsposa) {
        // Buscar casal
        const { data: cData, error: e1 } = await supabase
          .from('casais').select('*').eq('id', id).single()
        if (e1) throw new Error('Casal não encontrado')
        casalData = cData
        setCasal(cData)

        // Buscar respostas
        const { data: respostas, error: e2 } = await supabase
          .from('respostas').select('*').eq('casal_id', id)
        if (e2) throw new Error('Respostas não encontradas')

        const respostasEsposo = respostas.find(r => r.conjuge === 'esposo')
        const respostasEsposa = respostas.find(r => r.conjuge === 'esposa')

        if (!respostasEsposo || !respostasEsposa) {
          setErro('Ainda não há respostas completas dos dois cônjuges.')
          setLoading(false)
          return
        }

        pEsposo = calcularPercentuais(respostasEsposo, 'esposo')
        pEsposa = calcularPercentuais(respostasEsposa, 'esposa')
        setPctEsposo(pEsposo)
        setPctEsposa(pEsposa)
      }

      setConjugeAtivo(tipo)

      let htmlGerado = ''
      if (tipo === 'esposo' || tipo === 'esposa') {
        htmlGerado = gerarRelatorioHTML(casalData, pEsposo, pEsposa, tipo)
      } else {
        // Consultor - relatório simples com os dois
        htmlGerado = gerarRelatorioConsultor(casalData, pEsposo, pEsposa)
      }

      // Debitar do saldo do profissional criador, se aplicável, antes de gerar
      await decrementarSaldoRelatorio(id)

      // Marcar como relatório gerado
      await supabase.from('casais').update({ status: 'relatorio_gerado' }).eq('id', id)

      setHtml(htmlGerado)
    } catch (err) {
      setErro(err.message || 'Erro ao gerar relatório.')
    }
    setLoading(false)
  }

  function handleTrocarConjuge(novoConjuge) {
    router.replace(`/dashboard/relatorio/${id}/${novoConjuge}`)
  }

  async function handleDownloadPDF() {
    if (!casal || !pctEsposo || !pctEsposa) return
    setLoadingPrint(true)
    try {
      let htmlConteudo = ''
      if (tipo === 'esposo' || tipo === 'esposa') {
        htmlConteudo = gerarRelatorioHTML(casal, pctEsposo, pctEsposa, tipo)
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
      const suffix = tipo === 'esposo' || tipo === 'esposa' ? tipo : 'consultor'
      const nomeC = suffix === 'esposo' ? casal.nome_esposo : casal.nome_esposa

      await doc.html(tempDiv, {
        callback: function (pdf) {
          pdf.save(`Perfil4D_${suffix}_${nomeC.split(' ')[0]}.pdf`)
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
      alert('Houve um problema ao gerar o PDF. Você pode usar as opções de impressão do navegador.')
      setLoadingPrint(false)
    }
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#F8F4ED',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#888',fontSize:16}}>Gerando relatório...</p>
    </div>
  )

  if (erro) return (
    <div style={{minHeight:'100vh',background:'#F8F4ED',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:10,padding:32,maxWidth:400,textAlign:'center'}}>
        <p style={{color:'#C62828',fontSize:16,marginBottom:16}}>{erro}</p>
        <button onClick={() => router.push('/dashboard')}
          style={{padding:'10px 20px',background:'#0D1B3E',color:'#C9A84C',border:'none',borderRadius:8,cursor:'pointer',fontSize:14}}>
          Voltar ao painel
        </button>
      </div>
    </div>
  )

  return (
    <div style={{fontFamily:'Arial,sans-serif'}}>
      <div style={{background:'#0D1B3E',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
        <button onClick={() => router.push('/dashboard')}
          style={{color:'rgba(255,255,255,0.6)',background:'transparent',border:'none',cursor:'pointer',fontSize:14}}>
          ← Voltar ao painel
        </button>
        <span style={{color:'#C9A84C',fontSize:13,fontWeight:'bold',textTransform:'uppercase',letterSpacing:1}}>
          Relatório — {tipo === 'esposo' ? 'Esposo' : tipo === 'esposa' ? 'Esposa' : 'Consultor'}
        </span>
        <button onClick={handleDownloadPDF} disabled={loadingPrint}
          style={{padding:'8px 16px',background:'#C9A84C',color:'#0D1B3E',border:'none',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:'bold'}}>
          {loadingPrint ? 'Gerando PDF...' : '↓ Exportar PDF'}
        </button>
      </div>


      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

const styles = {
  tabsContainer: {
    display: 'flex',
    background: '#1A2A4D',
    padding: '12px 20px',
    gap: '12px',
    borderBottom: '1px solid rgba(201, 168, 76, 0.2)',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tabButton: {
    padding: '10px 20px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontSize: '13.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabButtonActive: {
    background: '#C9A84C',
    color: '#0D1B3E',
    borderColor: '#C9A84C',
  }
}

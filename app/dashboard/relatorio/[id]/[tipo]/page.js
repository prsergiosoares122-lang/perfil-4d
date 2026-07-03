'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'
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

  useEffect(() => { carregarRelatorio() }, [])

  async function carregarRelatorio() {
    try {
      // Verificar auth
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      // Buscar casal
      const { data: casalData, error: e1 } = await supabase
        .from('casais').select('*').eq('id', id).single()
      if (e1) throw new Error('Casal não encontrado')
      setCasal(casalData)

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

      const pEsposo = calcularPercentuais(respostasEsposo, 'esposo')
      const pEsposa = calcularPercentuais(respostasEsposa, 'esposa')
      setPctEsposo(pEsposo)
      setPctEsposa(pEsposa)

      const inicial = tipo === 'esposa' ? 'esposa' : 'esposo'
      setConjugeAtivo(inicial)

      let htmlGerado = ''
      if (tipo === 'esposo' || tipo === 'esposa') {
        htmlGerado = gerarRelatorioHTML(casalData, pEsposo, pEsposa, inicial)
      } else {
        // Consultor - relatório simples com os dois
        htmlGerado = gerarRelatorioConsultor(casalData, pEsposo, pEsposa)
      }

      // Marcar como relatório gerado
      await supabase.from('casais').update({ status: 'relatorio_gerado' }).eq('id', id)

      setHtml(htmlGerado)
    } catch (err) {
      setErro(err.message || 'Erro ao gerar relatório.')
    }
    setLoading(false)
  }

  function handleTrocarConjuge(novoConjuge) {
    if (!casal || !pctEsposo || !pctEsposa) return
    setConjugeAtivo(novoConjuge)
    const htmlGerado = gerarRelatorioHTML(casal, pctEsposo, pctEsposa, novoConjuge)
    setHtml(htmlGerado)
    window.history.replaceState(null, '', `/dashboard/relatorio/${id}/${novoConjuge}`)
  }

  function baixarHTML() {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const suffix = tipo === 'esposo' || tipo === 'esposa' ? conjugeAtivo : 'consultor'
    a.download = `Perfil4D_${suffix}_${id.slice(0,8)}.html`
    a.click()
    URL.revokeObjectURL(url)
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
        <button onClick={baixarHTML}
          style={{padding:'8px 16px',background:'#C9A84C',color:'#0D1B3E',border:'none',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:'bold'}}>
          ↓ Baixar HTML
        </button>
      </div>

      {/* Tabs selector bar */}
      {(tipo === 'esposo' || tipo === 'esposa') && (
        <div style={styles.tabsContainer}>
          <button 
            onClick={() => handleTrocarConjuge('esposo')}
            style={{
              ...styles.tabButton,
              ...(conjugeAtivo === 'esposo' ? styles.tabButtonActive : {})
            }}
          >
            👨 Esposo: {casal?.nome_esposo}
          </button>
          <button 
            onClick={() => handleTrocarConjuge('esposa')}
            style={{
              ...styles.tabButton,
              ...(conjugeAtivo === 'esposa' ? styles.tabButtonActive : {})
            }}
          >
            👩 Esposa: {casal?.nome_esposa}
          </button>
        </div>
      )}

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

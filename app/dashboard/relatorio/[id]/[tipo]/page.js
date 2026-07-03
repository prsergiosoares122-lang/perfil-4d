'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '../../../../../lib/supabase'
import { calcularPercentuais } from '../../../../../lib/perguntas'
import { gerarRelatorioHTML } from '../../../../../lib/relatorio'

export default function RelatorioPage() {
  const router = useRouter()
  const params = useParams()
  const { id, tipo } = params
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => { carregarRelatorio() }, [])

  async function carregarRelatorio() {
    try {
      // Verificar auth
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      // Buscar casal
      const { data: casal, error: e1 } = await supabase
        .from('casais').select('*').eq('id', id).single()
      if (e1) throw new Error('Casal não encontrado')

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

      const pctEsposo = calcularPercentuais(respostasEsposo, 'esposo')
      const pctEsposa = calcularPercentuais(respostasEsposa, 'esposa')

      let htmlGerado = ''
      if (tipo === 'esposo') {
        htmlGerado = gerarRelatorioHTML(casal, pctEsposo, pctEsposa, 'esposo')
      } else if (tipo === 'esposa') {
        htmlGerado = gerarRelatorioHTML(casal, pctEsposo, pctEsposa, 'esposa')
      } else {
        // Consultor - relatório simples com os dois
        htmlGerado = gerarRelatorioConsultor(casal, pctEsposo, pctEsposa)
      }

      // Marcar como relatório gerado
      await supabase.from('casais').update({ status: 'relatorio_gerado' }).eq('id', id)

      setHtml(htmlGerado)
    } catch (err) {
      setErro(err.message || 'Erro ao gerar relatório.')
    }
    setLoading(false)
  }

  function baixarHTML() {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Perfil4D_${tipo}_${id.slice(0,8)}.html`
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
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

function gerarRelatorioConsultor(casal, pctEsposo, pctEsposa) {
  const { NOMES, BLOCOS } = require('../../../../../lib/perguntas')
  const data = new Date().toLocaleDateString('pt-BR')
  const todos = [...BLOCOS.bloco1, ...BLOCOS.bloco2]

  const barras = todos.map(c => `
    <div style="margin-bottom:20px;background:#fff;border-radius:8px;padding:18px;border:1px solid #e0d8cc">
      <div style="font-size:14px;font-weight:bold;color:#0D1B3E;margin-bottom:10px">${NOMES[c]}</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span style="font-size:12px;color:#666;width:70px">${casal.nome_esposo}</span>
        <div style="flex:1;background:#e8e0d4;border-radius:4px;height:22px;overflow:hidden">
          <div style="width:${pctEsposo[c]}%;height:100%;background:#1565C0;display:flex;align-items:center;padding-left:8px">
            <span style="font-size:11px;font-weight:bold;color:#fff">${pctEsposo[c]}%</span>
          </div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:12px;color:#666;width:70px">${casal.nome_esposa}</span>
        <div style="flex:1;background:#e8e0d4;border-radius:4px;height:22px;overflow:hidden">
          <div style="width:${pctEsposa[c]}%;height:100%;background:#6A1B9A;display:flex;align-items:center;padding-left:8px">
            <span style="font-size:11px;font-weight:bold;color:#fff">${pctEsposa[c]}%</span>
          </div>
        </div>
      </div>
      <div style="margin-top:8px;font-size:12px;color:#888">Distância: ${Math.abs(pctEsposo[c]-pctEsposa[c]).toFixed(0)} pontos</div>
    </div>`).join('')

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Perfil 4D — Consultor</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#F8F4ED}@media print{body{background:#fff}}</style>
  </head><body>
  <div style="max-width:800px;margin:0 auto;padding:0 0 60px">
  <div style="background:#0D1B3E;padding:50px 40px;text-align:center">
    <h1 style="font-family:Georgia,serif;color:#C9A84C;font-size:40px;letter-spacing:4px;margin-bottom:8px">PERFIL 4D</h1>
    <h2 style="color:#fff;font-size:18px;font-weight:300;margin-bottom:6px">Relatório Consultor</h2>
    <h3 style="color:rgba(255,255,255,0.6);font-size:14px;font-weight:300;letter-spacing:2px;text-transform:uppercase">${casal.nome_esposo} & ${casal.nome_esposa}</h3>
  </div>
  <div style="padding:20px 28px;background:#E8F5E9;border-left:4px solid #2E7D32;margin:0">
    <p style="font-size:13px;color:#1B5E20;line-height:1.7"><strong>Nota metodológica:</strong> Os resultados refletem autopercepção comportamental do momento atual. Não representam diagnóstico clínico. Comportamento é dinâmico. Recomenda-se reaplicar após 6 meses.</p>
  </div>
  <div style="padding:36px 40px">
    <div style="font-family:Georgia,serif;font-size:22px;color:#0D1B3E;margin-bottom:8px">Análise comparativa completa</div>
    <div style="display:flex;gap:16px;font-size:13px;color:#555;margin-bottom:24px">
      <span><span style="width:12px;height:12px;border-radius:50%;background:#1565C0;display:inline-block;margin-right:4px;vertical-align:middle"></span>${casal.nome_esposo}</span>
      <span><span style="width:12px;height:12px;border-radius:50%;background:#6A1B9A;display:inline-block;margin-right:4px;vertical-align:middle"></span>${casal.nome_esposa}</span>
    </div>
    ${barras}
  </div>
  <div style="background:#060f26;padding:24px;text-align:center">
    <p style="color:rgba(255,255,255,0.3);font-size:13px;line-height:1.8">Perfil 4D · Psicanalista Sérgio Soares · +55 21 97401-3287<br>© 2026 · Gerado em ${data}</p>
  </div>
  </div></body></html>`
}

'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PERGUNTAS, BLOCOS, NOMES } from '../../lib/perguntas'
import { supabase } from '../../lib/supabase'

const TODOS = [...BLOCOS.bloco1, ...BLOCOS.bloco2]

export default function Questionario() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F8F4ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <p style={{ color: '#888', fontSize: 16 }}>Carregando questionário...</p>
      </div>
    }>
      <QuestionarioContent />
    </Suspense>
  )
}

function QuestionarioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [etapa, setEtapa] = useState('perguntas') // perguntas | obrigado
  const [conjuge, setConjuge] = useState('')
  const [casalId, setCasalId] = useState('')
  const [respostas, setRespostas] = useState({})
  const [blocoAtual, setBlocoAtual] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erroAcesso, setErroAcesso] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [tentouAvancar, setTentouAvancar] = useState(false)
  const [isCompleto, setIsCompleto] = useState(false)

  const [perguntasState, setPerguntasState] = useState(PERGUNTAS)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem('perfil4d_perguntas_customizadas')
      if (custom) {
        try {
          setPerguntasState(JSON.parse(custom))
        } catch (e) {
          console.error("Erro ao carregar perguntas customizadas:", e)
        }
      }
    }
  }, [])

  const comportamentoAtual = TODOS[blocoAtual]
  const perguntasAtuais = perguntasState[comportamentoAtual] || []
  const totalBlocos = TODOS.length
  const progresso = Math.round((blocoAtual / totalBlocos) * 100)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setErroAcesso('Link de acesso inválido ou incompleto. Por favor, utilize o link correto enviado pelo psicanalista.')
      setLoading(false)
      return
    }

    try {
      const decoded = atob(token)
      const parts = decoded.split('-')
      const c = parts.pop()
      const id = parts.join('-')
      
      if (!id || (c !== 'esposo' && c !== 'esposa')) {
        throw new Error('Formato do token inválido.')
      }

      setCasalId(id)
      setConjuge(c)
      carregarCasalExistente(id, c)
    } catch (e) {
      console.error("Erro ao processar token:", e)
      setErroAcesso('Link de acesso inválido ou corrompido. Por favor, utilize o link correto enviado pelo psicanalista.')
      setLoading(false)
    }
  }, [searchParams])

  async function carregarCasalExistente(id, c) {
    setLoading(true)
    setErroAcesso('')
    try {
      const { data, error } = await supabase
        .from('casais')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error || !data) {
        throw new Error('Cadastro do casal não encontrado no sistema.')
      }

      // Restaurar respostas salvas temporariamente no localStorage para este cônjuge deste casal
      try {
        const savedRespostas = localStorage.getItem(`perfil4d_respostas_${id}_${c}`)
        if (savedRespostas) {
          setRespostas(JSON.parse(savedRespostas))
        }
        const savedBloco = localStorage.getItem(`perfil4d_bloco_${id}_${c}`)
        if (savedBloco) {
          setBlocoAtual(Number(savedBloco))
        }
      } catch (storageErr) {
        console.warn("Erro ao restaurar dados do localStorage:", storageErr)
      }
    } catch (err) {
      console.error("Erro ao carregar dados do casal:", err)
      setErroAcesso("Não foi possível carregar os dados do casal. Verifique se o link está correto ou se as políticas de segurança (RLS) do Supabase foram configuradas no SQL Editor.")
    } finally {
      setLoading(false)
    }
  }

  function responder(perguntaIdx, valor) {
    const novasRespostas = {
      ...respostas,
      [`${comportamentoAtual}_${perguntaIdx + 1}`]: valor
    }
    setRespostas(novasRespostas)
    
    // Persistir respostas localmente em tempo real
    try {
      if (casalId && conjuge) {
        localStorage.setItem(`perfil4d_respostas_${casalId}_${conjuge}`, JSON.stringify(novasRespostas))
      }
    } catch (storageErr) {
      console.warn("Erro ao salvar dados no localStorage:", storageErr)
    }
  }

  function blocoCompleto() {
    return perguntasAtuais.every((_, i) => respostas[`${comportamentoAtual}_${i + 1}`])
  }

  function obterNumeroGlobal(blocoIdx, perguntaIdx) {
    let acumulado = 0
    for (let k = 0; k < blocoIdx; k++) {
      const comp = TODOS[k]
      acumulado += (perguntasState[comp] || []).length
    }
    return acumulado + perguntaIdx + 1
  }

  function avancar() {
    if (!blocoCompleto()) {
      setTentouAvancar(true)
      setErroForm('Por favor, responda todas as perguntas destacadas em vermelho antes de avançar.')
      return
    }
    
    setErroForm('')
    setTentouAvancar(false)
    
    if (blocoAtual < totalBlocos - 1) {
      const proximo = blocoAtual + 1
      setBlocoAtual(proximo)
      
      // Persistir o bloco atual localmente
      try {
        if (casalId && conjuge) {
          localStorage.setItem(`perfil4d_bloco_${casalId}_${conjuge}`, proximo.toString())
        }
      } catch (storageErr) {
        console.warn("Erro ao salvar progresso no localStorage:", storageErr)
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      enviarRespostas()
    }
  }

  async function enviarRespostas() {
    setLoading(true)
    setErroForm('')
    try {
      const { error: errorRespostas } = await supabase.from('respostas').insert({
        casal_id: casalId,
        conjuge,
        ...respostas
      })
      if (errorRespostas) throw errorRespostas

      // Obter o status atual do casal para saber se completa o questionário
      const { data: casal, error: errorCasal } = await supabase
        .from('casais')
        .select('status')
        .eq('id', casalId)
        .single()

      if (errorCasal) throw errorCasal

      let novoStatus = 'aguardando'
      let completes = false
      if (conjuge === 'esposo') {
        completes = (casal.status === 'esposa_respondeu')
        novoStatus = completes ? 'completo' : 'esposo_respondeu'
      } else {
        completes = (casal.status === 'esposo_respondeu')
        novoStatus = completes ? 'completo' : 'esposa_respondeu'
      }

      setIsCompleto(completes)

      const { error: errorUpdate } = await supabase
        .from('casais')
        .update({ status: novoStatus })
        .eq('id', casalId)
      
      if (errorUpdate) throw errorUpdate

      // Limpar localStorage após o envio bem-sucedido
      try {
        if (casalId && conjuge) {
          localStorage.removeItem(`perfil4d_respostas_${casalId}_${conjuge}`)
          localStorage.removeItem(`perfil4d_bloco_${casalId}_${conjuge}`)
        }
      } catch (storageErr) {
        console.warn("Erro ao limpar dados do localStorage:", storageErr)
      }

      setEtapa('obrigado')
    } catch (err) {
      console.error("Erro ao enviar respostas:", err)
      setErroForm('Erro ao enviar respostas. Por favor, verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const otherConjuge = conjuge === 'esposo' ? 'esposa' : 'esposo'
  const otherToken = typeof window !== 'undefined' && casalId ? btoa(`${casalId}-${otherConjuge}`) : ''
  const shareLink = typeof window !== 'undefined' && otherToken
    ? `${window.location.origin}/questionario?token=${otherToken}`
    : ''

  function copiarLink() {
    navigator.clipboard.writeText(shareLink)
    alert('Link copiado para a área de transferência!')
  }

  const whatsappText = encodeURIComponent(`Olá! Acabei de responder à minha parte do Perfil 4D. Agora é a sua vez! Acesse o link para responder: ${shareLink}`)
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`

  if (erroAcesso) return (
    <div style={styles.container}>
      <div style={{ ...styles.card, marginTop: '40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', color: '#C62828', marginBottom: '16px', fontWeight: 'normal' }}>Acesso Inválido</h2>
        <p style={{ color: '#666', lineHeight: 1.8, marginBottom: '24px' }}>{erroAcesso}</p>
        <p style={{ color: '#999', fontSize: 13 }}>Se você é o psicanalista, certifique-se de gerar os links pelo painel.</p>
      </div>
    </div>
  )

  if (loading && etapa !== 'obrigado') return (
    <div style={styles.container}>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontSize: 16 }}>Carregando dados do questionário...</p>
      </div>
    </div>
  )

  if (etapa === 'obrigado') return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.tituloObrigado}>Questionário enviado!</h1>
          <p style={styles.textoObrigado}>Suas respostas foram recebidas com sucesso e com total segurança.</p>
          
          {!isCompleto ? (
            <div style={styles.shareBox}>
              <h3 style={styles.shareBoxTitle}>Falta apenas um passo!</h3>
              <p style={styles.shareBoxDesc}>Seu cônjuge precisa responder para liberar a geração do relatório completo.</p>
              
              <div style={styles.linkCopyContainer}>
                <input readOnly value={shareLink} style={styles.linkInput} onClick={copiarLink} />
                <button onClick={copiarLink} style={styles.btnCopiar}>Copiar Link</button>
              </div>

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={styles.btnWhatsapp}>
                Enviar pelo WhatsApp
              </a>
            </div>
          ) : (
            <div style={styles.completeBox}>
              <h3 style={styles.completeTitle}>Tudo pronto!</h3>
              <p style={styles.completeDesc}>Ambos os cônjuges responderam ao questionário. O psicanalista Sérgio Soares agora possui todos os dados para elaborar sua análise e relatórios.</p>
            </div>
          )}

          <p style={styles.footerNote}>O Perfil 4D é processado de forma sigilosa.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.titulo}>PERFIL 4D</h1>
        <div style={styles.progressoContainer}>
          <div style={styles.progressoBar}>
            <div style={{ ...styles.progressoFill, width: `${progresso}%` }}></div>
          </div>
          <span style={styles.progressoPorcentagem}>{progresso}%</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 8 }}>
          Etapa {blocoAtual + 1} de {totalBlocos}
        </p>
      </div>

      <div style={styles.card}>
        {perguntasAtuais.map((pergunta, i) => {
          const chave = `${comportamentoAtual}_${i + 1}`
          const valor = respostas[chave]
          const perguntaIncompleta = tentouAvancar && !valor
          return (
            <div key={i} style={{
              ...styles.perguntaCard,
              ...(perguntaIncompleta ? { borderColor: '#E53935', background: '#FFEBEE', padding: '24px 16px', borderRadius: 12, margin: '12px -16px' } : {})
            }}>
              <p style={styles.perguntaTexto}>{obterNumeroGlobal(blocoAtual, i)}. {pergunta}</p>
              <div style={styles.opcoesVerticais}>
                {[
                  { valor: 1, texto: '1 Nunca' },
                  { valor: 2, texto: '2 Raramente' },
                  { valor: 3, texto: '3 Às vezes' },
                  { valor: 4, texto: '4 Frequentemente' },
                  { valor: 5, texto: '5 Sempre' }
                ].map(opt => (
                  <button key={opt.valor} type="button"
                    onClick={() => responder(i, opt.valor)}
                    style={{
                      ...styles.btnOpcaoTexto,
                      ...(valor === opt.valor ? styles.btnOpcaoTextoAtivo : {})
                    }}>
                    {opt.texto}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {erroForm && <p style={styles.erro}>{erroForm}</p>}

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {blocoAtual > 0 && (
            <button onClick={() => { setBlocoAtual(b => b - 1); setErroForm(''); setTentouAvancar(false) }}
              style={styles.btnSecundario}>← Bloco Anterior</button>
          )}
          <button onClick={avancar} style={styles.btnPrimario} disabled={loading}>
            {loading ? 'Processando...' : blocoAtual === totalBlocos - 1 ? 'Finalizar e Enviar ✓' : 'Continuar →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#F8F4ED', fontFamily: '"Outfit", "Inter", sans-serif', paddingBottom: '60px' },
  header: { background: '#0D1B3E', padding: '40px 20px', textAlign: 'center', borderBottom: '3px solid #C9A84C' },
  titulo: { fontFamily: 'Georgia, serif', color: '#C9A84C', fontSize: 36, letterSpacing: 4, marginBottom: 8, fontWeight: 'normal' },
  subtitulo: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 300, letterSpacing: 1, textTransform: 'uppercase' },
  card: { maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: 16, padding: '36px 32px', marginTop: -24, boxShadow: '0 10px 30px rgba(13,27,62,0.08)', border: '1px solid #e8e0d4' },
  btnPrimario: { flex: 1, width: '100%', padding: '16px', background: '#0D1B3E', color: '#C9A84C', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-block', textAlign: 'center' },
  btnSecundario: { padding: '16px 24px', background: '#fff', color: '#0D1B3E', border: '1px solid #e0d8cc', borderRadius: 10, fontSize: 15, cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' },
  erro: { color: '#C62828', fontSize: 14, marginTop: 16, marginBottom: 0, fontWeight: 'bold', textAlign: 'center' },
  progressoContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', maxWidth: 400, margin: '14px auto 0' },
  progressoBar: { flex: 1, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
  progressoFill: { height: '100%', background: '#C9A84C', borderRadius: 3, transition: 'width 0.3s' },
  progressoPorcentagem: { color: '#C9A84C', fontSize: 13, fontWeight: 'bold' },
  perguntaCard: { padding: '24px 0', borderBottom: '1px solid #f0ebe3', transition: 'all 0.3s' },
  perguntaTexto: { fontSize: 16, color: '#2C3E50', lineHeight: 1.7, marginBottom: 16, fontWeight: '600' },
  opcoesVerticais: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 },
  btnOpcaoTexto: {
    width: '100%',
    padding: '14px 16px',
    background: '#FAF7F2',
    color: '#444',
    border: '1px solid #e0d8cc',
    borderRadius: '10px',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  btnOpcaoTextoAtivo: {
    background: '#0D1B3E',
    color: '#C9A84C',
    borderColor: '#0D1B3E',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(13,27,62,0.15)',
  },
  
  // Obrigado styles
  successIcon: { width: 80, height: 80, borderRadius: '50%', background: '#E8F5E9', color: '#2E7D32', fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontWeight: 'bold' },
  tituloObrigado: { fontFamily: 'Georgia, serif', color: '#0D1B3E', fontSize: 28, marginBottom: 12, fontWeight: 'normal' },
  textoObrigado: { color: '#666', fontSize: 15, lineHeight: 1.8, marginBottom: 32 },
  shareBox: { background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 12, padding: '24px', marginBottom: 32, textAlign: 'left' },
  shareBoxTitle: { color: '#b78103', fontSize: 16, fontWeight: 'bold', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 },
  shareBoxDesc: { color: '#5c4308', fontSize: 14, lineHeight: 1.6, marginBottom: 16 },
  linkCopyContainer: { display: 'flex', gap: 10, marginBottom: 12 },
  linkInput: { flex: 1, padding: '12px', border: '1px solid #ffd54f', borderRadius: 8, background: '#fff', fontSize: 13, outline: 'none', color: '#666', textOverflow: 'ellipsis', cursor: 'pointer' },
  btnCopiar: { padding: '0 16px', background: '#0D1B3E', color: '#C9A84C', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 'bold', transition: 'all 0.2s' },
  btnWhatsapp: { display: 'block', textClassName: 'center', padding: '14px', background: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: 8, fontSize: 14, fontWeight: 'bold', textAlign: 'center', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(37,211,102,0.2)' },
  completeBox: { background: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: 12, padding: '24px', marginBottom: 32, textAlign: 'left' },
  completeTitle: { color: '#2E7D32', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  completeDesc: { color: '#388E3C', fontSize: 14, lineHeight: 1.6 },
  footerNote: { color: '#999', fontSize: 12 },
}

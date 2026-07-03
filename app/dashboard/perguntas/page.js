'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PerguntasPage() {
  const router = useRouter()
  const [perguntas, setPerguntas] = useState([])
  const [loading, setLoading] = useState(true)
  const [avisoSucesso, setAvisoSucesso] = useState('')
  const [editando, setEditando] = useState(null) // { numero, texto }
  const [salvandoId, setSalvandoId] = useState(null)

  useEffect(() => {
    verificarAuth()
    carregarPerguntas()
  }, [])

  async function verificarAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')
  }

  async function carregarPerguntas() {
    setLoading(true)
    const { data, error } = await supabase
      .from('perguntas')
      .select('*')
      .order('numero', { ascending: true })
    if (!error && data) {
      setPerguntas(data)
    } else if (error) {
      console.error("Erro ao carregar perguntas:", error)
    }
    setLoading(false)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editando) return

    setSalvandoId(editando.numero)
    
    // Atualizar no Supabase
    const { error } = await supabase
      .from('perguntas')
      .update({ texto: editando.texto })
      .eq('numero', editando.numero)

    if (!error) {
      // Atualizar no estado local
      setPerguntas(prev => prev.map(q => {
        if (q.numero === editando.numero) {
          return { ...q, texto: editando.texto }
        }
        return q
      }))
      dispararSucesso(`Pergunta Q${editando.numero} atualizada com sucesso no banco de dados!`)
      setEditando(null)
    } else {
      alert("Erro ao salvar pergunta: " + error.message)
    }
    setSalvandoId(null)
  }

  const dispararSucesso = (msg) => {
    setAvisoSucesso(msg)
    setTimeout(() => {
      setAvisoSucesso('')
    }, 4000)
  }

  const categorias = [
    { key: 'comunicativo', nome: 'Comunicativo' },
    { key: 'socializante', nome: 'Socializante' },
    { key: 'analitico', nome: 'Analítico' },
    { key: 'determinante', nome: 'Determinante' },
    { key: 'empatia', nome: 'Empatia' },
    { key: 'expressividade', nome: 'Expressividade' },
    { key: 'resiliencia', nome: 'Resiliência' },
    { key: 'proatividade', nome: 'Proatividade' },
    { key: 'espiritualidade', nome: 'Espiritualidade' },
    { key: 'financeiro', nome: 'Liberdade Financeira' },
    { key: 'sinergia', nome: 'Sinergia' },
    { key: 'sexualidade', nome: 'Sexualidade Afetiva' }
  ]

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Banco de Perguntas</h2>
          <p style={styles.pageSubtitle}>Personalize e edite em tempo real as 84 perguntas da avaliação comportamental salvas no Supabase.</p>
        </div>
      </div>

      {avisoSucesso && (
        <div style={styles.alertSucesso}>
          <span style={{ marginRight: '8px' }}>✓</span> {avisoSucesso}
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: 12, color: '#888' }}>Carregando perguntas do Supabase...</p>
        </div>
      ) : (
        <div style={styles.sectionsContainer}>
          {categorias.map((cat, catIdx) => {
            const questoesDaCat = perguntas.slice(catIdx * 7, (catIdx + 1) * 7)
            
            return (
              <div key={cat.key} style={styles.categoryCard}>
                <h3 style={styles.categoryTitle}>{cat.nome}</h3>
                
                <div style={styles.questionsList}>
                  {questoesDaCat.map(q => {
                    const isEditando = editando && editando.numero === q.numero
                    const isSalvando = salvandoId === q.numero

                    return (
                      <div key={q.numero} style={styles.questionRow}>
                        <span style={styles.globalNum}>Q{q.numero}</span>
                        
                        {isEditando ? (
                          <form onSubmit={handleSaveEdit} style={styles.editForm}>
                            <input 
                              style={styles.editInput}
                              value={editando.texto}
                              onChange={e => setEditando({ ...editando, texto: e.target.value })}
                              required
                              autoFocus
                              disabled={isSalvando}
                            />
                            <div style={styles.editFormActions}>
                              <button type="submit" disabled={isSalvando} style={styles.btnSalvarInline}>
                                {isSalvando ? 'Salvando...' : 'Salvar'}
                              </button>
                              <button type="button" disabled={isSalvando} onClick={() => setEditando(null)} style={styles.btnCancelarInline}>
                                Cancelar
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <span 
                              style={styles.questionText} 
                              onClick={() => setEditando({ numero: q.numero, texto: q.texto })}
                              title="Clique para editar o texto desta pergunta"
                            >
                              {q.texto}
                            </span>
                            <button 
                              onClick={() => setEditando({ numero: q.numero, texto: q.texto })} 
                              style={styles.btnEditar}
                            >
                              Editar
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
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
  alertSucesso: {
    background: '#E8F5E9',
    border: '1px solid #C8E6C9',
    color: '#2E7D32',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '24px',
    animation: 'fadeIn 0.3s ease',
  },
  sectionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  categoryCard: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '24px 28px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
  categoryTitle: {
    fontSize: '18px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    borderBottom: '1.5px solid #C9A84C',
    paddingBottom: '8px',
    marginBottom: '18px',
    fontWeight: 'bold',
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  questionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#FAF9F6',
    border: '1px solid #E5E7EB',
    borderRadius: '10px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  globalNum: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#C9A84C',
    fontFamily: 'monospace',
    background: 'rgba(201, 168, 76, 0.12)',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  questionText: {
    fontSize: '14px',
    color: '#0D1B3E',
    flex: 1,
    minWidth: '280px',
    cursor: 'pointer',
    padding: '4px 0',
    transition: 'color 0.2s',
    ':hover': {
      color: '#C9A84C'
    }
  },
  btnEditar: {
    padding: '6px 14px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
    minWidth: '280px',
  },
  editInput: {
    padding: '10px 14px',
    border: '1px solid #C9A84C',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    width: '100%',
  },
  editFormActions: {
    display: 'flex',
    gap: '8px',
  },
  btnSalvarInline: {
    padding: '6px 14px',
    background: '#2E7D32',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnCancelarInline: {
    padding: '6px 14px',
    background: '#fff',
    color: '#666',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: 'bold',
    cursor: 'pointer',
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
  }
}

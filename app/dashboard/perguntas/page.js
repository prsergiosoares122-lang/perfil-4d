'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PERGUNTAS, BLOCOS, NOMES } from '@/lib/perguntas'

export default function PerguntasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [perguntasState, setPerguntasState] = useState({})
  const [avisoSucesso, setAvisoSucesso] = useState('')
  const [editando, setEditando] = useState(null) // { categoria, index, valor }

  useEffect(() => {
    verificarAuth()
    carregarPerguntas()
  }, [])

  async function verificarAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/login')
  }

  function carregarPerguntas() {
    setLoading(true)
    const salvas = localStorage.getItem('perfil4d_perguntas_customizadas')
    if (salvas) {
      try {
        setPerguntasState(JSON.parse(salvas))
      } catch (e) {
        console.error(e)
        setPerguntasState(JSON.parse(JSON.stringify(PERGUNTAS)))
      }
    } else {
      setPerguntasState(JSON.parse(JSON.stringify(PERGUNTAS)))
    }
    setLoading(false)
  }

  const handleEditClick = (categoria, index, valorAtual) => {
    setEditando({ categoria, index, valor: valorAtual })
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editando) return

    const copia = JSON.parse(JSON.stringify(perguntasState))
    copia[editando.categoria][editando.index] = editando.valor

    setPerguntasState(copia)
    localStorage.setItem('perfil4d_perguntas_customizadas', JSON.stringify(copia))
    setEditando(null)
    dispararSucesso('Pergunta atualizada e salva com sucesso!')
  }

  const handleResetPadrao = () => {
    if (confirm('Tem certeza de que deseja redefinir todas as perguntas para o padrão original de fábrica? Isso apagará suas edições personalizadas.')) {
      localStorage.removeItem('perfil4d_perguntas_customizadas')
      setPerguntasState(JSON.parse(JSON.stringify(PERGUNTAS)))
      dispararSucesso('Perguntas restauradas para o padrão com sucesso!')
    }
  }

  const dispararSucesso = (msg) => {
    setAvisoSucesso(msg)
    setTimeout(() => {
      setAvisoSucesso('')
    }, 3000)
  }

  const categoriasOrdem = [...BLOCOS.bloco1, ...BLOCOS.bloco2]

  let globalIndex = 0

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Banco de Perguntas</h2>
          <p style={styles.pageSubtitle}>Personalize o texto das 84 perguntas clínicas que constituem a análise do Perfil 4D.</p>
        </div>
        <button onClick={handleResetPadrao} style={styles.btnReset}>
          Resetar Padrões
        </button>
      </div>

      {avisoSucesso && (
        <div style={styles.alertSucesso}>
          <span style={{ marginRight: '8px' }}>✓</span> {avisoSucesso}
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={{ marginTop: 12, color: '#888' }}>Carregando perguntas...</p>
        </div>
      ) : (
        <div style={styles.sectionsContainer}>
          {categoriasOrdem.map(categoria => {
            const list = perguntasState[categoria] || []
            const nomeCat = NOMES[categoria] || categoria
            
            return (
              <div key={categoria} style={styles.categoryCard}>
                <h3 style={styles.categoryTitle}>{nomeCat}</h3>
                
                <div style={styles.questionsList}>
                  {list.map((texto, idx) => {
                    globalIndex++
                    const isEditandoEsta = editando && editando.categoria === categoria && editando.index === idx

                    return (
                      <div key={idx} style={styles.questionRow}>
                        <span style={styles.globalNum}>Q{globalIndex}</span>
                        
                        {isEditandoEsta ? (
                          <form onSubmit={handleSaveEdit} style={styles.editForm}>
                            <input 
                              style={styles.editInput}
                              value={editando.valor}
                              onChange={e => setEditando({ ...editando, valor: e.target.value })}
                              required
                              autoFocus
                            />
                            <div style={styles.editFormActions}>
                              <button type="submit" style={styles.btnSalvarInline}>Salvar</button>
                              <button type="button" onClick={() => setEditando(null)} style={styles.btnCancelarInline}>Cancelar</button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <span style={styles.questionText}>{texto}</span>
                            <button 
                              onClick={() => handleEditClick(categoria, idx, texto)} 
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
  btnReset: {
    padding: '12px 20px',
    background: '#fff',
    color: '#D32F2F',
    border: '1px solid #FFCDD2',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
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

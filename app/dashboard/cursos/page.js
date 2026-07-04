'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CursosPage() {
  const router = useRouter()
  const [filtro, setFiltro] = useState('todos')
  const [autorizado, setAutorizado] = useState(false)

  useEffect(() => {
    verificarAuth()
  }, [])

  async function verificarAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    const email = session.user.email.toLowerCase()

    const { data } = await supabase
      .from('casais')
      .select('plano')
      .eq('nome_esposa', email)
      .limit(1)

    let userPlano = ''
    if (data && data[0]) {
      userPlano = data[0].plano || ''
    }

    const isAdmin = email === 'prsergiosoares122@gmail.com' ||
                    email === 'thiago.medeiros@perfil4d.com' ||
                    email === 'sergio.soares@perfil4d.com' ||
                    email === 'sergio@email.com' ||
                    email === 'pr_sergiosoares@hotmail.com' ||
                    email.includes('admin') ||
                    userPlano.startsWith('super_admin')

    if (!isAdmin) {
      router.push('/dashboard')
    } else {
      setAutorizado(true)
    }
  }
  
  // Lista de cursos com aulas aninhadas
  const [cursos, setCursos] = useState([
    {
      id: 1,
      titulo: 'Formação de Analista Perfil 4D',
      descricao: 'Domine a metodologia clínica, a interpretação das 12 dinâmicas comportamentais e conduza sessões de devolutiva de alto impacto.',
      progresso: 65,
      status: 'andamento',
      gradient: 'linear-gradient(135deg, #0D1B3E 0%, #1c356e 100%)',
      emoji: '🎓',
      aulas: [
        { id: 101, titulo: 'Introdução à Metodologia 4D' },
        { id: 102, titulo: 'Leitura de Gráficos e Vetores' },
        { id: 103, titulo: 'A Devolutiva Clínica na Prática' }
      ]
    },
    {
      id: 2,
      titulo: 'Psicanálise Conjugal e Terapia Familiar',
      descricao: 'Aprofunde seus estudos sobre as teorias psicanalíticas aplicadas às dinâmicas e crises do casamento contemporâneo.',
      progresso: 30,
      status: 'andamento',
      gradient: 'linear-gradient(135deg, #6A1B9A 0%, #a23cd9 100%)',
      emoji: '🧠',
      aulas: [
        { id: 201, titulo: 'Teoria das Relações Objetais' },
        { id: 202, titulo: 'O Inconsciente Conjugal' }
      ]
    },
    {
      id: 3,
      titulo: 'Introdução ao Perfil 4D',
      descricao: 'Visão geral da ferramenta Perfil 4D, aplicação dos questionários e primeiros passos para a leitura dos relatórios.',
      progresso: 100,
      status: 'concluido',
      gradient: 'linear-gradient(135deg, #2E7D32 0%, #4eae52 100%)',
      emoji: '📚',
      aulas: [
        { id: 301, titulo: 'O que é o Perfil 4D' },
        { id: 302, titulo: 'Como Enviar os Links de Acesso' }
      ]
    }
  ])

  // Modais
  const [modalCursoAberto, setModalCursoAberto] = useState(false)
  const [modalAulaAberto, setModalAulaAberto] = useState(false)
  const [cursoSelecionado, setCursoSelecionado] = useState(null)

  // Estados dos formulários
  const [novoTituloCurso, setNovoTituloCurso] = useState('')
  const [novaDescCurso, setNovaDescCurso] = useState('')
  const [novoTituloAula, setNovoTituloAula] = useState('')

  const handleAddCurso = (e) => {
    e.preventDefault()
    if (!novoTituloCurso) return
    const novo = {
      id: Date.now(),
      titulo: novoTituloCurso,
      descricao: novaDescCurso || 'Sem descrição informada.',
      progresso: 0,
      status: 'andamento',
      gradient: 'linear-gradient(135deg, #0D1B3E 0%, #3e568d 100%)',
      emoji: '📚',
      aulas: []
    }
    setCursos(prev => [...prev, novo])
    setNovoTituloCurso('')
    setNovaDescCurso('')
    setModalCursoAberto(false)
  }

  const handleDeletarCurso = (id, e) => {
    e.stopPropagation() // impede de abrir detalhes
    if (confirm('Tem certeza que deseja remover este curso permanentemente?')) {
      setCursos(prev => prev.filter(c => c.id !== id))
    }
  }

  const abrirDetalhesCurso = (curso) => {
    setCursoSelecionado(curso)
    setModalAulaAberto(true)
  }

  const handleAddAula = (e) => {
    e.preventDefault()
    if (!novoTituloAula || !cursoSelecionado) return
    
    const novaAula = {
      id: Date.now(),
      titulo: novoTituloAula
    }

    setCursos(prev => prev.map(c => {
      if (c.id === cursoSelecionado.id) {
        const atualizadas = [...c.aulas, novaAula]
        // recalculamos progresso fictício para ilustrar
        const prog = Math.min(100, Math.round((atualizadas.length / 5) * 100))
        return {
          ...c,
          aulas: atualizadas,
          progresso: prog,
          status: prog === 100 ? 'concluido' : 'andamento'
        }
      }
      return c
    }))

    // atualizar referência no modal
    setCursoSelecionado(prev => ({
      ...prev,
      aulas: [...prev.aulas, novaAula]
    }))
    setNovoTituloAula('')
  }

  const handleDeletarAula = (aulaId) => {
    if (!cursoSelecionado) return
    
    setCursos(prev => prev.map(c => {
      if (c.id === cursoSelecionado.id) {
        const atualizadas = c.aulas.filter(a => a.id !== aulaId)
        const prog = Math.min(100, Math.round((atualizadas.length / 5) * 100))
        return {
          ...c,
          aulas: atualizadas,
          progresso: prog,
          status: prog === 100 ? 'concluido' : 'andamento'
        }
      }
      return c
    }))

    setCursoSelecionado(prev => ({
      ...prev,
      aulas: prev.aulas.filter(a => a.id !== aulaId)
    }))
  }

  const cursosFiltrados = cursos.filter(c => {
    if (filtro === 'todos') return true
    return c.status === filtro
  })

  if (!autorizado) return null

  return (
    <div style={styles.container}>
      {/* Top Header Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Cursos</h2>
          <p style={styles.pageSubtitle}>Acesse seus treinamentos, materiais de estudo e aperfeiçoe sua prática clínica.</p>
        </div>
        <button onClick={() => setModalCursoAberto(true)} style={styles.btnAdicionar}>
          + Adicionar Curso
        </button>
      </div>

      {/* Filters Bar */}
      <div style={styles.filtersBar}>
        <button 
          onClick={() => setFiltro('todos')} 
          style={{ ...styles.btnFiltro, ...(filtro === 'todos' ? styles.btnFiltroAtivo : {}) }}
        >
          Todos os Cursos
        </button>
        <button 
          onClick={() => setFiltro('andamento')} 
          style={{ ...styles.btnFiltro, ...(filtro === 'andamento' ? styles.btnFiltroAtivo : {}) }}
        >
          Em Andamento
        </button>
        <button 
          onClick={() => setFiltro('concluido')} 
          style={{ ...styles.btnFiltro, ...(filtro === 'concluido' ? styles.btnFiltroAtivo : {}) }}
        >
          Concluídos
        </button>
      </div>

      {/* Course Grid Layout */}
      {cursosFiltrados.length === 0 ? (
        <div style={styles.vazio}>Nenhum curso encontrado nesta categoria.</div>
      ) : (
        <div style={styles.grid}>
          {cursosFiltrados.map(curso => (
            <div key={curso.id} onClick={() => abrirDetalhesCurso(curso)} style={styles.card}>
              {/* Illustrative Banner */}
              <div style={{ ...styles.banner, background: curso.gradient }}>
                <span style={styles.bannerEmoji}>{curso.emoji}</span>
              </div>

              {/* Content */}
              <div style={styles.cardContent}>
                <div style={styles.cardHeaderRow}>
                  <span style={styles.cardBadge}>Curso</span>
                  <button onClick={(e) => handleDeletarCurso(curso.id, e)} style={styles.btnDeleteTrash} title="Excluir Curso">
                    🗑️
                  </button>
                </div>

                <h3 style={styles.cardTitle}>{curso.titulo}</h3>
                <p style={styles.cardDesc}>{curso.descricao}</p>

                {/* Progress Section */}
                <div style={styles.progressContainer}>
                  <div style={styles.progressBarBg}>
                    <div style={{ ...styles.progressBarFill, width: `${curso.progresso}%` }} />
                  </div>
                  <span style={styles.progressLabel}>
                    {curso.progresso === 100 ? 'Concluído' : `${curso.progresso}% concluído`} • {curso.aulas ? curso.aulas.length : 0} aulas
                  </span>
                </div>

                {/* Card Button Action */}
                <button 
                  style={{
                    ...styles.btnCardAction,
                    ...(curso.progresso === 100 ? styles.btnCardActionDone : {})
                  }}
                >
                  {curso.progresso === 100 ? 'Rever Conteúdo' : 'Gerenciar Conteúdo'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Adicionar Curso */}
      {modalCursoAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Adicionar Novo Curso</h3>
              <button onClick={() => setModalCursoAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            <form onSubmit={handleAddCurso} style={styles.modalForm}>
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Título do Curso *</label>
                <input 
                  style={styles.modalInput} 
                  value={novoTituloCurso} 
                  onChange={e => setNovoTituloCurso(e.target.value)} 
                  placeholder="Ex: Formação Continuada de Casais" 
                  required 
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Descrição</label>
                <textarea 
                  style={{ ...styles.modalInput, height: '80px', resize: 'none' }} 
                  value={novaDescCurso} 
                  onChange={e => setNovaDescCurso(e.target.value)} 
                  placeholder="Resumo do conteúdo programático..." 
                />
              </div>

              <button type="submit" style={styles.btnModalSalvar}>
                Criar Curso
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Conteúdo do Curso (Aulas) */}
      {modalAulaAberto && cursoSelecionado && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardLarge}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>{cursoSelecionado.titulo}</h3>
                <p style={styles.modalSubtitleDesc}>{cursoSelecionado.descricao}</p>
              </div>
              <button onClick={() => setModalAulaAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>

            <div style={styles.modalSplitGrid}>
              {/* Listagem de Aulas */}
              <div style={styles.lessonsCol}>
                <h4 style={styles.lessonsHeaderTitle}>Aulas Cadastradas</h4>
                
                {cursoSelecionado.aulas.length === 0 ? (
                  <div style={styles.noLessonsBox}>Nenhuma aula cadastrada ainda. Adicione a primeira à direita.</div>
                ) : (
                  <div style={styles.lessonsList}>
                    {cursoSelecionado.aulas.map((aula, index) => (
                      <div key={aula.id} style={styles.lessonRow}>
                        <div>
                          <span style={styles.lessonIndex}>Aula {index + 1}</span>
                          <span style={styles.lessonTitle}>{aula.titulo}</span>
                        </div>
                        <button onClick={() => handleDeletarAula(aula.id)} style={styles.btnDeleteLesson} title="Remover Aula">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form de Nova Aula */}
              <div style={styles.addLessonCol}>
                <h4 style={styles.lessonsHeaderTitle}>+ Nova Aula</h4>
                <form onSubmit={handleAddAula} style={styles.modalForm}>
                  <div style={styles.modalGrupo}>
                    <label style={styles.modalLabel}>Título da Aula</label>
                    <input 
                      style={styles.modalInput} 
                      value={novoTituloAula} 
                      onChange={e => setNovoTituloAula(e.target.value)} 
                      placeholder="Ex: Teoria de Freud aplicada" 
                      required 
                    />
                  </div>
                  <button type="submit" style={styles.btnModalSalvar}>
                    Adicionar Aula
                  </button>
                </form>
              </div>
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
  btnAdicionar: {
    padding: '12px 24px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(13,27,62,0.15)',
    transition: 'all 0.2s',
  },
  filtersBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '12px',
  },
  btnFiltro: {
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
    color: '#6B7280',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s',
    borderBottom: '2px solid transparent',
  },
  btnFiltroAtivo: {
    color: '#0D1B3E',
    fontWeight: 'bold',
    borderBottom: '2px solid #C9A84C',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  },
  card: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  banner: {
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerEmoji: {
    fontSize: '48px',
  },
  cardContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexGrow: 1,
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    letterSpacing: '0.5px',
  },
  btnDeleteTrash: {
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: '1',
  },
  cardTitle: {
    fontSize: '18px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    margin: 0,
    fontWeight: 'bold',
    lineHeight: '1.4',
  },
  cardDesc: {
    fontSize: '13.5px',
    color: '#6B7280',
    lineHeight: '1.6',
    margin: 0,
    flexGrow: 1,
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '10px',
  },
  progressBarBg: {
    height: '6px',
    background: '#E5E7EB',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: '#C9A84C',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
  },
  btnCardAction: {
    marginTop: '16px',
    padding: '12px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(13,27,62,0.1)',
  },
  btnCardActionDone: {
    background: '#FAF9F6',
    color: '#0D1B3E',
    border: '1px solid #e0d8cc',
    boxShadow: 'none',
  },
  vazio: {
    textAlign: 'center',
    padding: '60px',
    color: '#888',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  },

  // Modais
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    maxWidth: '460px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid #e8e0d4',
    margin: '20px',
  },
  modalCardLarge: {
    background: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '720px',
    padding: '32px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    border: '1px solid #e8e0d4',
    margin: '20px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    borderBottom: '1px solid #f0ebe3',
    paddingBottom: '14px',
  },
  modalTitle: {
    fontSize: '18px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    fontWeight: 'normal',
    margin: 0,
  },
  modalSubtitleDesc: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '6px 0 0 0',
    lineHeight: '1.4',
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
  },
  btnModalSalvar: {
    padding: '14px',
    background: '#0D1B3E',
    color: '#C9A84C',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(13,27,62,0.1)',
  },

  // Modal split Layout
  modalSplitGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '28px',
    '@media(max-width: 600px)': {
      gridTemplateColumns: '1fr',
    }
  },
  lessonsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  addLessonCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: '#FAF9F6',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  },
  lessonsHeaderTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0D1B3E',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  noLessonsBox: {
    padding: '30px',
    textAlign: 'center',
    color: '#888',
    background: '#FAF9F6',
    border: '1px dashed #D1D5DB',
    borderRadius: '8px',
    fontSize: '13.5px',
  },
  lessonsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '260px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  lessonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
  },
  lessonIndex: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#C9A84C',
    textTransform: 'uppercase',
    marginRight: '12px',
  },
  lessonTitle: {
    fontSize: '13.5px',
    color: '#0D1B3E',
    fontWeight: '500',
  },
  btnDeleteLesson: {
    background: 'transparent',
    border: 'none',
    fontSize: '13px',
    color: '#EF4444',
    cursor: 'pointer',
    fontWeight: 'bold',
    padding: '4px',
  }
}

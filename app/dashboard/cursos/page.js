'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCustomSession } from '@/lib/supabase'

export default function CursosPage() {
  const router = useRouter()
  const [cursos, setCursos] = useState([
    { id: 1, titulo: 'Formação de Analista Perfil 4D', descricao: 'Domine a metodologia clínica...', progresso: 65, gradient: 'linear-gradient(135deg, #0D1B3E 0%, #1c356e 100%)', emoji: '🎓', aulas: [] }
  ])
  const [modalCursoAberto, setModalCursoAberto] = useState(false)
  const [modalAulaAberto, setModalAulaAberto] = useState(false)
  const [cursoSelecionado, setCursoSelecionado] = useState(null)
  const [novoTituloCurso, setNovoTituloCurso] = useState('')
  const [novaDescCurso, setNovaDescCurso] = useState('')
  const [novoTituloAula, setNovoTituloAula] = useState('')
  const [novoLinkAula, setNovoLinkAula] = useState('')
  const [novaDescAula, setNovaDescAula] = useState('')

  // Lógicas
  const handleAddCurso = (e) => {
    e.preventDefault()
    setCursos(prev => [...prev, { id: Date.now(), titulo: novoTituloCurso, descricao: novaDescCurso, aulas: [] }])
    setModalCursoAberto(false)
    setNovoTituloCurso('')
  }

  const handleAddAula = (e) => {
    e.preventDefault()
    setCursos(prev => prev.map(c => c.id === cursoSelecionado.id ? { ...c, aulas: [...c.aulas, { id: Date.now(), titulo: novoTituloAula, link: novoLinkAula, desc: novaDescAula }] } : c))
    setCursoSelecionado(prev => ({ ...prev, aulas: [...prev.aulas, { id: Date.now(), titulo: novoTituloAula, link: novoLinkAula, desc: novaDescAula }] }))
    setNovoTituloAula(''); setNovoLinkAula(''); setNovaDescAula('')
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h2 style={styles.pageTitle}>Cursos</h2>
        <button onClick={() => setModalCursoAberto(true)} style={styles.btnAdicionar}>+ Adicionar Curso</button>
      </div>

      <div style={styles.grid}>
        {cursos.map(curso => (
          <div key={curso.id} onClick={() => { setCursoSelecionado(curso); setModalAulaAberto(true); }} style={styles.card}>
            <div style={{ ...styles.banner, background: curso.gradient }}><span style={styles.bannerEmoji}>{curso.emoji}</span></div>
            <div style={styles.cardContent}><h3>{curso.titulo}</h3></div>
          </div>
        ))}
      </div>

      {modalCursoAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <form onSubmit={handleAddCurso}>
              <input value={novoTituloCurso} onChange={e => setNovoTituloCurso(e.target.value)} placeholder="Título do Curso" required />
              <button type="submit">Criar Curso</button>
              <button onClick={() => setModalCursoAberto(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {modalAulaAberto && cursoSelecionado && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardLarge}>
            <button onClick={() => setModalAulaAberto(false)}>Fechar</button>
            <h3>{cursoSelecionado.titulo}</h3>
            <form onSubmit={handleAddAula}>
              <input value={novoTituloAula} onChange={e => setNovoTituloAula(e.target.value)} placeholder="Título da Aula" required />
              <input value={novoLinkAula} onChange={e => setNovoLinkAula(e.target.value)} placeholder="Link do Vídeo" />
              <textarea value={novaDescAula} onChange={e => setNovaDescAula(e.target.value)} placeholder="Breve descrição" />
              <button type="submit">Adicionar Aula</button>
            </form>
            <div>{cursoSelecionado.aulas.map(a => <div key={a.id}>{a.titulo}</div>)}</div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '40px', background: '#F8F9FA', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  pageTitle: { fontSize: '28px', color: '#0D1B3E' },
  btnAdicionar: { padding: '10px 20px', background: '#0D1B3E', color: '#C9A84C', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
  card: { background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #E5E7EB' },
  banner: { height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardContent: { padding: '20px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalCard: { background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '100%' },
  modalCardLarge: { background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '700px', width: '100%' }
}
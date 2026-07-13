'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCustomSession } from '@/lib/supabase'

export default function CursosPage() {
  const router = useRouter()
  const [filtro, setFiltro] = useState('todos')
  const [autorizado, setAutorizado] = useState(false)
  const [cursos, setCursos] = useState([
    { id: 1, titulo: 'Formação de Analista Perfil 4D', descricao: 'Domine a metodologia...', progresso: 65, status: 'andamento', gradient: 'linear-gradient(135deg, #0D1B3E 0%, #1c356e 100%)', emoji: '🎓', aulas: [] }
  ])
  const [modalCursoAberto, setModalCursoAberto] = useState(false)
  const [modalAulaAberto, setModalAulaAberto] = useState(false)
  const [cursoSelecionado, setCursoSelecionado] = useState(null)
  const [novoTituloAula, setNovoTituloAula] = useState('')
  const [novoLinkAula, setNovoLinkAula] = useState('')
  const [novaDescAula, setNovaDescAula] = useState('')

  useEffect(() => { verificarAuth() }, [])
  async function verificarAuth() { const session = await getCustomSession(); if (!session) { router.push('/login'); return } setAutorizado(true) }

  const handleDeletarCurso = (id, e) => {
    e.stopPropagation()
    if (confirm('Remover curso?')) setCursos(prev => prev.filter(c => c.id !== id))
  }

  const handleDeletarAula = (aulaId) => {
    setCursos(prev => prev.map(c => c.id === cursoSelecionado.id ? { ...c, aulas: c.aulas.filter(a => a.id !== aulaId) } : c))
    setCursoSelecionado(prev => ({ ...prev, aulas: prev.aulas.filter(a => a.id !== aulaId) }))
  }

  const handleAddAula = (e) => {
    e.preventDefault()
    const novaAula = { id: Date.now(), titulo: novoTituloAula, link: novoLinkAula, desc: novaDescAula }
    setCursos(prev => prev.map(c => c.id === cursoSelecionado.id ? { ...c, aulas: [...c.aulas, novaAula] } : c))
    setCursoSelecionado(prev => ({ ...prev, aulas: [...prev.aulas, novaAula] }))
    setNovoTituloAula(''); setNovoLinkAula(''); setNovaDescAula('')
  }

  if (!autorizado) return null

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
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{curso.titulo}</h3>
              <button onClick={(e) => handleDeletarCurso(curso.id, e)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {modalAulaAberto && cursoSelecionado && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCardLarge}>
            <h3>{cursoSelecionado.titulo}</h3>
            <div style={styles.modalSplitGrid}>
              <div style={styles.lessonsCol}>
                {cursoSelecionado.aulas.map((aula, i) => (
                  <div key={aula.id}>{aula.titulo} <button onClick={() => handleDeletarAula(aula.id)}>X</button></div>
                ))}
              </div>
              <div style={styles.addLessonCol}>
                <form onSubmit={handleAddAula}>
                  <input value={novoTituloAula} onChange={e => setNovoTituloAula(e.target.value)} placeholder="Título *" required />
                  <input value={novoLinkAula} onChange={e => setNovoLinkAula(e.target.value)} placeholder="Link Vídeo" />
                  <textarea value={novaDescAula} onChange={e => setNovaDescAula(e.target.value)} placeholder="Descrição" />
                  <button type="submit">Adicionar Aula</button>
                </form>
              </div>
            </div>
            <button onClick={() => setModalAulaAberto(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '40px', background: '#F8F9FA', minHeight: '100vh' },
  topBar: { display: 'flex', justifyContent: 'space-between' },
  grid: { display: 'grid', gap: '30px' },
  card: { background: '#fff', padding: '20px', cursor: 'pointer' },
  banner: { height: '140px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalCardLarge: { background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '700px', width: '100%' },
  modalSplitGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }
}
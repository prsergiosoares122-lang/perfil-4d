'use client'
import { useState } from 'react'

export default function CursosPage() {
  const [cursos, setCursos] = useState([])
  const [modalCursoAberto, setModalCursoAberto] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novoLinkImagem, setNovoLinkImagem] = useState('')

  const handleAddCurso = (e) => {
    e.preventDefault()
    setCursos(prev => [...prev, { id: Date.now(), titulo: novoTitulo, capa: novoLinkImagem }])
    setModalCursoAberto(false)
    setNovoTitulo(''); setNovoLinkImagem('')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Cursos</h2>
        <button onClick={() => setModalCursoAberto(true)} style={styles.btnPrimary}>+ Adicionar Curso</button>
      </div>

      <div style={styles.grid}>
        {cursos.map(curso => (
          <div key={curso.id} style={styles.card}>
            <img src={curso.capa || 'https://via.placeholder.com/400x200'} alt="Capa" style={styles.capa} />
            <div style={styles.cardInfo}>
              <h3 style={styles.cardTitle}>{curso.titulo}</h3>
            </div>
          </div>
        ))}
      </div>

      {modalCursoAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Adicionar Curso</h3>
            <form onSubmit={handleAddCurso} style={styles.form}>
              <input value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} placeholder="Título do Curso" required />
              <input value={novoLinkImagem} onChange={e => setNovoLinkImagem(e.target.value)} placeholder="Cole o link da imagem aqui" />
              <button type="submit">Salvar</button>
              <button type="button" onClick={() => setModalCursoAberto(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '28px', color: '#0D1B3E' },
  btnPrimary: { padding: '10px 20px', background: '#0D1B3E', color: '#C9A84C', borderRadius: '8px', cursor: 'pointer', border: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', background: '#fff' },
  capa: { width: '100%', height: '200px', objectFit: 'cover' },
  cardInfo: { padding: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' }
}
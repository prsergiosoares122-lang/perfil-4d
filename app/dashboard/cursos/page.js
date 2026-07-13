'use client'
import { useState } from 'react'

export default function CursosPage() {
  const [modalAberto, setModalAberto] = useState(false)
  const [cursos, setCursos] = useState([]) // Lista de cursos
  const [novoTitulo, setNovoTitulo] = useState('')

  const salvarCurso = (e) => {
    e.preventDefault()
    setCursos([...cursos, { id: Date.now(), titulo: novoTitulo }])
    setNovoTitulo('')
    setModalAberto(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h2 style={styles.pageTitle}>Cursos</h2>
        <button onClick={() => setModalAberto(true)} style={styles.btnAdicionar}>+ Adicionar Curso</button>
      </div>

      {/* LISTA DE CURSOS */}
      <div style={styles.grid}>
        {cursos.map(curso => (
          <div key={curso.id} style={styles.card}>
            <h3>{curso.titulo}</h3>
            <button style={styles.btnGerenciar}>Gerenciar Conteúdo</button>
          </div>
        ))}
      </div>

      {/* MODAL ADICIONAR CURSO */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Adicionar Novo Curso</h3>
              <button onClick={() => setModalAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            <form style={styles.modalForm} onSubmit={salvarCurso}>
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>TÍTULO DO CURSO *</label>
                <input style={styles.modalInput} value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} placeholder="Ex: Formação de Analista Perfil 4D" required />
              </div>
              <button type="submit" style={styles.btnModalSalvar}>Salvar Curso</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '40px', background: '#F8F9FA', minHeight: '100vh', fontFamily: '"Outfit", sans-serif' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' },
  pageTitle: { fontSize: '28px', color: '#0D1B3E', margin: 0 },
  btnAdicionar: { padding: '12px 24px', background: '#0D1B3E', color: '#C9A84C', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  btnGerenciar: { marginTop: '15px', padding: '8px', width: '100%', background: '#F0F2F5', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13,27,62,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '24px' },
  modalTitle: { fontSize: '18px', color: '#0D1B3E', margin: 0 },
  modalFecharBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  modalGrupo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  modalLabel: { fontSize: '12px', fontWeight: 'bold', color: '#0D1B3E', textTransform: 'uppercase' },
  modalInput: { padding: '12px 14px', border: '1px solid #e0d8cc', borderRadius: '8px', background: '#FAFAFA' },
  btnModalSalvar: { padding: '14px', background: '#0D1B3E', color: '#C9A84C', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
}
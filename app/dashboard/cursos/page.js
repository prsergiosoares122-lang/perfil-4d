'use client'
import { useState } from 'react'

export default function CursosPage() {
  const [modalAberto, setModalAberto] = useState(false)
  const [cursoSelecionado, setCursoSelecionado] = useState(null)
  const [cursos, setCursos] = useState([])

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <h2 style={styles.pageTitle}>Cursos</h2>
        <button onClick={() => setModalAberto(true)} style={styles.btnAdicionar}>+ Adicionar Curso</button>
      </div>

      {/* MODAL ADICIONAR CURSO */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Adicionar Novo Curso</h3>
              <button onClick={() => setModalAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            <form style={styles.modalForm} onSubmit={(e) => { e.preventDefault(); setModalAberto(false); }}>
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>TÍTULO DO CURSO *</label>
                <input style={styles.modalInput} placeholder="Ex: Formação de Analista Perfil 4D" required />
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
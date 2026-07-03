'use client'
import { useState } from 'react'

export default function TutorialPage() {
  const [modalAberto, setModalAberto] = useState(false)
  const [tutoriais, setTutoriais] = useState([])
  const [titulo, setTitulo] = useState('')
  const [link, setLink] = useState('')
  const [descricao, setDescricao] = useState('')

  const handleAddTutorial = (e) => {
    e.preventDefault()
    if (!titulo) return
    setTutoriais(prev => [
      ...prev,
      { id: Date.now(), titulo, link, descricao }
    ])
    setTitulo('')
    setLink('')
    setDescricao('')
    setModalAberto(false)
  }

  return (
    <div style={styles.container}>
      {/* Top Header Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Tutoriais e Guia de Uso</h2>
          <p style={styles.pageSubtitle}>Consulte treinamentos, manuais clínicos e vídeos auxiliares de interpretação.</p>
        </div>
        <button onClick={() => setModalAberto(true)} style={styles.btnNovo}>
          + Adicionar Tutorial
        </button>
      </div>

      {/* Central Content Area */}
      {tutoriais.length === 0 ? (
        <div style={styles.dashedContainer}>
          <div style={styles.bookIcon}>📖</div>
          <h4 style={styles.emptyTitle}>Nenhum tutorial disponível no momento</h4>
          <p style={styles.emptySubtitle}>Estamos preparando materiais incríveis para você decolar na sua clínica.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {tutoriais.map(t => (
            <div key={t.id} style={styles.card}>
              <span style={styles.cardBadge}>Tutorial</span>
              <h3 style={styles.cardTitle}>{t.titulo}</h3>
              <p style={styles.cardDesc}>{t.descricao || 'Sem descrição informada.'}</p>
              {t.link && (
                <a href={t.link} target="_blank" rel="noopener noreferrer" style={styles.btnCardLink}>
                  Acessar Conteúdo →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Tutorial Modal */}
      {modalAberto && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Adicionar Novo Tutorial</h3>
              <button onClick={() => setModalAberto(false)} style={styles.modalFecharBtn}>✕</button>
            </div>
            <form onSubmit={handleAddTutorial} style={styles.modalForm}>
              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Título do Tutorial *</label>
                <input 
                  style={styles.modalInput} 
                  value={titulo} 
                  onChange={e => setTitulo(e.target.value)} 
                  placeholder="Ex: Como aplicar a Devolutiva do Perfil 4D" 
                  required 
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Link do Vídeo / Artigo</label>
                <input 
                  style={styles.modalInput} 
                  value={link} 
                  onChange={e => setLink(e.target.value)} 
                  placeholder="https://youtube.com/watch?v=..." 
                />
              </div>

              <div style={styles.modalGrupo}>
                <label style={styles.modalLabel}>Breve Descrição</label>
                <textarea 
                  style={{ ...styles.modalInput, height: '80px', resize: 'none' }} 
                  value={descricao} 
                  onChange={e => setDescricao(e.target.value)} 
                  placeholder="Explique resumidamente o objetivo deste material..." 
                />
              </div>

              <button type="submit" style={styles.btnModalSalvar}>
                Salvar Tutorial
              </button>
            </form>
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
  btnNovo: {
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
  dashedContainer: {
    background: '#fff',
    border: '2px dashed #D1D5DB',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    maxWidth: '720px',
    margin: '40px auto 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  bookIcon: {
    fontSize: '44px',
    color: '#9CA3AF',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontSize: '18px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    margin: 0,
    fontWeight: 'normal',
  },
  emptySubtitle: {
    fontSize: '13.5px',
    color: '#6B7280',
    lineHeight: '1.6',
    margin: 0,
    maxWidth: '420px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
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
    alignSelf: 'flex-start',
    letterSpacing: '0.5px',
  },
  cardTitle: {
    fontSize: '16px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    margin: 0,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: '13.5px',
    color: '#6B7280',
    lineHeight: '1.6',
    margin: 0,
  },
  btnCardLink: {
    marginTop: '8px',
    fontSize: '13.5px',
    color: '#C9A84C',
    fontWeight: 'bold',
    textDecoration: 'none',
    alignSelf: 'flex-start',
  },

  // Modal styles
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
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #f0ebe3',
    paddingBottom: '14px',
  },
  modalTitle: {
    fontSize: '18px',
    color: '#0D1B3E',
    fontFamily: 'Georgia, serif',
    fontWeight: 'normal',
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
    marginTop: '10px',
  },
}

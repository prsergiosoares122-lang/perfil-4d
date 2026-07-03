'use client'
import { useState } from 'react'

export default function CursosPage() {
  const [filtro, setFiltro] = useState('todos')
  const [cursos, setCursos] = useState([
    {
      id: 1,
      titulo: 'Formação de Analista Perfil 4D',
      descricao: 'Domine a metodologia clínica, a interpretação das 12 dinâmicas comportamentais e conduza sessões de devolutiva de alto impacto.',
      progresso: 65,
      status: 'andamento',
      gradient: 'linear-gradient(135deg, #0D1B3E 0%, #1c356e 100%)',
      emoji: '🎓'
    },
    {
      id: 2,
      titulo: 'Psicanálise Conjugal e Terapia Familiar',
      descricao: 'Aprofunde seus estudos sobre as teorias psicanalíticas aplicadas às dinâmicas e crises do casamento contemporâneo.',
      progresso: 30,
      status: 'andamento',
      gradient: 'linear-gradient(135deg, #6A1B9A 0%, #a23cd9 100%)',
      emoji: '🧠'
    },
    {
      id: 3,
      titulo: 'Introdução ao Perfil 4D',
      descricao: 'Visão geral da ferramenta Perfil 4D, aplicação dos questionários e primeiros passos para a leitura dos relatórios.',
      progresso: 100,
      status: 'concluido',
      gradient: 'linear-gradient(135deg, #2E7D32 0%, #4eae52 100%)',
      emoji: '📚'
    }
  ])

  const cursosFiltrados = cursos.filter(c => {
    if (filtro === 'todos') return true
    return c.status === filtro
  })

  return (
    <div style={styles.container}>
      {/* Top Header Bar */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>Cursos</h2>
          <p style={styles.pageSubtitle}>Acesse seus treinamentos, materiais de estudo e aperfeiçoe sua prática clínica.</p>
        </div>
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
            <div key={curso.id} style={styles.card}>
              {/* Illustrative Banner */}
              <div style={{ ...styles.banner, background: curso.gradient }}>
                <span style={styles.bannerEmoji}>{curso.emoji}</span>
              </div>

              {/* Content */}
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{curso.titulo}</h3>
                <p style={styles.cardDesc}>{curso.descricao}</p>

                {/* Progress Section */}
                <div style={styles.progressContainer}>
                  <div style={styles.progressBarBg}>
                    <div style={{ ...styles.progressBarFill, width: `${curso.progresso}%` }} />
                  </div>
                  <span style={styles.progressLabel}>
                    {curso.progresso === 100 ? 'Concluído' : `${curso.progresso}% concluído`}
                  </span>
                </div>

                {/* Card Button Action */}
                <button 
                  onClick={() => alert(`Acessando o curso: ${curso.titulo}`)} 
                  style={{
                    ...styles.btnCardAction,
                    ...(curso.progresso === 100 ? styles.btnCardActionDone : {})
                  }}
                >
                  {curso.progresso === 100 ? 'Rever Conteúdo' : 'Continuar Curso'}
                </button>
              </div>
            </div>
          ))}
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
    marginBottom: '36px',
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
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
  }
}
